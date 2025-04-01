const mongoose = require("mongoose");

const unifiedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    propertyId: {
      type: String,
    },
    csrId: {
      type: String,
    },
    enteredBy: {
      type: String,
    },
    role: {
      type: Number,
    },
    propertyType: {
      type: String,
      required: true,
    },
    propertyTypeTe: {
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
      ownerNameTe: {
        type: String, // Telugu translation
      },
      ownerContact: {
        type: String,
      },
      ownerEmail: {
        type: String,
      },
    },
    propertyDetails: {
      // Conditional fields for different property types
      commercial: {
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
      },
      residential: {
        type: String,
        typeTe: String,
        apartmentName: String,
        apartmentNameTe: String,
        flatCount: Number,
        availableFlats: Number,
        flatSize: Number,
        sizeUnit: String,
        flatCost: Number,
        totalCost: Number,
      },
      layout: {
        layoutTitle: String,
        layoutTitleTe: String,
        plotCount: Number,
        availablePlots: Number,
        plotSize: Number,
        sizeUnit: String,
        plotPrice: Number,
        totalAmount: Number,
      },
    },
    address: {
      pinCode: {
        type: String,
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
    },
    amenities: {
      powerSupply: Boolean,
      waterFacility: Boolean,
      electricityFacility: String,
      roadType: String,
      distanceFromRoad: String,
      extraAmenities: [String],
    },
    images: {
      type: [String],
      default: ["https://res.cloudinary.com/default_image.png"],
    },
    videos: {
      type: [String],
    },
    propertyInterestedCount: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UnifiedProperty", unifiedSchema);
