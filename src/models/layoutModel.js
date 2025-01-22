// const mongoose = require("mongoose");

// const layoutSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: String,
//     },
//     propertyId:{
//       type:String,
//     },
//     enteredBy: {
//       type: String,
//     },
//     role: {
//       type: Number,
//     },
//     csrId: {
//       type: String,
//     },
//     propertyType: {
//       type: String,
//       default: "Layout",
//     },
//     rating: {
//       type: Number,
//       default: 0,
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
//       ownerContact: {
//         type: Number,
//         required: true,
//       },
//       ownerEmail: {
//         type: String,
//       },
//     },
//     layoutDetails: {
//       reraRegistered: {
//         type: Boolean,
//       },
//       dtcpApproved: {
//         type: Boolean,
//       },
//       tlpApproved: {
//         type: Boolean,
//       },
//       flpApproved: {
//         type: Boolean,
//       },
//       layoutTitle: {
//         type: String,
//         required: false,
//       },
//       description: {
//         type: String,
//       },
//       plotCount: {
//         type: Number,
//         required: true,
//       },
//       availablePlots: {
//         type: Number,
//         required: true,
//       },
//       plotSize: {
//         type: Number,
//         required: true,
//       },
//       sizeUnit: {
//         type: String,
//         required: true,
//       },
//       plotPrice: {
//         type: Number,
//         required: true,
//       },
//       priceUnit: {
//         type: String,
//       },
//       totalAmount: {
//         type: Number,
//         required: true,
//       },
//       address: {
//         pinCode: {
//           type: String,
//           required: false,
//         },
//         country: {
//           type: String,
//           default: "India",
//         },
//         state: {
//           type: String,
//           default: "Andhra Pradesh",
//         },
//         district: {
//           type: String,
//           required: true,
//         },
//         mandal: {
//           type: String,
//           required: true,
//         },
//         village: {
//           type: String,
//           required: true,
//         },
//         latitude: {
//           type: String,
//         },
//         longitude: {
//           type: String,
//         },
//         landMark: {
//           type: String,
//         },
//         currentLocation:{
//           type:String
//         }
//       },
//     },
//     amenities: {
//       underGroundWater: {
//         type: Boolean,
//       },
//       drainageSystem: {
//         type: Boolean,
//       },
//       roadType:{
//         type:String
//      },
//      distanceFromRoad: {
//       type: String,
//       required:false
//     },
//       electricityFacility: {
//         type: String,
//       },
//       swimmingPool: {
//         type: Boolean,
//       },
//       playZone: {
//         type: Boolean,
//       },
//       gym: {
//         type: Boolean,
//       },
//       conventionHall: {
//         type: Boolean,
//       },
//       medical: {
//         type: Number,
//       },
//       educational: {
//         type: Number,
//       },
//       extraAmenities: {
//         type: [String],
//       },
//     },

//     uploadPics: {
//       type: [String],
//       default:["https://res.cloudinary.com/ds1qogjpk/image/upload/v1735582521/commercial_qqcdbt.png"],
//     },

//     videos:{
//       type:[String],
//       required:false
//     },


//     propertyInterestedCount:{
//       type:Number
//     }
//   },
//   { timestamps: true }
// );

// const layoutModel = mongoose.model("Layouts", layoutSchema);

// module.exports = layoutModel;


const mongoose = require("mongoose");

// const layoutSchema = new mongoose.Schema(
//   {
//     userId: { type: String },
//     propertyId: { type: String },
//     enteredBy: { type: String },
//     role: { type: Number },
//     csrId: { type: String },
//     propertyType: { type: String, default: "Layout" },
//     propertyTypeTe: { type: String }, // Telugu translation
//     rating: { type: Number, default: 0 },
//     ratingCount: { type: Number, default: 0 },
//     status: { type: Number, default: 0 },
//     agentDetails: {
//       userId: { type: String },
//     },
//     ownerDetails: {
//       ownerName: { type: String, required: true },
//       ownerNameTe: { type: String }, // Telugu translation
//       ownerContact: { type: String, required: true },
//       ownerEmail: { type: String },
//     },
//     layoutDetails: {
//       reraRegistered: { type: Boolean },
//       dtcpApproved: { type: Boolean },
//       tlpApproved: { type: Boolean },
//       flpApproved: { type: Boolean },
//       layoutTitle: { type: String },
//       layoutTitleTe: { type: String }, // Telugu translation
//       description: { type: String },
//       descriptionTe: { type: String }, // Telugu translation
//       plotCount: { type: Number, required: true },
//       availablePlots: { type: Number, required: true },
//       plotSize: { type: Number, required: true },
//       sizeUnit: { type: String, required: true },
//       sizeUnitTe:{type: String },
//       plotPrice: { type: Number, required: true },
//       priceUnit: { type: String },
//       totalAmount: { type: Number, required: true },
//       address: {
//         pinCode: { type: String },
//         country: { type: String, default: "India" },
//         state: { type: String, default: "Andhra Pradesh" },
//         district: { type: String, required: true },
//         mandal: { type: String, required: true },
//         village: { type: String, required: true },
//         latitude: { type: String },
//         longitude: { type: String },
//         landMark: { type: String },
//         currentLocation: { type: String },
//         countryTe: { type: String },
//         stateTe: { type: String },
//         districtTe: { type: String },
//         mandalTe: { type: String },
//         villageTe: { type: String },
//       },
//     },
//     amenities: {
//       underGroundWater: { type: Boolean },
//       drainageSystem: { type: Boolean },
//       electricityFacility: { type: String },
//       electricityFacilityTe: { type: String }, // Telugu translation
//       swimmingPool: { type: Boolean },
//       playZone: { type: Boolean },
//       gym: { type: Boolean },
//       conventionHall: { type: Boolean },
//       medical: { type: Number },
//       educational: { type: Number },
//       roadType: { type: String },
//       roadTypeTe: { type: String }, // Telugu translation
//       distanceFromRoad: { type: String },
//       extraAmenities: { type: [String] },
//     },
//     uploadPics: {
//       type: [String],
//       default: ["https://res.cloudinary.com/default_image.png"],
//     },
//     videos: { type: [String] },
//     propertyInterestedCount: { type: Number },
//   },
//   { timestamps: true }
// );


const layoutSchema = new mongoose.Schema(
  {
    userId: { type: String },
    propertyId: { type: String },
    enteredBy: { type: String },
    role: { type: Number },
    csrId: { type: String },
    propertyType: { type: String, default: "Layout" },
    propertyTypeTe: { type: String }, // Telugu translation
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    agentDetails: {
      userId: { type: String },
    },
    ownerDetails: {
      ownerName: { type: String, required: true },
      ownerNameTe: { type: String }, // Telugu translation
      ownerContact: { type: String, required: true },
      ownerEmail: { type: String },
    },
    layoutDetails: {
      reraRegistered: { type: Boolean },
      dtcpApproved: { type: Boolean },
      tlpApproved: { type: Boolean },
      flpApproved: { type: Boolean },
      layoutTitle: { type: String },
      layoutTitleTe: { type: String }, // Telugu translation
      description: { type: String },
      descriptionTe: { type: String }, // Telugu translation
      plotCount: { type: Number, required: true },
      availablePlots: { type: Number, required: true },
      plotSize: { type: Number, required: true },
      sizeUnit: { type: String, required: true },
      sizeUnitTe: { type: String },
      plotPrice: { type: Number, required: true },
      priceUnit: { type: String },
      totalAmount: { type: Number, required: true },
      address: {
        pinCode: { type: String },
        country: { type: String, default: "India" },
        state: { type: String, default: "Andhra Pradesh" },
        district: { type: String, required: true },
        mandal: { type: String, required: true },
        village: { type: String, required: true },
        latitude: { type: String },
        longitude: { type: String },
        landMark: { type: String },
        currentLocation: { type: String },
        countryTe: { type: String },
        stateTe: { type: String },
        districtTe: { type: String },
        mandalTe: { type: String },
        villageTe: { type: String },
      },
    },
    amenities: {
      underGroundWater: { type: Boolean },
      drainageSystem: { type: Boolean },
      electricityFacility: { type: String },
      electricityFacilityTe: { type: String }, // Telugu translation
      swimmingPool: { type: Boolean },
      playZone: { type: Boolean },
      gym: { type: Boolean },
      conventionHall: { type: Boolean },
      medical: { type: Number },
      educational: { type: Number },
      roadType: { type: String },
      roadTypeTe: { type: String }, // Telugu translation
      distanceFromRoad: { type: String },
      extraAmenities: { type: [String] },
    },
    uploadPics: {
      type: [String],
      default: ["https://res.cloudinary.com/default_image.png"],
    },
    videos: { type: [String] },
    propertyInterestedCount: { type: Number },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Layouts", layoutSchema);
