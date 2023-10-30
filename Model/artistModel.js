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
  is_Confirm:{
    type:Boolean,
    default:false
      },
  is_profile: {
    type: Boolean,
    default: false,
  },
  is_block: {
    type: Boolean,
    default: false,
  },
  requested: {
    type: Boolean,
    default: false,
  },
  experience: {
    type: Number,
  },
  description: {
    type: String,
  },
  place: {
    type: String,
  },
  mobile: {
    type: String,
  },
  fees: {
    type: Number,
  },
  category: {
    type: String,
  },
  displaypicture: {
    type: String,
    default: "",
  },
  posts: {
    type: Array,
  },
  status: {
    type: String,
    default: "pending",
  },
  bookingsPending:[{
  }]
});

const Artist = mongoose.model("Artist", userSchema);
export default Artist;
