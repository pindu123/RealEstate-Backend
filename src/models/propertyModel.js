// const mongoose = require("mongoose");

// const unifiedPropertySchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
//     propertyId: { type: String },
//     csrId: { type: String },
//     enteredBy: { type: String },
//     role: { type: Number }, // Specific to layouts and fields
//     propertyType: { type: String, required: true }, // Type: Residential, Commercial, Layout, Field, etc.
//     propertyTypeTe: { type: String }, // Telugu translation
//     propertyTitle: { type: String }, // For commercial properties
//     propertyTitleTe: { type: String }, // Telugu translation
//     rating: { type: Number, default: 0 },
//     ratingCount: { type: Number, default: 0 },
//     countOfRatings: { type: Object }, // Ratings breakdown
//     status: { type: Number, default: 0 },

//     // Agent Details
//     agentDetails: {
//       userId: { type: String },
//     },

//     // Owner Details
//     ownerDetails: {
//       ownerName: { type: String, required: true },
//       ownerNameTe: { type: String }, // Telugu translation
//       ownerContact: { type: String, required: true },
//       ownerEmail: { type: String },
//       isLegalDispute: { type: Boolean }, // For commercial properties
//       disputeDesc: { type: String },
//       disputeDescTe: { type: String }, // Telugu translation
//     },

//     // Property Details
//     propertyDetails: {
//       apartmentName: { type: String },
//       apartmentNameTe: { type: String }, // Telugu translation
//       flatNumber: { type: String },
//       apartmentLayout: { type: String },
//       flatSize: { type: Number },
//       sizeUnit: { type: String, required: true },
//       priceUnit: { type: String },
//       flatCost: { type: Number },
//       totalCost: { type: Number },
//       flatFacing: { type: String },
//       furnitured: { type: String },
//       propDesc: { type: String },
//       propDescTe: { type: String }, // Telugu translation
//       layoutDetails: {
//         reraRegistered: { type: Boolean },
//         dtcpApproved: { type: Boolean },
//         tlpApproved: { type: Boolean },
//         flpApproved: { type: Boolean },
//         layoutTitle: { type: String },
//         layoutTitleTe: { type: String }, // Telugu translation
//         plotCount: { type: Number },
//         availablePlots: { type: Number },
//         plotSize: { type: Number },
//         totalAmount: { type: Number },
//       },
//       landDetails: {
//         title: { type: String },
//         titleTe: { type: String }, // Telugu translation
//         surveyNumber: { type: String },
//         landType: { type: String },
//         landTypeTe: { type: String }, // Telugu translation
//         crops: { type: [String] },
//         litigation: { type: Boolean },
//         litigationDesc: { type: String },
//         sell: {
//           plotSize: { type: String },
//           sizeUnit: { type: String },
//           price: { type: Number },
//           priceUnit: { type: String },
//           totalAmount: { type: Number },
//         },
//         rent: {
//           plotSize: { type: String },
//           sizeUnit: { type: String },
//           rent: { type: Number },
//           priceUnit: { type: String },
//           noOfMonths: { type: Number },
//           totalAmount: { type: Number },
//         },
//         lease: {
//           plotSize: { type: String },
//           sizeUnit: { type: String },
//           leasePrice: { type: Number },
//           priceUnit: { type: String },
//           duration: { type: Number },
//           totalAmount: { type: Number },
//         },
//       },
//     },

//     // Address
//     address: {
//       pinCode: { type: String },
//       country: { type: String, default: "India" },
//       state: { type: String, default: "Andhra Pradesh" },
//       district: { type: String, required: true },
//       mandal: { type: String, required: true },
//       village: { type: String, required: true },
//       latitude: { type: String },
//       longitude: { type: String },
//       landMark: { type: String },
//       countryTe: { type: String },
//       stateTe: { type: String },
//       districtTe: { type: String },
//       mandalTe: { type: String },
//       villageTe: { type: String },
//     },

//     // Amenities
//     amenities: {
//       powerSupply: { type: Boolean },
//       waterFacility: { type: Boolean },
//       elevator: { type: Boolean },
//       cctv: { type: Boolean },
//       medical: { type: Number },
//       educational: { type: Number },
//       roadType: { type: String },
//       distanceFromRoad: { type: String },
//       extraAmenities: { type: [String] },
//     },

//     // Media
//     propPhotos: { type: [String], default: [] },
//     videos: { type: [String], default: [] },

//     // Configurations
//     configurations: {
//       bathroomCount: { type: Number },
//       balconyCount: { type: Number },
//       floorNumber: { type: Number },
//       propertyAge: { type: Number },
//       maintenanceCost: { type: Number },
//       visitorParking: { type: Boolean },
//       waterSource: { type: [String] },
//       playZone: { type: Boolean },
//     },

//     // Interested Count
//     propertyInterestedCount: { type: Number },
//   },
//   { timestamps: true }
// );

// const UnifiedPropertyModel = mongoose.model("UnifiedProperty", unifiedPropertySchema);

// module.exports = UnifiedPropertyModel;

