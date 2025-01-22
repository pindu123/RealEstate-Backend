const Joi = require("joi");

// Function to capitalize the first letter of each word
const capitalizeWords = (value) => {
  if (typeof value === "string") {
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  return value;
};

// Validation for commercial property
// const commercialSchema = Joi.object({
//   userId: Joi.string().required(),
//   enteredBy: Joi.string().optional(),
//   propertyId:Joi.string().optional(),
//   propertyType: Joi.string().required(),

//   propertyTitle: Joi.string()
//     .required()
//     .custom((value) => {
//       return capitalizeWords(value);
//     }, "Capitalization for propertyTitle"),

//   rating: Joi.number().default(0), // Assuming rating can be optional
//   ratingCount: Joi.number().default(0), // Assuming ratingCount can be optional
//   status: Joi.number().default(0), // Assuming status can be optional
//   csrId: Joi.string().optional(),

//   propertyDetails: Joi.object({
//     owner: Joi.object({
//       ownerName: Joi.string()
//         .required()
//         .regex(/^[A-Za-z\s]+$/)
//         .custom((value) => {
//           return capitalizeWords(value);
//         }, "Capitalization for ownerName"),

//       ownerContact: Joi.string()
//         .length(10)
//         .pattern(/[6-9]{1}[0-9]{9}/)
//         .required(),

//       //ownerEmail: Joi.string().email().optional().lowercase(),
//       ownerEmail: Joi.string().email().optional().allow("").lowercase(),

//       isLegalDispute: Joi.boolean().required(),
//       disputeDesc: Joi.string().when("isLegalDispute", {
//         is: true, // When litigation is true
//         then: Joi.string().required(), // litigationDesc is required
//         otherwise: Joi.string().optional(), // If litigation is false, litigationDesc is optional
//       }),
//     }).required(),
//     agentDetails: Joi.object({ userId: Joi.string().optional() }).optional(),

//     landDetails: Joi.object({
//       sell: Joi.object({
//         plotSize: Joi.number().min(1).optional(),
//         sizeUnit: Joi.string().optional(),
//         price: Joi.number().min(0).optional(),
//         priceUnit: Joi.string().optional(),
//         totalAmount: Joi.number().min(0).optional(),
//         landUsage: Joi.array()
//           .items(
//             Joi.string().custom((value) => {
//               return capitalizeWords(value);
//             }, "Capitalization for landUsage")
//           )
//           .optional(),
//       }).optional(),

//       rent: Joi.object({
//         plotSize: Joi.number().min(1).optional(),
//         sizeUnit: Joi.string().optional(),
//         rent: Joi.number().min(0).optional(),
//         priceUnit: Joi.string().optional(),
//         noOfMonths: Joi.number().min(0).optional(),
//         totalAmount: Joi.number().min(0).optional(),
//         landUsage: Joi.array()
//           .items(
//             Joi.string().custom((value) => {
//               return capitalizeWords(value);
//             }, "Capitalization for landUsage")
//           )
//           .optional(),
//       }).optional(),

//       lease: Joi.object({
//         plotSize: Joi.number().min(1).optional(),
//         sizeUnit: Joi.string().optional(),
//         leasePrice: Joi.number().min(0).optional(),
//         priceUnit: Joi.string().optional(),
//         duration: Joi.number().min(0).optional(),
//         totalAmount: Joi.number().min(0).optional(),
//         landUsage: Joi.array()
//           .items(
//             Joi.string().custom((value) => {
//               return capitalizeWords(value);
//             }, "Capitalization for landUsage")
//           )
//           .optional(),
//       }).optional(),

//       address: Joi.object({
//         pinCode: Joi.string()
//           .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
//           .optional() // Makes the field optional
//           .allow(null) // Allows null as a valid value
//           .messages({
//             "string.pattern.base": "Pin code must be a valid 6-digit number.",
//           }),
//         country: Joi.string().default("India").required(),
//         state: Joi.string().default("Andhra Pradesh"),

//         district: Joi.string()
//           .required()
//           .custom((value) => {
//             return capitalizeWords(value);
//           }, "formatting district"),

//         mandal: Joi.string()
//           .required()
//           .custom((value) => {
//             return capitalizeWords(value);
//           }, "formatting mandal"),

//         village: Joi.string()
//           .required()
//           .custom((value) => {
//             return capitalizeWords(value);
//           }, "formatting village"),

//         latitude: Joi.string().optional(),
//         longitude: Joi.string().optional(),
//         landMark: Joi.string().optional(),
//       }).required(), // Address is required

//       description: Joi.string().optional(),
//     }).required(),

//     amenities: Joi.object({
//       isElectricity: Joi.string().optional(),
//       isWaterFacility: Joi.boolean().optional(),
//       isRoadFace: Joi.boolean().optional(),
//       roadType:Joi.string().optional(),
//       distanceFromRoad: Joi.string().optional(),
//       roadProximity:Joi.string().optional(),
//       extraAmenities: Joi.array()
//         .items(
//           Joi.string().custom((value) => {
//             return capitalizeWords(value);
//           }, "Capitalization for extra amenities")
//         )
//         .optional(),
//     }).optional(),

//     uploadPics: Joi.array().items(Joi.string()).optional(),
//     videos:Joi.array().items(Joi.any()).optional(),

//   }).optional(), // Property details is required
 
// });
const commercialSchema = Joi.object({
  userId: Joi.string().required(),
  enteredBy: Joi.string().optional(),
  propertyId: Joi.string().optional(),
  role: Joi.number().optional(),
  propertyType: Joi.string().required(),
  propertyTypeTe: Joi.string().optional(), // Telugu translation
  propertyInterestedCount: Joi.number().optional(),

  propertyTitle: Joi.string()
    .required()
    .custom((value) => capitalizeWords(value), "Capitalization for propertyTitle"),
  propertyTitleTe: Joi.string().optional(), // Telugu translation
  rating: Joi.number().default(0),
  ratingCount: Joi.number().default(0),
  status: Joi.number().default(0),
  csrId: Joi.string().optional(),

  propertyDetails: Joi.object({
    owner: Joi.object({
      ownerName: Joi.string()
        .required()
        .regex(/^[A-Za-z\s]+$/)
        .custom((value) => capitalizeWords(value), "Capitalization for ownerName"),
      ownerContact: Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required(),
      ownerEmail: Joi.string().email().optional().allow("").lowercase(),
      isLegalDispute: Joi.boolean().required(),
      disputeDesc: Joi.string().when("isLegalDispute", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.string().optional(),
      }),
    }).required(),
    agentDetails: Joi.object({
      userId: Joi.string().optional(),
    }).optional(),
    landDetails: Joi.object({
      sell: Joi.object({
        plotSize: Joi.number().min(1).optional(),
        sizeUnit: Joi.string().optional(),
        price: Joi.number().min(0).optional(),
        priceUnit: Joi.string().optional(),
        totalAmount: Joi.number().min(0).optional(),
        landUsage: Joi.array().items(Joi.string()).optional(),
        landUsageTe: Joi.array().items(Joi.string()).optional(), // Telugu translation
      }).optional(),
      rent: Joi.object({
        plotSize: Joi.number().min(1).optional(),
        sizeUnit: Joi.string().optional(),
        rent: Joi.number().min(0).optional(),
        priceUnit: Joi.string().optional(),
        noOfMonths: Joi.number().min(0).optional(),
        totalAmount: Joi.number().min(0).optional(),
        landUsage: Joi.array().items(Joi.string()).optional(),
        landUsageTe: Joi.array().items(Joi.string()).optional(), // Telugu translation
      }).optional(),
      lease: Joi.object({
        plotSize: Joi.number().min(1).optional(),
        sizeUnit: Joi.string().optional(),
        leasePrice: Joi.number().min(0).optional(),
        priceUnit: Joi.string().optional(),
        duration: Joi.number().min(0).optional(),
        totalAmount: Joi.number().min(0).optional(),
        landUsage: Joi.array().items(Joi.string()).optional(),
        landUsageTe: Joi.array().items(Joi.string()).optional(), // Telugu translation
      }).optional(),
      address: Joi.object({
        pinCode: Joi.string().pattern(/^[0-9]{6}$/).optional().allow(null),
        country: Joi.string().default("India").required(),
        state: Joi.string().default("Andhra Pradesh"),
        district: Joi.string()
          .required()
          .custom((value) => capitalizeWords(value), "Capitalization for district"),
        districtTe: Joi.string().optional(), // Telugu translation
        mandal: Joi.string()
          .required()
          .custom((value) => capitalizeWords(value), "Capitalization for mandal"),
        mandalTe: Joi.string().optional(), // Telugu translation
        village: Joi.string()
          .required()
          .custom((value) => capitalizeWords(value), "Capitalization for village"),
        villageTe: Joi.string().optional(), // Telugu translation
        latitude: Joi.string().optional(),
        longitude: Joi.string().optional(),
        landMark: Joi.string().optional(),
        landMarkTe: Joi.string().optional(), // Telugu translation
      }).required(),
      description: Joi.string().optional(),
      descriptionTe: Joi.string().optional(), // Telugu translation
    }).required(),
    amenities: Joi.object({
      isElectricity: Joi.string().optional(),
      isElectricityTe: Joi.string().optional(), // Telugu translation
      isWaterFacility: Joi.boolean().optional(),
      isRoadFace: Joi.boolean().optional(),
      roadType: Joi.string().optional(),
      roadTypeTe: Joi.string().optional(), // Telugu translation
      distanceFromRoad: Joi.string().optional(),
      roadProximity: Joi.string().optional(),
      roadProximityTe: Joi.string().optional(), // Telugu translation
      extraAmenities: Joi.array().items(Joi.string()).optional(),
      extraAmenitiesTe: Joi.array().items(Joi.string()).optional(), // Telugu translation
    }).optional(),
    uploadPics: Joi.array().items(Joi.string()).optional(),
    videos: Joi.array().items(Joi.string().allow(null)).optional(),
  }).required(),
});


module.exports = { commercialSchema };
