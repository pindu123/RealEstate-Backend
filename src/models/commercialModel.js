const mongoose = require("mongoose");

const commercialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    propertyId: {
      type: String,
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
    propertyTypeTe: {
      type: String, // Telugu translation
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    propertyTitleTe: {
      type: String, // Telugu translation
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
        ownerNameTe: {
          type: String, // Telugu translation
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
        disputeDescTe: {
          type: String, // Telugu translation
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
          landUsageTe: [String], // Telugu translations
        },
        rent: {
          plotSize: String,
          sizeUnit: String,
          rent: Number,
          priceUnit: String,
          noOfMonths: Number,
          totalAmount: Number,
          landUsage: [String],
          landUsageTe: [String], // Telugu translations
        },
        lease: {
          plotSize: String,
          sizeUnit: String,
          leasePrice: Number,
          priceUnit: String,
          duration: Number,
          totalAmount: Number,
          landUsage: [String],
          landUsageTe: [String], // Telugu translations
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
          districtTe: {
            type: String, // Telugu translation
          },
          mandal: {
            type: String,
            required: true,
          },
          mandalTe: {
            type: String, // Telugu translation
          },
          village: {
            type: String,
            required: true,
          },
          villageTe: {
            type: String, // Telugu translation
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
          landMarkTe: {
            type: String, // Telugu translation
          },
          currentLocation: {
            type: String,
          },
        },
        description: {
          type: String,
        },
        descriptionTe: {
          type: String, // Telugu translation
        },
      },
      amenities: {
        isParkingFacility: {
          type: Boolean,
        },
        security: {
          type: Boolean,
        },
        powerBackup: {
          type: Boolean,
        },
        isElectricity: {
          type: String,
        },
        isElectricityTe: {
          type: String, // Telugu translation
        },
        isWaterFacility: {
          type: Boolean,
        },
        isRoadFace: {
          type: Boolean,
        },
        roadType: {
          type: String,
        },
        roadTypeTe: {
          type: String, // Telugu translation
        },
        distanceFromRoad: {
          type: String,
          required: false,
        },
        extraAmenities: {
          type: [String],
        },
        extraAmenitiesTe: {
          type: [String], // Telugu translations
        },
        roadProximity: {
          type: String,
        },
        roadProximityTe: {
          type: String, // Telugu translation
        },
      },
      uploadPics: {
        type: [String],
        default: [
          "https://res.cloudinary.com/ds1qogjpk/image/upload/v1735582521/commercial_qqcdbt.png",
        ],
      },
      videos: {
        type: [String],
        required: false,
      },
    },
    propertyInterestedCount: {
      type: Number,
    },
    propertyOnHold: {
      type: String,
      default: "no",
    },
  },
  { timestamps: true }
);

const commercialModel = mongoose.model("Commercial", commercialSchema);

module.exports = commercialModel;
