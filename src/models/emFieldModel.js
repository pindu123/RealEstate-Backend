const mongoose = require("mongoose");

const emFieldSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
    },
    estType:{
        type: String,
        required: true,
    },
    status: {
      type: Number,
      default: 0,
    },
    landDetails: {
      landType: {
        type: String,
        required: true,
      },
      landName: {
        type: String,
        required: false,
      },
      surveyNo: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: false,
      },
      size: {
        type: Number,
        required: true,
      },
      sizeUnit: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      images: [String]
    },
    address: {
      pinCode: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        default: "India",
      },
      state: {
        type: String,
        default: "Andhra Pradesh",
      },
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
    },
    amenities: {
      boreWell: {
        type: Boolean,
      },
      electricity: {
        type: Boolean,
      },
      distanceFromRoad: {
        type: Number,
      },
      storageFacility: {
        type: Boolean,
      },
    },
  },
  { timestamps: true }
);

const emFieldModel = mongoose.model("emFieldDetails", emFieldSchema);

module.exports = emFieldModel;
