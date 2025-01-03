const mongoose = require("mongoose");

const commercialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    enteredBy: {
      type: String,
    },

    csrId: {
      type: String,
    },

    propertyType: {
      type: String,
      required: true,
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    countOfRatings: {
      type: Object,
    },
    status: {
      type: Number,
      default: 0,
    },

    propertyDetails: {
      agentDetails: {
        userId: {
          type: String,
        },
      },

      owner: {
        ownerName: {
          type: String,
        },
        ownerContact: {
          type: String,
        },
        ownerEmail: {
          type: String,
        },
        isLegalDispute: {
          type: Boolean,
        },
        disputeDesc: {
          type: String,
        },
      },
      landDetails: {
        sell: {
          plotSize: String,
          sizeUnit: String,
          price: Number,
          priceUnit: String,
          totalAmount: Number,
          landUsage: [String],
        },
        rent: {
          plotSize: String,
          sizeUnit: String,
          rent: Number,
          priceUnit: String,
          noOfMonths: Number,
          totalAmount: Number,
          landUsage: [String],
        },
        lease: {
          plotSize: String,
          sizeUnit: String,
          leasePrice: Number,
          priceUnit: String,
          duration: Number,
          totalAmount: Number,
          landUsage: [String],
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
        description: {
          type: String,
        },
      },

      amenities: {
        isElectricity: {
          type: String,
        },
        isWaterFacility: {
          type: Boolean,
        },
        isRoadFace: {
          type: Boolean,
        },
        roadType:{
           type:String
        },
        distanceFromRoad: {
          type: String,
          required:false
        },
        extraAmenities: {
          type: [String],
        },
        roadProximity:{
          type:String
        }
      },

      uploadPics: {
        type: [String],
        default:["https://res.cloudinary.com/ds1qogjpk/image/upload/v1735582521/commercial_qqcdbt.png"],
      },
      videos:{
        type:[String],
        required:false
      },
    },
  },
  { timestamps: true }
);

const commercialModel = mongoose.model("Commercial", commercialSchema);

module.exports = commercialModel;
