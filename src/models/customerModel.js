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
      required: false,
    },
    whatsAppNumber: {
      type: String,
      unique: true,
      match: /^[0-9]{10}$/,
      required: false,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      required: false,
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

    district: {
      type: String,
      required: false,
    },
    mandal: {
      type: String,
      required: false,
    },
    village: {
      type: String,
      required: false,
    },
    occupation: {
      type: String,
    },

    budget: { type: String, required: false },
    interestedIn: {
      type: String,
    },
    description: {
      type: String,
    },
    addedBy: {
      type: String,
    },
    addedByRole: {
      type: Number,
    },
    customerRole: {
      type: String,
    },
  },
  { timestamps: true }
);
const customerModel = mongoose.model("customers", customerSchema);

module.exports = customerModel;
