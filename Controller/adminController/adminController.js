import User from "../../Model/userModel.js";
import Artist from "../../Model/artistModel.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email: email });
    if (!admin) {
      res.status(201).json({ loginSuccess: false, message: "Admin not Found" });
    }
    if (admin.is_admin) {
      const passOk = await bcrypt.compare(password, admin.password);
      if (passOk) {
        const token = jwt.sign({ adminId: admin._id }, process.env.JWTKEY, {
          expiresIn: "1h",
        });
        res
          .status(200)
          .json({
            loginSuccess: true,
            message: "Admin login Success",
            token,
            admin,
          });
      } else {
        res
          .status(201)
          .json({
            loginSuccess: false,
            message: "incorrect Password please check you password",
          });
      }
    } else {
      res
        .status(200)
        .json({ loginSuccess: false, message: "Its not An admin" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const manageUsers = async (req, res) => {
  try {
    const users = await User.find({ is_admin: false });
    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
  }
};
export const manageArtist = async (req, res) => {
  try {
    const artist = await Artist.find();
    res.status(200).json({ artist });
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
