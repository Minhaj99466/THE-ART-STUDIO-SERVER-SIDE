
import {
  uploadToCloudinary,
  MultiUploadCloudinary
} from "../../utils/cloudinary.js";
import Artist from "../../Model/artistModel.js";
import Chat from "../../Model/chatModel.js";
import User from "../../Model/userModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Booking from "../../Model/bookingModel.js";





export const profileDetails=async (req,res)=>{
  try {
    const id=req.params.id
    const profileData=await Artist.findOne({email:id})

    if(!profileData){return res.status(400).json({message:"no profile"})}
    return res.status(200).json({message:"user profile",profileData})
  } catch (error) {
    console.log(error);
  }
}


export const addProfile=async(req,res)=>{
  try {
    const artistId=req.params.id
    console.log(req.body);
    const {
      category,
      experience,
      place,
      number,
      fees,
      description,
    } = req.body;
    const uploadedImages = await uploadToCloudinary(
      req.file.path,
      "dp"
    );

    const updatedArtist = await Artist.updateOne(
      { email: artistId },
      {
        $set: {
          category: category,
          experience: experience,
          place: place,
          mobile: number,
          description: description,
          fees: fees,
          displaypicture: uploadedImages.url,
          is_profile:true
        },
      }
    );
    if (updatedArtist) {
      return res.status(200).json({created:true, data: updatedArtist, message: "updated" });
    } else {
      return res.status(200).json({ message: "updation failed" });
    }

  } catch (error) {
    console.log(error);
  }
}

export const editProfile=async (req,res)=>{
 
      try {
        const artistId=req.params.id
        const {
          name,
          category,
          experience,
          number,
          description,
          fees,
        } = req.body;
        const uploadedImages = await uploadToCloudinary(
          req.file.path,
          "dp"
        );
    
        const updatedArtist = await Artist.updateOne(
          { email: artistId },
          {
            $set: {
              name:name,
              category: category,
              experience: experience,
              mobile: number,
              description: description,
              fees: fees,
              displaypicture: uploadedImages.url,
              is_profile:true
            },
          }
        );
        if (updatedArtist) {
          return res.status(200).json({created:true, data: updatedArtist, message: "updated" });
        } else {
          return res.status(200).json({ message: "updation failed" });
        }
    
  } catch (error) {
    console.log(error);
  }
}



export const postImages=async (req,res)=>{
 
  try {
    const artistId=req.params.id

    const uploadedImages = await MultiUploadCloudinary(
      req.files,
      "images"
    );
    const updatedArtist = await Artist.updateOne(
      { email: artistId },
      {
        $push: {
          posts: { $each: uploadedImages },
        },
        $set: {
          is_posts: true,
          requested: true,
        },
      }
    );
    if (updatedArtist) {
      return res.status(200).json({created:true, data: updatedArtist, message: "updated" });
    } else {
      return res.status(400).json({ message: "updation failed" });
    }
 
} catch (error) {
console.log(error);
}
}


export const fetchChats = async (req, res) => {
  try {
    console.log("reached","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    const  userId  = req.params.userId;
    // console.log(req.params,"artistId");
    console.log(userId);
    const result = await Chat.find({ "users.artist": userId })
      .populate("users.user", "-password")
      .populate("users.artist", "-password")
      .populate("latestMessage")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender.artist",
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
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword); //.find({ _id: { $ne: req.user._id } });
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
  }
};

export const dashBoard = async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTARTISTKEY);
    
    
    const pipeline = [
      { $match: { artistId: new mongoose.Types.ObjectId(decoded.artistId) } },
      {
        $group: {
          _id: null,

          BookingCount: {
            $sum: {
              $cond: { if: { $eq: ["$status", "Approved"] }, then: 1, else: 0 },
            },
          },
          canceledCount: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", "Rejected"] },
                then: 1,
                else: 0,
              },
            },
          },
          PendingCount: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", "Pending"] },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
    ];
    const result = await Booking.aggregate(pipeline);
    console.log(result,"res");
    let patientsCount = 0;

    const users = await Booking.aggregate([
      { $match: { artistId: new mongoose.Types.ObjectId(decoded.artistId) } },
      {
        $group: {
          _id: null,
          userCount: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          userCount: { $size: '$userCount' }
        }
      }
    ]);
    console.log(users,"userssssssssss");

     if (users[0]) {
      patientsCount = users[0].userCount;                    
    }
    const { BookingCount, canceledCount, PendingCount } = result[0] || {
      BookingCount: 0,
      canceledCount: 0,
      PendingCount: 0,
    };

    const totalApprovedAmount = await Booking.aggregate([
      {
        $match: {
          artistId: new mongoose.Types.ObjectId(decoded.artistId),
          status: "Approved"
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $toDouble: "$totalAmount" } }
        }
      }
    ]);
    if(totalApprovedAmount.length>0){
      const totalSales=totalApprovedAmount[0].totalAmount
    }else{
      const totalSales=0
    }
    
    const total = BookingCount + canceledCount + PendingCount;
    let artist = await Artist.findOne({ _id: decoded.artistId });
    res.json({
      BookingCount,
      canceledCount,
      PendingCount,
      total,
      patientsCount,
      totalSales
    });
  } catch (error) {
    console.log(error.message);
  }
};