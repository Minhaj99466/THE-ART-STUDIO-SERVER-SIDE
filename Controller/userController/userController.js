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
import Chat from "../../Model/chatModel.js";

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
      return res.status(400).json({ message: "No Artist Found" });
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
      return res.status(400).res.json({ message: "No Artist Found" });
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
    let query = {is_Confirm:true};

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
    const totalPaid= totalDays*fees

    const newBooking = new Booking({
      artistId: artistId,
      userId: userId,
      toDate: moment(ToDate).format("DD-MM-YYYY"),
      fromDate: moment(fromDate).format("DD-MM-YYYY"),
      totalDays,
      totalAmount:totalPaid
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
    // return res.status(500).json({ error: "Internal Server Error" });
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
              $or: [{ status: "Pending" }, { status: "Approved" }],
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
              $or: [{ status: "Pending" }, { status: "Approved" }],
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
              $or: [{ status: "Pending" }, { status: "Approved" }],
            },
          ],
        },
      ],
    });

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
  }
};

export const payment = async (req, res, next) => {
  try {
    const stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY
    );
    const artist = await Artist.findById(req.params.id);
    let artistFees = artist.fees*req.params.total;

    
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

export const orderDetails = async (req, res) => {
  try {
   const id=req.params.id
   const userData=await User.findOne({email:id})
    const userId=userData.id

    const bookingData=await Booking.find({userId:userId}).populate('artistId')
    
    if(!bookingData){
      return res.status(400).json({message:"there is no data no show"})
    }

    return res.status(200).json({bookingData})

  } catch (error) {
    console.log(error);
  }
};
export const cancelBooking = async (req, res) => {
  try {
   const reason=req.body.cancelData.reason
   const id=req.body.cancelData.id
   const totalAmount=req.body.cancelData.totalAmount

   const cancelBooking=await Booking.findOneAndUpdate({_id:id},{$set:{reason:reason,status:"Cancel"}})
    if(!cancelBooking){
     return res.status(400).json({message:"No orders found"})
    }
    const userId =cancelBooking.userId
    const userWalletUpdate=await User.findOneAndUpdate({_id:userId},{$inc:{wallet:totalAmount}})
    if(!userWalletUpdate){
      return res.status(400).json({message:"No update fail"})
    }
    return res.status(200).json({message:"booking canceled"})
    
   

  } catch (error) {
    console.log(error);
  }
};


export const fetchChats = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId,"fetchData Param Console");
    const result = await Chat.find({ "users.user": userId })
      .populate("users.user", "-password")
      .populate("users.artist", "-password")
      .populate("latestMessage")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender.artist" ? "sender.artist" : "sender.user",
          select: "-password",
        },
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender.user",
          select: "-password",
        },
      })
      .then((result) => {
        // console.log(result),
         res.send(result);
      });
  } catch (error) {
    console.log(error.message);
  }
};

export const searchUsers = async (req, res) => {
  console.log("reached");
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await Artist.find(keyword); //.find({ _id: { $ne: req.user._id } });
  console.log(users);
  res.status(200).json(users);
};


export const userwallet = async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTUSERKEY);

    const user=await User.findOne({_id:decoded.userId})
    return res.status(200).json({user})
    
  } catch (error) {
    console.log(error);
  }
};


export const walletPay = async (req, res) => {
  try {

    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTUSERKEY);

    const { id,ToDate,fromDate, totalDays,fees } = req.body;
    console.log(req.body);
    
    const userId = decoded.userId;
    const totalPaid= totalDays*fees

    const newBooking = new Booking({
      artistId: id,
      userId: userId,
      toDate: moment(ToDate).format("DD-MM-YYYY"),
      fromDate: moment(fromDate).format("DD-MM-YYYY"),
      totalDays,
      totalAmount:totalPaid
    });

    const bookingSaved = await newBooking.save();
    if(!bookingSaved){
        return res.status(400).json({message:"booking not done something Went wrong"})
    }
      const walletUpdate=await User.findOneAndUpdate({_id:decoded.userId},{$set:{wallet:0}})
      if(!walletUpdate){
        return res.status(400).json({message:"booking not done something Went wrong"})
    }

    const artistBookings = await Artist.findOne({ _id: id });
    artistBookings.bookingsPending.push(bookingSaved._id);
    await artistBookings.save();

    return res
      .status(200)
      .json({payment:true, message: "Slot Booked, wait for artist confirmation" });
    
  } catch (error) {
    console.log(error);
  }
};

