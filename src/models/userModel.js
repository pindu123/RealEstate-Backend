const mongoose = require("mongoose");
const { type } = require("../helpers/dealsValidation");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    firstNameTe: {
      type: String, // Translated first name in Telugu
    },
    lastName: {
      type: String,
      required: true,
    },
    lastNameTe: {
      type: String, // Translated last name in Telugu
    },
    phoneNumber: {
      type: String,
      unique: true,
      match: /^[0-9]{10}$/,
      required: true,
    },
    altPhoneNumber: {
      type: String,
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
    cityTe: {
      type: String, // Translated city in Telugu
    },
    state: {
      type: String,
      default: "Andhra Pradesh",
    },
    stateTe: {
      type: String, // Translated state in Telugu
    },
    country: {
      type: String,
      default: "India",
    },
    countryTe: {
      type: String,
    },
    password: {
      type: String,
      required: false,
    },
    active: {
      type: Number,
      default: 1,
    },
    district: {
      type: String,
    },
    districtTe: {
      type: String, // Translated district in Telugu
    },
    village: {
      type: String,
    },
    villageTe: {
      type: String, // Translated village in Telugu
    },
    mandal: {
      type: String,
    },
    mandalTe: {
      type: String, // Translated mandal in Telugu
    },
    role: {
      type: Number, // 1-agent, 2-seller, 3-buyer, 4-estate client, 5 - CSR, 6-Marketing Agent
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
    },
    addedBy: {
      type: String,
    },
    occupation: {
      type: String,
    },
    income: {
      type: String,
    },
    budget: {
      type: String,
    },
    accountId: {
      type: String,
    },
    subscription: {
      planType: {
        type: String,
      },
      planDuration: {
        type: String,
      },
      planStartDate: {
        type: String,
      },
      planEndDate: {
        type: String,
      },
      amount: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
