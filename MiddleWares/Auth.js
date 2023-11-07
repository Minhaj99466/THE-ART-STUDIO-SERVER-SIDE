import jwt from "jsonwebtoken";
import User from "../Model/userModel.js";
import Artist from "../Model/artistModel.js";

import dotenv from "dotenv";

dotenv.config();

export const adminAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWTADMINKEY);
      const admin = await User.findOne({
        _id: decoded.adminId,
        is_admin: true,
      });
      if (admin) {
        next();
      } else {
        return res
          .status(500)
          .json({ message: "user not authorised or invalid user" });
      }
    } else {
      return res.status(500).json({ message: "user not authorised" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Token expired Please Login" });
  }
};

export const artistAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWTARTISTKEY);

      const artist = await Artist.findOne({
        _id: decoded.artistId,
      });
      if (artist) {
        if (artist.is_block === false) {
          req.headers.artistId = decoded.artistId;
          next();
        } else {
          return res.status(500).json({ message: "You are blocked by admin " });
        }
      } else {
        return res
          .status(500)
          .json({ message: "user not authorised or inavid user" });
      }
    } else {
      return res.status(500).json({ message: "user not authorised" });  
    }
  } catch (error) {
    console.log(error.message,"hghghguhjh");
  }
};
export const userAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWTUSERKEY);

      const user = await User.findOne({
        _id: decoded.userId,
      });
      if (user) {
        if (user.is_block === false) {
          req.headers.userId = decoded.userId;
          next();
        } else {
          return res.status(500).json({ message: "You are blocked by admin " });
        }
      } else {
        return res
          .status(500)
          .json({ message: "user not authorised or inavid user" });
      }
    } else {
      return res.status(500).json({ message: "user not authorised" });  
    }
  } catch (error) {
    console.log(error.message,"hghghguhjh");
  }
};
