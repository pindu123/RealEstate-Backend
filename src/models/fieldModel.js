// const Joi = require("joi");
// const { required } = require("joi");
// const mongoose = require("mongoose");

// const fieldSchema = new mongoose.Schema(
//   {
    
//     userId: {
//       type: String,
//       required: true,
//     },
//     enteredBy: {
//       type: String,
//     },

//     role: {
//       type: Number,
//     },
//     propertyType: {
//       type: String,
//       default: "Agricultural land",
//     },
//     rating: {
//       type: Number,
//       default: 0,
//     },
//     csrId: {
//       type: String,
//     },

//     ratingCount: {
//       type: Number,
//       default: 0,
//     },
//     status: {
//       type: Number,
//       default: 0,
//     },

//     agentDetails: {
//       userId: {
//         type: String,
//       },
//     },

//     ownerDetails: {
//       ownerName: {
//         type: String,
//         required: true,
//       },
//       phoneNumber: {
//         type: Number,
//         required: true,
//       },
//     },
//     landDetails: {
//       title: {
//         type: String,
//         required: false,
//       },
//       surveyNumber: {
//         type: String,
//         required: true,
//       },
//       size: {
//         type: Number,
//         required: true,
//       },
//       sizeUnit: {
//         type: String,
//         required: true,
//       },
//       price: {
//         type: Number,
//         required: true,
//       },
//       priceUnit: {
//         type: String,
//       },
//       totalPrice: {
//         type: Number,
//         required: true,
//       },
//       landType: {
//         type: String,
//         required: true,
//       },
//       crops: {
//         type: [String],
        
//       },
//       litigation: {
//         type: Boolean,
//         required: true,
//       },
//       litigationDesc: {
//         type: String,
//       },
//       images: {
//         type: [String],
//         default:["https://res.cloudinary.com/ds1qogjpk/image/upload/v1735582181/agricultural_b1cmq0.png"],
//       },
//       videos:{
//         type:[String],
//         required:false
//       },
//       propertyDesc: {
//         type: String,
//       },
//     },
//     address: {
//       pinCode: {
//         type: String,
//         required: false,
//       },
//       country: {
//         type: String,
//         default: "India",
//       },
//       state: {
//         type: String,
//         default: "Andhra Pradesh",
//       },
//       district: {
//         type: String,
//         required: true,
//       },
//       mandal: {
//         type: String,
//         required: true,
//       },
//       village: {
//         type: String,
//         required: true,
//       },
//       latitude: {
//         type: String,
//         default:0,
//         required: false,
//       },
//       longitude: {
//         type: String,
//         default:0,

//         required: false,
//       },
//       landMark: {
//         type: String,
//       },
//       currentLocation:{
//         type:String
//       }
//     },
//     amenities: {
//       boreWell: {
//         type: Boolean,
//       },
//       electricity: {
//         type: String,
//       },
//       roadType:{
//          type:String
//       },
//       distanceFromRoad: {
//         type: String,
//         required:false
//       },
//       storageFacility: {
//         type: Boolean,
//       },
//       extraAmenities: {
//         type: [String],
//       },
//     },
//     propertyId:{
//       type:String,
//     }
//   },
//   { timestamps: true }
// );

// const fieldModel = mongoose.model("fieldDetails", fieldSchema);

// module.exports = fieldModel;


const Joi = require("joi");
const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    enteredBy: {
      type: String,
      required: true,  // Required as per the method logic
    },
    role: {
      type: Number,
      required: true,  // Required to determine user actions
    },
    propertyType: {
      type: String,
      default: "Agricultural land",
    },
    propertyTypeTe: {
      type: String, // Translated field for Telugu
    },
    rating: {
      type: Number,
      default: 0,
    },
    csrId: {
      type: String,
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
      ownerNameTe: {
        type: String, // Translated field for Telugu
      },
      phoneNumber: {
        type: String,  // Changed to String to handle numbers correctly (e.g., with leading zeros)
        required: true,
      },
    },

    landDetails: {
      title: {
        type: String,
        required: false,
      },
      titleTe: {
        type: String, // Translated field for Telugu
      },
      surveyNumber: {
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
      price: {
        type: Number,
        required: true,
      },
      priceUnit: {
        type: String,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
      landType: {
        type: String,
        required: true,
      },
      landTypeTe: {
        type: String, // Translated field for Telugu
      },
      crops: {
        type: [String],
      },
      litigation: {
        type: Boolean,
        required: true,
      },
      litigationDesc: {
        type: String,
      },
      images: {
        type: [String],
        default: [
          "https://res.cloudinary.com/ds1qogjpk/image/upload/v1735582181/agricultural_b1cmq0.png",
        ],
      },
      videos: {
        type: [String],
        required: false,
      },
      propertyDesc: {
        type: String,
      },
      propertyDescTe: {
        type: String, // Translated field for Telugu
      },
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
        default: 0,
        required: false,
      },
      longitude: {
        type: String,
        default: 0,
        required: false,
      },
      landMark: {
        type: String,
      },
      currentLocation: {
        type: String,
      },
      // Translated fields for address
      countryTe: {
        type: String,
      },
      stateTe: {
        type: String,
      },
      districtTe: {
        type: String,
      },
      mandalTe: {
        type: String,
      },
      villageTe: {
        type: String,
      },
    },

    amenities: {
      boreWell: {
        type: Boolean,
      },
      electricity: {
        type: String,
      },
      electricityTe: {
        type: String, 
      },
      roadType: {
        type: String,
      },
      roadTypeTe: {
        type: String, 
      },
      distanceFromRoad: {
        type: String,
        required: false,
      },
      storageFacility: {
        type: Boolean,
      },
      extraAmenities: {
        type: [String],
      },
    },

    propertyId: {
      type: String,
    },
    propertyInterestedCount:{
      type:Number,
    },
    propertyInterestedCount:{
      type:Number
    }
  },
  { timestamps: true }
);

const fieldModel = mongoose.model("fieldDetails", fieldSchema);

module.exports = fieldModel;