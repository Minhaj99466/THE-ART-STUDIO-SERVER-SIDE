import Artist from "../../Model/artistModel.js";
import Token from "../../Model/token.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendMail from "../../utils/sendMail.js";

export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await Artist.findOne({ email: email });
    if (exist) {
      res
        .status(200)
        .json({ created: false, message: "Email Already Exist Please login" });
    } else {
      const hash = await bcrypt.hash(password, 10);
      const newArtist = new Artist({
        name: name,
        email: email,
        password: hash,
      });
      const artistData = await newArtist.save();

      const emailToken = await new Token({
        artistId: artistData._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
      const url = `${process.env.BASE_URL}artist/${artistData._id}/verify/${emailToken.token}`;
      await sendMail(artistData.email, "Verify Email", url);
      return res
        .status(200)
        .json({
          created: true,
          message: "An Email SEnt To your account Please verify",
        });
    }
  } catch (error) {
    console.log(error);
  }
};

export const googleRegister = async (req, res) => {
  try {
    const { name, email, id } = req.body;
    const exist = await Artist.findOne({ email: email });
    console.log(exist);
    if (exist) {
      res
        .status(200)
        .json({ created: false, message: "Email already exist please Login" });
    } else {
      const hash = await bcrypt.hash(id, 10);
      const artist = new Artist({
        name: name,
        email: email,
        password: hash,
      });
      const artistData = await artist.save();
      const token = jwt.sign({ artistId: artistData._id }, process.env.JWTKEY, {
        expiresIn: "1h",
      });
      res
        .status(200)
        .json({
          created: true,
          message: "Artist Registration completed",
          artistData,
          token,
        });
    }
  } catch (error) {
    console.log(error);
  }
};

export const artistLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const exist = await Artist.findOne({ email: email });
    if (exist) {
      if (exist.is_block === true) {
        return res.status(200).json({ message: "Artist Is Blocked By Admin" });
      }
      const passOk = await bcrypt.compare(password, exist.password);
      if (passOk) {
        if (!exist.is_verfied) {
          const token = await Token.findOne({ artistId: exist.id });
          if (token) {
            return res
              .status(200)
              .json({
                message: "We Already sent mail  Please Check Your Mail",
              });
          }
          const emailToken = await new Token({
            artistId: exist.id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();
          const url = `${process.env.BASE_URL}artist/${exist._id}/verify/${emailToken.token}`;
          await sendMail(exist.email, "Verify Email", url);
          return res
            .status(200)
            .json({ message: "An Email SEnt To your account Please verify" });
        }
        const token = jwt.sign({ artistId: exist._id }, process.env.JWTKEY, {
          expiresIn: "1h",
        });
        res
          .status(200)
          .json({
            loginSuccess: true,
            message: "login success",
            user: exist,
            token,
          });
      } else {
        res
          .status(200)
          .json({
            loginSuccess: false,
            message: "Wrong Password please Check",
          });
      }
    } else {
      res
        .status(200)
        .json({
          loginSuccess: false,
          message: "Artist Doesn't Exist Please Register",
        });
    }
  } catch (error) {
    console.log(error);
  }
};

export const verification = async (req, res) => {
  try {
    const artist = await Artist.findOne({ _id: req.params.id });
    if (!artist) {
      return res.status(400).json({ message: "invalid Link" });
    }
    const token = await Token.findOne({
      artistId: req.params.id,
      token: req.params.token,
    });
    if (!token) {
      return res.status(400).json({ message: "Invalid Link" });
    }
    await Artist.updateOne({ _id: artist._id }, { $set: { is_verfied: true } });
    await token.deleteOne({ token: req.params.token });
    res.status(200).json({ message: "Email is verified Succesfully" });
  } catch (error) {
    console.log(error);
  }
};
