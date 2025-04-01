const mongoose = require("mongoose");

const estateSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
    },
    agentId: {
      type: String,
    },
    agentName: {
      type: String,
    },
    status: {
      type: Number,
    },
    serviceReq: {
      type: [String],
      required: true,
    },
    ownerDetails: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
      phoneNumber: {
        type: Number,
        required: true,
      },
    },
    address: {
      pinCode: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      village: {
        type: String,
      },
      district: {
        type: String,
      },
      mandal: {
        type: String,
      },
    },
    landDetails: {
      landTitle: {
        type: String,
        required: true,
      },
      landType: {
        type: String,
        required: true,
      },
      loanAvailed: {
        type: Boolean,
        required: true,
      },
      loanDesc: {
        type: String,
      },
      surveyNo: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      sizeUnit: {
        type: String,
        required: true,
      },
      marketValue: {
        type: Number,
        required: true,
      },
      uploadPics: {
        type: [String],
      },
      uploadDocs: {
        type: String,
      },
    },
    amenities: {
      groundWaterLevel: {
        type: String,
        required: true,
      },
      waterFacility: {
        type: Boolean,
        required: true,
      },
      electricity: {
        type: Boolean,
        required: true,
      },
      parking: {
        type: Boolean,
        required: true,
      },
      lift: {
        type: Boolean,
        required: true,
      },
      watchMan: {
        type: Boolean,
        required: true,
      },
      ccTv: {
        type: Boolean,
        required: true,
      },
      powerBackup: {
        type: Boolean,
      },
      swimmingPool: {
        type: Boolean,
      },
      rainWaterStorage: {
        type: Boolean,
      },
    },

    buildingDetails: {
      facing: {
        type: String,
      },
      propertyAge: {
        type: Number,
      },
      buildingType: {
        type: String,
      },
    },
    residence: {
      doorNo: {
        type: String,
      },
      floorCount: {
        type: Number,
      },
      bedRoomType: {
        type: String,
      },
      furnished: {
        type: String,
      },
      beds: {
        type: Number,
      },
      washrooms: {
        type: Number,
      },
    },
    apartment: {
      floorCount: {
        type: Number,
      },
      houseCount: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

const estateModel = mongoose.model("estates", estateSchema);

module.exports = estateModel;
