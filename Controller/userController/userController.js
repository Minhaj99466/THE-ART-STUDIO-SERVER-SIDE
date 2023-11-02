import User from "../../Model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Token from "../../Model/token.js";
import sendMail from "../../utils/sendMail.js";
import crypto from "crypto";
import Artist from "../../Model/artistModel.js";
import Booking from "../../Model/bookingModel.js";
import moment from "moment";
import { env } from "process";
import { Stripe } from "stripe";

export const allArtists = async (req, res) => {
  try {
    const Artists = await Artist.find({ is_Confirm: true });
    if (!Artists) {
      return res.status(400).json({ message: "no artist here" });
    }

    return res.status(200).json({ Artists });
  } catch (error) {
    console.log(error);
  }
};

export const singleArtistDetails = async (req, res) => {
  try {
    const ArtistData = await Artist.findOne({
      _id: req.params.id,
      is_Confirm: true,
    });
    if (!ArtistData) {
      return res.status(401).res.json({ message: "No Artist Found" });
    }
    return res.status(200).json(ArtistData);
  } catch (error) {
    console.log(error);
  }
};
export const suggestArtist = async (req, res) => {
  try {
    const { category } = await Artist.findOne(
      { _id: req.params.id },
      { category: 1, _id: 0 }
    );
    const ArtistData = await Artist.find({
      _id: { $ne: req.params.id },
      is_Confirm: true,
      category,
    }).limit(3);

    if (!ArtistData) {
      return res.status(401).res.json({ message: "No Artist Found" });
    }
    return res.status(200).json(ArtistData);
  } catch (error) {
    console.log(error);
  }
};
export const filteredData = async (req, res) => {
  try {
    const category = req.params.category;
    const search = req.params.search;
    const value = req.params.value;
    const page = (value - 1) * 6;
    let query = {};

    if (category != "All") {
      query.category = category;
    }
    if (search != 0) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { place: { $regex: search, $options: "i" } },
      ];
    }
    const totalArtists = await Artist.countDocuments(query);
    const ArtistData = await Artist.find(query).skip(page).limit(6);
    const artistsPerPage = 6;
    const totalPages = Math.ceil(totalArtists / artistsPerPage);

    return res.status(200).json({ ArtistData, totalPages });
  } catch (error) {
    console.log(error);
  }
};

export const BookingSlot = async (req, res) => {
  try {

    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTUSERKEY);

    const { artistId,ToDate,fromDate, totalDays,fees } = req.body;
    
    const userId = decoded.userId;

    const newBooking = new Booking({
      artistId: artistId,
      userId: userId,
      toDate: moment(ToDate).format("DD-MM-YYYY"),
      fromDate: moment(fromDate).format("DD-MM-YYYY"),
      totalDays,
      totalAmount:fees
    });

    const bookingSaved = await newBooking.save();

    const artistBookings = await Artist.findOne({ _id: artistId });
    artistBookings.bookingsPending.push(bookingSaved._id);
    await artistBookings.save();

    return res
      .status(200)
      .json({payment:true, message: "Slot Booked, wait for artist confirmation" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const DateCheck = async (req, res) => {
  try {
    const { id, from, to } = req.params;

    const fromDate = moment(from, "DD-MM-YYYY").format("DD-MM-YYYY");
    const toDate = moment(to, "DD-MM-YYYY").format("DD-MM-YYYY");

    const overlappingBookings = await Booking.find({
      artistId: id,
      $or: [
        {
          $and: [
            {
              fromDate: { $gte: fromDate, $lte: toDate },
            },
            {
              $or: [{ status: "Pending" }, { status: "Success" }],
            },
          ],
        },
        {
          $and: [
            {
              fromDate: { $lte: fromDate },
              toDate: { $gt: toDate },
            },
            {
              $or: [{ status: "Pending" }, { status: "Success" }],
            },
          ],
        },
        {
          $and: [
            {
              fromDate: { $lt: fromDate },
              toDate: { $gte: toDate },
            },
            {
              $or: [{ status: "Pending" }, { status: "Success" }],
            },
          ],
        },
      ],
    });

    // console.log(overlappingBookings);
    if (overlappingBookings.length > 0) {
      return res
        .status(200)
        .json({ booked: false, message: "Dates are already booked" });
    }

    return res
      .status(200)
      .json({ booked: true, message: "Dates are available" });
  } catch (error) {
    console.error("Error checking dates:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const payment = async (req, res, next) => {
  try {
    const stripe = new Stripe(
      "sk_test_51O7buMSAHGGVNWH2POHgAvRlGC70JqBnwu9eUElqD7kNIHtPOA4M3LesSc8lUiiBpqkZgaMT9xKIhYH9C0Q7hI4800gevTB7qq"
    );
    const artist = await Artist.findById(req.params.id);

    const artistFees = artist.fees;

    const paymentintent = await stripe.paymentIntents.create({
      amount: artistFees * 100,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.status(200).json({
      clientSecret: paymentintent.client_secret,
    });
  } catch (error) {
    console.log(error);
  }
};
