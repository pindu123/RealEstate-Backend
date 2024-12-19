const mongoose = require("mongoose");

const layoutSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    enteredBy: {
      type: String,
    },
    role: {
      type: Number,
    },
    csrId: {
      type: String,
    },
    propertyType: {
      type: String,
      default: "Layout",
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: Number,
      default: 0,
    },

    agentDetails: {
      userId: {
        type: String,
      },
    },

    ownerDetails: {
      ownerName: {
        type: String,
        required: true,
      },
      ownerContact: {
        type: Number,
        required: true,
      },
      ownerEmail: {
        type: String,
      },
    },
    layoutDetails: {
      reraRegistered: {
        type: Boolean,
      },
      dtcpApproved: {
        type: Boolean,
      },
      tlpApproved: {
        type: Boolean,
      },
      flpApproved: {
        type: Boolean,
      },
      layoutTitle: {
        type: String,
        required: false,
      },
      description: {
        type: String,
      },
      plotCount: {
        type: Number,
        required: true,
      },
      availablePlots: {
        type: Number,
        required: true,
      },
      plotSize: {
        type: Number,
        required: true,
      },
      sizeUnit: {
        type: String,
        required: true,
      },
      plotPrice: {
        type: Number,
        required: true,
      },
      priceUnit: {
        type: String,
      },
      totalAmount: {
        type: Number,
        required: true,
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
        latitude: {
          type: String,
        },
        longitude: {
          type: String,
        },
        landMark: {
          type: String,
        },
        currentLocation:{
          type:String
        }
      },
    },
    amenities: {
      underGroundWater: {
        type: Boolean,
      },
      drainageSystem: {
        type: Boolean,
      },
      roadType:{
        type:String
     },
     distanceFromRoad: {
      type: String,
      required:false
    },
      electricityFacility: {
        type: Boolean,
      },
      swimmingPool: {
        type: Boolean,
      },
      playZone: {
        type: Boolean,
      },
      gym: {
        type: Boolean,
      },
      conventionHall: {
        type: Boolean,
      },
      medical: {
        type: Number,
      },
      educational: {
        type: Number,
      },
      extraAmenities: {
        type: [String],
      },
    },

    uploadPics: {
      type: [String],
    },

    videos:{
      type:[String],
      required:false
    }
  },
  { timestamps: true }
);

const layoutModel = mongoose.model("Layouts", layoutSchema);

module.exports = layoutModel;
