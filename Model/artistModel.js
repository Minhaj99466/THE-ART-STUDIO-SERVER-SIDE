import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: "",
  },
  is_verfied: {
    type: Boolean,
    default: false,
  },
  is_profile:{
    type:Boolean,
    default:false
  },
  is_block: {
    type: Boolean,
    default: false,
  }
});

const Artist = mongoose.model("Artist", userSchema);
export default Artist;
