import User from "../../Model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Token from "../../Model/token.js";
import sendMail from "../../utils/sendMail.js";
import crypto from "crypto";

export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await User.findOne({ email: email });

    if (exist) {
      return res
        .status(200)
        .json({ created: false, message: "Email Already Exists" });
    } else {
      const hashpass = await bcrypt.hash(password, 10);
      const newUser = new User({
        name: name,
        email: email,
        password: hashpass,
      });
      const userData = await newUser.save().then(console.log("registered"));

      const emailToken = await new Token({
        userId: userData._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
      const url = `${process.env.BASE_URL}users/${userData._id}/verify/${emailToken.token}`;
      await sendMail(userData.email, "Verify Email", url);
      return res.status(200).json({
        created: true,
        message: "An Email SEnt To your account Please verify",
      });
    }
  } catch (error) {}
};

export const googleRegister = async (req, res) => {
  try {
    const { name, email, id } = req.body;

    const exist = await User.findOne({ email: email });

    if (exist) {
      return res
        .status(200)
        .json({ created: false, message: "Email already exist" });
    } else {
      const hashpass = await bcrypt.hash(id, 10);
      const newUser = new User({
        name: name,
        email: email,
        password: hashpass,
        is_google:true
      });

      const userData = await newUser.save().then(console.log("Google Signup"));
      const token = jwt.sign({ userId: userData._id }, process.env.JWTKEY, {
        expiresIn: "1h",
      });
      res
        .status(200)
        .json({ created: true, userData, mesage: "Account Registered", token });
    }
  } catch (error) {
    console.log(error);
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exist = await User.findOne({ email: email });
    if (exist) {
      if (exist.is_block === true) {
        return res.status(200).json({ message: "user Is Blocked By Admin" });
      }
      const passOk = await bcrypt.compare(password, exist.password);
      if (passOk) {
        if (!exist.is_verfied) {
          const token = await Token.findOne({ userId: exist.id });
          if (token) {
            return res.status(200).json({
              message: "We Already sent mail  Please Check Your Mail",
            });
          }
          const emailToken = await new Token({
            userId: exist.id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();
          const url = `${process.env.BASE_URL}users/${exist._id}/verify/${emailToken.token}`;
          await sendMail(exist.email, "Verify Email", url);
          return res
            .status(200)
            .json({ message: "An Email SEnt To your account Please verify" });
        }
        const token = jwt.sign({ userId: exist._id }, process.env.JWTKEY, {
          expiresIn: "1h",
        });
        res.status(200).json({
          loginSuccess: true,
          message: "login success",
          user: exist,
          token,
        });
      } else {
        res.status(200).json({
          loginSuccess: false,
          message: "Incorrect password Enter a valid Password",
        });
      }
    } else {
      res.status(200).json({
        loginSuccess: false,
        message: "Email doesn't exist please check email",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const verification = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).json({ message: "invalid Link" });
    }
    const token = await Token.findOne({
      userId: req.params.id,
      token: req.params.token,
    });
    if (!token) {
      return res.status(400).json({ message: "Invalid Link" });
    }
    await User.updateOne({ _id: user._id }, { $set: { is_verfied: true } });
    await token.deleteOne({ token: req.params.token });
    res.status(200).json({ message: "Email is verified Succesfully" });
  } catch (error) {
    console.log(error);
  }
};

export const passwordMail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({ message: "user Not Found" });
    }
    if(user.is_google){return res.json({message:"Please :Go to google and Change Password"})}

    const token = await Token.findOne({ userId: user.id });
    if (token) {
      return res
        .status(200)
        .json({ message: "We Already sent mail  Please Check Your Mail" });
    }

    const emailToken = await new Token({
      userId: user.id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    const url = `${process.env.BASE_URL}users/${user._id}/password/${emailToken.token}`;
    await sendMail(user.email, "Verify Email", url);
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

    const user =await User.find({_id:id})
    if(!user){return res.json({message:"Not user found"})}
   
    if(pass1===pass2){
      const hashpass = await bcrypt.hash(pass1, 10);
      await User.findOneAndUpdate({ _id: id }, { $set: { password: hashpass } });
      return res.json({change:true,message:"Passsword Change success"})
    }else{
      return res.json({message:"please check your password"})
    }

  } catch (error) {
    console.log(error);
  }
}