import Artist from "../../Model/artistModel.js";
import Token from "../../Model/token.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendMail from "../../utils/sendMail.js";
import {
  uploadToCloudinary,
} from "../../utils/cloudinary.js";

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
      const token = jwt.sign({ artistId: artistData._id }, process.env.JWTARTISTKEY, {
        expiresIn: "24h",
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
        const token = jwt.sign({ artistId: exist._id }, process.env.JWTARTISTKEY, {
          expiresIn: "24h",
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


export const passwordMail = async (req, res) => {
  try {
    const { email } = req.body;
    const artist = await Artist.findOne({ email: email });
    if (!artist) {
      return res.json({ message: "user Not Found" });
    }
    if(artist.is_google){return res.json({message:"Please :Go to google and Change Password"})}

    const token = await Token.findOne({ artistId: artist.id });
    if (token) {
      return res
        .status(200)
        .json({ message: "We Already sent mail  Please Check Your Mail" });
    }

    const emailToken = await new Token({
      artistId: artist.id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    const url = `${process.env.BASE_URL}artist/${artist._id}/password/${emailToken.token}`;
    await sendMail(artist.email, "Verify Email", url);
    return res.status(200).json({ message: "Mail for password change" });
  } catch (error) {
    console.log(error);
  }
};


export const checkpassword=async(req,res)=>{
  try {
    const pass1=req.body.password.password.password
    const pass2=req.body.password.password.confirmPassword
    const id=req.body.password.paramId

    const artist =await Artist.find({_id:id})
    if(!artist){return res.json({message:"Not user found"})}
   
    if(pass1===pass2){
      const hashpass = await bcrypt.hash(pass1, 10);
      await Artist.findOneAndUpdate({ _id: id }, { $set: { password: hashpass } });
      return res.json({change:true,message:"Passsword Change success"})
    }else{
      return res.json({message:"please check your password"})
    }

  } catch (error) {
    console.log(error);
  }
}


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
          displaypicture: uploadedImages.url,
          requested: true,
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