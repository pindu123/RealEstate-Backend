const { required } = require("joi");
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
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
    // pinCode: {
    //   type: Number,
    // },
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
    // password: {
    //   type: String,
    //   required: false,
    // },
    district: {
      type: String,
      required: true,
    },
    mandal: {
      type: String,
      required: true,
    },
    village: {
      type: String,
      required: true,
    },
    occupation: {
      type: String,
    },

    income: { type: String, required: false },
    interestedIn:{
      type:String
    }
  },
  { timestamps: true }
);

const customerModel = mongoose.model("customers", customerSchema);

module.exports = customerModel;
