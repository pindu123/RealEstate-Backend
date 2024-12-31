const { required, string } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      match: /^[0-9]{10}$/,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      required: true,
    },
    pinCode: {
      type: Number,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
      default: "Andhra Pradesh",
    },
    country: {
      type: String,
      default: "India",
    },
    password: {
      type: String,
      required: false,
    },
    district: {
      type: String,
    },
    village: {
      type:String
    },
    mandal: {
      type: String,
    },
    role: {
      type: Number, //1-agent,2-seller,3-buyer,4-estate client
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/ddv2y93jq/image/upload/v1726132403/zsafjroceoneetkmz5jq.webp",
    },
    agentUserId: {
      type: String,
      required: false,
    },
    identityProof: {
      type: Array,
      required: false,
    },
    assignedDistrict: {
      type: String,
      required: false,
    },
    assignedCsr: {
      type: String,
    },
    assignedMandal: {
      type: String,
    },addedBy:{
      type:String,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
