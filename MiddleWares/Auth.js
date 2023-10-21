import jwt from "jsonwebtoken";
import User from "../Model/userModel.js";
import Artist from "../Model/artistModel.js";

import dotenv from "dotenv";

dotenv.config();

export const adminAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      const decoded=jwt.verify(token,process.env.JWTADMINKEY)
            const admin =await User.findOne({
        _id:decoded.adminId,
        is_admin:true
      })
      if(admin){
        next();
      }else{
        return res.status(403).json({message:"user not authorised or invalid user"})
      }
    }else{
        return res.status(403).json({message:"user not authorised"})
    }
  } catch (error) {
    console.log(error);
  }
};
