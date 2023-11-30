import User from "../../Model/userModel.js";
import Artist from "../../Model/artistModel.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Booking from "../../Model/bookingModel.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email: email, is_admin: true });
    if (!admin) {
      res.status(201).json({ loginSuccess: false, message: "Admin not Found" });
    }
    if (admin) {
      const passOk = await bcrypt.compare(password, admin.password);
      if (passOk) {
        const token = jwt.sign(
          { adminId: admin._id },
          process.env.JWTADMINKEY,
          {
            expiresIn: "24h",
          }
        );
        res.status(200).json({
          loginSuccess: true,
          message: "Admin login Success",
          token,
          admin,
        });
      } else {
        res.status(201).json({
          loginSuccess: false,
          message: "incorrect Password please check you password",
        });
      }
    } else {
      res
        .status(400)
        .json({ loginSuccess: false, message: "Its not An admin" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const manageUsers = async (req, res) => {
  try {
    const search = req.params.search;
    const value = req.params.value;

    const page = (value - 1) * 6;
    let query = { is_verfied: true };

    if (search != 0) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const totalUser = await User.countDocuments(query);
    const users = await User.find(query).skip(page).limit(6);
    const userPerPage = 6;
    const totalPages = Math.ceil(totalUser / userPerPage);

    return res.status(200).json({ users, totalPages });
  } catch (error) {
    console.log(error);
  }
};
export const manageArtist = async (req, res) => {
  try {
    const search = req.params.search;
    const value = req.params.value;
    const page = (value - 1) * 6;
    let query = { is_Confirm: true };

    if (search != 0) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const totalArtists = await Artist.countDocuments(query);
    const artist = await Artist.find(query).skip(page).limit(6);
    const artistsPerPage = 6;
    const totalPages = Math.ceil(totalArtists / artistsPerPage);

    return res.status(200).json({ artist, totalPages });
  } catch (error) {
    console.log(error);
  }
};

export const manageAction = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    const change = await User.findOneAndUpdate(
      { _id: id },
      { $set: { is_block: !user.is_block } }
    );
    res.status(200).json({ data: user });

    // const action =await User.findOneAndUpdate({_id:})
  } catch (error) {
    console.log(error);
  }
};

export const manageArtistAction = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    const artist = await Artist.findById(id);
    const change = await Artist.findOneAndUpdate(
      { _id: id },
      { $set: { is_block: !artist.is_block } }
    );
    res.status(200).json({ data: artist });

    // const action =await User.findOneAndUpdate({_id:})
  } catch (error) {
    console.log(error);
  }
};

export const notVerified = async (req, res, next) => {
  try {
    const notVerified = await Artist.find({
      is_Confirm: false,
      requested: true,
    });
    if(!notVerified) {
      return res.status(200).json({ message: "Data not found" });
    }
    return res.status(200).json({ data:notVerified});

  } catch (error) {
    console.log(error.message);
  }
};

export const getArtist = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await Artist.findById(id);
    if (data) {
      return res.status(200).json({ data: data });
    } else {
      return res.status(400).json({ message: "Data not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const verifyArtist = async (req, res, next) => {
  try {
    console.log("verifyArtist");
    const id = req.params.id;
    const verified = await Artist.findOneAndUpdate(
      { _id: id },
      { $set: { is_Confirm: true } }
    );
    if (verified) {
      return res
        .status(200)
        .json({ verified: true, message: "doctor vrification Success" });
    } else {
      return res
        .status(400)
        .json({ created: false, message: "doctor verification failed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const dashBoardData = async (req, res, next) => {
  try {
    const [totalUsers, totalArtists] = await Promise.all([
      User.countDocuments(),
      Artist.countDocuments(),
    ]);

    console.log(totalUsers, "usersssssssssss");
    console.log(totalArtists, "docrssssssssss");

    const artistBookings = await Booking.aggregate([
      {
        $match: {
          status: "Approved",
        },
      },
      {
        $group: {
          _id: "$artistId",
          bookingCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "artists",
          localField: "_id",
          foreignField: "_id",
          as: "artistInfo",
        },
      },
      {
        $unwind: "$artistInfo",
      },
      {
        $project: {
          artistName: "$artistInfo.name",
          bookingCount: 1,
        },
      },
      {
        $sort: {
          bookingCount: -1,
        },
      },
    ]);
    console.log(artistBookings);

    const totalBookings = await Booking.find({ status: "Approved" });
    const TotalBookingCount = totalBookings.length;

    return res
      .status(200)
      .json({ totalUsers, totalArtists, artistBookings, TotalBookingCount });
  } catch (error) {
    console.log(error.message);
  }
};
