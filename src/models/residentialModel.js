
// const residentialSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//       required: true,
//     },
//     propertyId:{
//       type:String,
//     },
//     csrId: {
//       type: String,
//     },
//     enteredBy: {
//       type: String,
//     },
//     propertyType: {
//       type: String,
//       required: false,
//     },
//     rating: {
//       type: Number,
//       default: 0,
//     },
//     ratingCount: {
//       type: Number,
//       default: 0,
//     },
//     countOfRatings: {
//       type: Object,
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

//     owner: {
//       ownerName: {
//         type: String,
//         required: true,
//       },
//       ownerEmail: {
//         type: String,
//         trim: true,
//         required: false,
//         sparse: true,
//       },
//       contact: {
//         type: String,
//         required: true,
//       },
//     },
//     propertyDetails: {
//       type: {
//         type: String,
//         required: false,
//       },
//       apartmentName: {
//         type: String,
//       },
//       flatNumber: {
//         type: String,
//       },
//       apartmentLayout: {
//         type: String,
//       },
//       flatSize: {
//         type: Number,
//       },
//       sizeUnit: {
//         type: String,
//         required: true,
//       },
//       priceUnit: {
//         type: String,
//       },
//       flatCost: {
//         type: Number,
//       },
//       totalCost: {
//         type: Number,
//       },
//       flatFacing: {
//         type: String,
//       },

//       furnitured: {
//         type: String,
//       },
//       propDesc: {
//         type: String,
//       },
//     },
//     address: {
//       pincode: {
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
//       },
//       longitude: {
//         type: String,
//       },
//       landMark: {
//         type: String,
//       },
//       currentLocation:{
//         type:String
//       }
//     },
//     amenities: {
//       powerSupply: {
//         type: Boolean,
//       },
//       waterFacility: {
//         type: Boolean,
//       },
//       electricityFacility: {
//         type: String,
//       },
//       elevator: {
//         type: Boolean,
//       },

//       watchman: {
//         type: Boolean,
//       },
//       cctv: {
//         type: Boolean,
//       },
//       medical: {
//         type: Number,
//       },
//       educational: {
//         type: Number,
//       },
//       grocery: {
//         type: Number,
//       },
//       gymFacility: {
//         type: Boolean,
//       },
//       roadType:{
//         type:String
//      },
//      distanceFromRoad: {
//       type: String,
//       required:false
//     },
//     },
//     propPhotos: {
//       type: [String],
//       default:["https://res.cloudinary.com/ds1qogjpk/image/upload/v1735582521/commercial_qqcdbt.png"],
//     },
//     videos:{
//       type:[String],
//       required:false
//     },
//     configurations: {
//       bathroomCount: {
//         type: Number,
//         required: true,
//       },
//       balconyCount: {
//         type: Number,
//         required: true,
//       },
//       floorNumber: {
//         type: Number,
//         required: true,
//       },
//       propertyAge: {
//         type: Number,
//         required: true,
//       },
//       maintenanceCost: {
//         type: Number,
//         required: true,
//       },
//       visitorParking: {
//         type: Boolean,
//         required: true,
//       },
//       waterSource: {
//         type: [String],
//         required: true,
//       },
//       playZone: {
//         type: Boolean,
//         required: true,
//       },
//       extraAmenities: {
//         type: [String],
//       },
//     },

//     propertyInterestedCount:{
//       type:Number
//     }
//   },
//   { timestamps: true }
// );


const { string, required } = require("joi");
const mongoose = require("mongoose");


// const residentialSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//       required: true,
//     },
//     propertyId: {
//       type: String,
//     },
//     csrId: {
//       type: String,
//     },
//     enteredBy: {
//       type: String,
//     },
//     propertyType: {
//       type: String,
//       required: false,
//     },
//     propertyTypeTe: { // Telugu translation
//       type: String,
//       required: false,
//     },
   
//     rating: {
//       type: Number,
//       default: 0,
//     },
//     ratingCount: {
//       type: Number,
//       default: 0,
//     },
//     countOfRatings: {
//       type: Object,
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

//     owner: {
//       ownerName: {
//         type: String,
//         required: true,
//       },
//       ownerNameTe: { // Telugu translation
//         type: String,
//         required: false,
//       },
//       ownerEmail: {
//         type: String,
//         trim: true,
//         required: false,
//         sparse: true,
//       },
//       contact: {
//         type: String,
//         required: true,
//       },
//     },
//     propertyDetails: {
//       type: {
//         type: String,
//         required: false,
//       },
//       typeTe: { 
//         type: String,
//         required: false,
//       },
//       apartmentName: {
//         type: String,
//       },
//       apartmentNameTe: { 
//         type: String,
//       },

//       flatCount:{
//         type:Number,
//         required:false,
//       },
//       availableFlats:{
//         type:Number,
//         required:false,
//       },
//       flatNumber: {
//         type: String,
//       },
//       apartmentLayout: {
//         type: String,
//       },
//       flatSize: {
//         type: Number,
//       },
//       sizeUnit: {
//         type: String,
//         required: true,
//       },
//       priceUnit: {
//         type: String,
//       },
//       flatCost: {
//         type: Number,
//       },
//       totalCost: {
//         type: Number,
//       },
//       flatFacing: {
//         type: String,
//       },

//       furnitured: {
//         type: String,
//       },
//       propDesc: {
//         type: String,
//       },
//       propDescTe: {
//         type: String,
//       },
//     },
//     address: {
//       pincode: {
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
//       districtTe: { // Telugu translation
//         type: String,
//       },
//       mandal: {
//         type: String,
//         required: true,
//       },
//       mandalTe: { // Telugu translation
//         type: String,
//       },
//       village: {
//         type: String,
//         required: true,
//       },
//       villageTe: { // Telugu translation
//         type: String,
//       },
//       latitude: {
//         type: String,
//       },
//       longitude: {
//         type: String,
//       },
//       landMark: {
//         type: String,
//       },
//       landMarkTe: { // Telugu translation
//         type: String,
//       },
//     },
//     amenities: {
//       powerSupply: {
//         type: Boolean,
//       },
//       waterFacility: {
//         type: Boolean,
//       },
//       electricityFacility: {
//         type: String,
//       },
//       elevator: {
//         type: Boolean,
//       },

//       watchman: {
//         type: Boolean,
//       },
//       cctv: {
//         type: Boolean,
//       },
//       medical: {
//         type: Number,
//       },
//       educational: {
//         type: Number,
//       },
//       grocery: {
//         type: Number,
//       },
//       gymFacility: {
//         type: Boolean,
//       },
//       roadType:{
//         type:String
//      },
//      distanceFromRoad: {
//       type: String,
//       required:false
//     },
//     },
//     propPhotos: {
//       type: [String],
//       default:["https://res.cloudinary.com/ds1qogjpk/image/upload/v1735582521/commercial_qqcdbt.png"],
//     },
//     videos:{
//       type:[String],
//       required:false
//     },
//     configurations: {
//       bathroomCount: {
//         type: Number,
//         required: true,
//       },
//       balconyCount: {
//         type: Number,
//         required: true,
//       },
//       floorNumber: {
//         type: Number,
//         required: true,
//       },
//       propertyAge: {
//         type: Number,
//         required: true,
//       },
//       maintenanceCost: {
//         type: Number,
//         required: true,
//       },
//       visitorParking: {
//         type: Boolean,
//         required: true,
//       },
//       waterSource: {
//         type: [String],
//         required: true,
//       },
//       playZone: {
//         type: Boolean,
//         required: true,
//       },
//       extraAmenities: {
//         type: [String],
//       },
//     },
//     propertyOnHold:{
//       type:String,
//     },
//     propertyInterestedCount:{
//             type:Number
//    },
//     // Amenities, configurations, and other fields remain the same.
//   },
//   { timestamps: true }
// );


const residentialSchema = new mongoose.Schema(
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
    propertyType: {
      type: String,
      required: false,
    },
    propertyTypeTe: { // Telugu translation
      type: String,
      required: false,
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

    owner: {
      ownerName: {
        type: String,
        required: true,
      },
      ownerNameTe: { // Telugu translation
        type: String,
        required: false,
      },
      ownerEmail: {
        type: String,
        trim: true,
        required: false,
        sparse: true,
      },
      contact: {
        type: String,
        required: true,
      },
    },
    propertyDetails: {
      type: {
        type: String,
        required: false,
      },
      typeTe: { 
        type: String,
        required: false,
      },
      apartmentName: {
        type: String,
      },
      apartmentNameTe: { 
        type: String,
      },
      
      flatCount:{
        type:Number,
        required:false,
      },
      availableFlats:{
        type:Number,
        required:false,
      },
      flatNumber: {
        type: String,
      },
      apartmentLayout: {
        type: String,
      },
      flatSize: {
        type: Number,
      },
      sizeUnit: {
        type: String,
        required: true,
      },
      priceUnit: {
        type: String,
      },
      flatCost: {
        type: Number,
      },
      totalCost: {
        type: Number,
      },
      flatFacing: {
        type: String,
      },

      
      furnitured: {
        type: String,
      },
      propDesc: {
        type: String,
      },
      propDescTe: {
        type: String,
      },
propertyPurpose:{
type:String
},

propertyPurposeTe:{
  type:String
  },

      flat:[{
        flatNumber:{
          type:Number,
        },
        flatFacing:{
          type:String,
        },
         bedroomCount:{
          type:Number,
         },
         floorNumber:{
          type:Number,
         },
         furnitured:
         {
          type:String,
         },
         flatSize:{
          type:Number,
         },
         flatSizeUnit:{
          type:String,
         },
         balconyCount:{
          type:Number,
         },
         flatCost: {
          type: Number,
        },
        propertyLayout:{
          type:String
        }
      }],
    },
    address: {
      pincode: {
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
      districtTe: { // Telugu translation
        type: String,
      },
      mandal: {
        type: String,
        required: true,
      },
      mandalTe: { // Telugu translation
        type: String,
      },
      village: {
        type: String,
        required: true,
      },
      villageTe: { // Telugu translation
        type: String,
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
      landMarkTe: { // Telugu translation
        type: String,
      },
    },
    amenities: {
      nearBy:{
        type:String,
        required:false,
      },
      powerSupply: {
        type: Boolean,
      },
      waterFacility: {
        type: Boolean,
      },
      electricityFacility: {
        type: String,
        default:'Residential'
      },
      elevator: {
        type: Boolean,
      },

      watchman: {
        type: Boolean,
      },
      cctv: {
        type: Boolean,
      },
      medical: {
        type: Number,
      },
      educational: {
        type: Number,
      },
      grocery: {
        type: Number,
      },
      gymFacility: {
        type: Boolean,
      },
      roadType:{
        type:String
     },
     distanceFromRoad: {
      type: String,
      required:false
    },
    distanceFromRoadTe: {
      type: String,
      required:false
    },
    },
    propPhotos: {
      type: [String],
      default:["https://res.cloudinary.com/ds1qogjpk/image/upload/v1735582521/commercial_qqcdbt.png"],
    },
    videos:{
      type:[String],
      required:false
    },
    configurations: {
      bathroomCount: {
        type: Number,
        required: true,
      },
      balconyCount: {
        type: Number,
        required: true,
      },
      floorNumber: {
        type: Number,
        required: true,
      },
      propertyAge: {
        type: Number,
        required: true,
      },
      maintenanceCost: {
        type: Number,
        required: true,
      },
      visitorParking: {
        type: Boolean,
        required: true,
      },
      waterSource: {
        type: [String],
        required: true,
      },
      playZone: {
        type: Boolean,
        required: true,
      },
      extraAmenities: {
        type: [String],
      },
    },
    propertyOnHold:{
      type:String,
      default:'no'

    },
    propertyInterestedCount:{
            type:Number
   },
    // Amenities, configurations, and other fields remain the same.
  },
  { timestamps: true }
);
const residentialModel = mongoose.model("residential", residentialSchema);

module.exports = residentialModel;
