const mongoose = require("mongoose");

const emBuildingSchema = new mongoose.Schema(
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
    buildingDetails: {
      buildingType: {
        type: String,
        required: true,
      },
      buildingName: {
        type: String,
        required: false,
      },
      doorNo: {
        type: String,
        required: true,
      },
      floorCount:{
type:Number,
required: true,
      },
houseCount:{
type: Number,
required: true
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
        type: String,
        required: true,
      },
      images: [String],
      landDocument: {
        type: String,
      }
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
      parking: {
        type: Boolean,
      },
      lift: {
        type: Boolean,
      },
      cable: {
        type: Boolean,
      },
      internet: {
        type: Boolean,
      },
    },
  },
  { timestamps: true }
);

const emBuildingModel = mongoose.model("emBuildings", emBuildingSchema);

module.exports = emBuildingModel;
