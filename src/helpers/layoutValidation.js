

// const capitalizeWords = (value) => {
//   if (typeof value === "string") {
//     return value
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(" ");
//   }
//   return value;
// };

//Joi schema for layout details validation

// in use


// const layoutValidationSchema = Joi.object({
//   userId: Joi.string().optional(),
//   enteredBy: Joi.string().optional(),
//   propertyId:Joi.string().optional(),
//   role: Joi.number().optional(),
//   propertyType: Joi.string().default("Layout"),
//   rating: Joi.number().default(0),
//   ratingCount: Joi.number().default(0),
//   status: Joi.number().default(0),
//   csrId: Joi.string().optional(),

//   agentDetails: Joi.object({ userId: Joi.string().optional() }).optional(),

//   ownerDetails: Joi.object({
//     ownerName: Joi.string()
//       .required()
//       .custom((value) => {
//         return capitalizeWords(value);
//       }, "Capitalization for OwnerName"),
//     ownerContact: Joi.string()
//       .length(10)
//       .pattern(/[6-9]{1}[0-9]{9}/)
//       .required()
//       .messages({
//         "string.pattern.base": "Phone number must be a valid 10-digit number.",
//       }),
//     ownerEmail: Joi.string().email().optional().allow("").lowercase(),
//   }).required(),
//   layoutDetails: Joi.object({
//     reraRegistered: Joi.boolean().required(),
//     dtcpApproved: Joi.boolean().required(),
//     tlpApproved: Joi.boolean().required(),
//     flpApproved: Joi.boolean().required(),
//     layoutTitle: Joi.string()
//       .required()
//       .custom((value) => {
//         return capitalizeWords(value);
//       }, "Capitalization for layoutTitle"),
//     description: Joi.string().optional(),
//     plotCount: Joi.number().required().min(0),
//     availablePlots: Joi.number().required().min(0).max(Joi.ref("plotCount")),
//     plotSize: Joi.number().required().min(0.1),
//     sizeUnit: Joi.string().required(),
//     plotPrice: Joi.number().required().min(0),
//     priceUnit: Joi.string().required(),
//     totalAmount: Joi.number().required(),
//     address: Joi.object({
//       //
//       pinCode: Joi.string()
//         .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
//         .optional() // Makes the field optional
//         .allow(null) // Allows null as a valid value
//         .messages({
//           "string.pattern.base": "Pin code must be a valid 6-digit number.",
//         }),
//       country: Joi.string()
//         .default("India")
//         .required()
//         .custom((value) => {
//           return capitalizeWords(value);
//         }, "Capitalization for country"),
//       state: Joi.string()
//         .default("Andhra Pradesh")
//         .required()
//         .custom((value) => {
//           return capitalizeWords(value);
//         }, "Capitalization for state"),
//       district: Joi.string()
//         .required()
//         .custom((value) => {
//           return capitalizeWords(value);
//         }, "Capitalization for district"),
//       mandal: Joi.string()
//         .required()
//         .custom((value) => {
//           return capitalizeWords(value);
//         }, "Capitalization for mandal"),
//       village: Joi.string()
//         .required()
//         .custom((value) => {
//           return capitalizeWords(value);
//         }, "Capitalization for village"),

//       latitude: Joi.string().optional(),
//       longitude: Joi.string().optional(),
//       landMark: Joi.string().optional(),
//       currentLocation:Joi.string().optional()
//     }).required(),
//   }).required(),
//   amenities: Joi.object({
//     underGroundWater: Joi.boolean().required(),
//     drainageSystem: Joi.boolean().required(),
//     electricityFacility: Joi.string().optional(),
//     swimmingPool: Joi.boolean().required(),
//     playZone: Joi.boolean().required(),
//     gym: Joi.boolean().required(),
//     conventionHall: Joi.boolean().required(),
//     roadType:Joi.string().optional(),
//     distanceFromRoad: Joi.string().optional(),

//     medical: Joi.number().optional().min(0),
//     educational: Joi.number().optional().min(0),
//     extraAmenities: Joi.array()
//       .items(
//         Joi.string().custom((value) => {
//           return capitalizeWords(value);
//         }, "Capitalization for extra amenities")
//       )
//       .optional(),
//   }).optional(),

//   uploadPics: Joi.array().items(Joi.string()).optional(),
//   videos:Joi.array().items(Joi.any()).optional(),
//   propertyInterestedCount:Joi.number().optional()
// });
const Joi = require("joi");

// Helper function to capitalize words
const capitalizeWords = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase());

const layoutValidationSchema = Joi.object({
  userId: Joi.string().optional(),
  enteredBy: Joi.string().optional(),
  propertyId: Joi.string().optional(),
  role: Joi.number().optional(),
  propertyType: Joi.string().default("Layout"),
  rating: Joi.number().default(0),
  ratingCount: Joi.number().default(0),
  status: Joi.number().default(0),
  csrId: Joi.string().optional(),

  agentDetails: Joi.object({ userId: Joi.string().optional() }).optional(),

  ownerDetails: Joi.object({
    ownerName: Joi.string()
      .required()
      .custom((value) => capitalizeWords(value), "Capitalization for OwnerName"),
    ownerContact: Joi.string()
      .length(10)
      .pattern(/[6-9]{1}[0-9]{9}/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be a valid 10-digit number.",
      }),
    ownerEmail: Joi.string().email().optional().allow("").lowercase(),
  }).required(),

  layoutDetails: Joi.object({
    reraRegistered: Joi.boolean().required(),
    dtcpApproved: Joi.boolean().required(),
    tlpApproved: Joi.boolean().required(),
    flpApproved: Joi.boolean().required(),

    brochure:Joi.string().optional(),
    layoutTitle: Joi.string()
      .required()
      .custom((value) => capitalizeWords(value), "Capitalization for LayoutTitle"),
    description: Joi.string().optional(),
    plotCount: Joi.number().required().min(0),
    availablePlots: Joi.number().required().min(0).max(Joi.ref("plotCount")),
        plotSize: Joi.number().required().min(0.1),
        sizeUnit: Joi.string().required(),
        sizeUnitTe: Joi.string().optional(),
        plotPrice: Joi.number().required().min(0),
        priceUnit: Joi.string().required(),
        totalAmount: Joi.number().required(),
    plots: Joi.array()
      .items(
        Joi.object({
          plotId: Joi.number().optional(), // Optional because it's generated automatically
          plotSize: Joi.number().required().min(0.1),
          sizeUnit: Joi.string().required(),
          plotLength:Joi.number().optional(),
          plotWidth:Joi.number().optional(),
          sizeUnitTe: Joi.string().optional(),
          plotAmount: Joi.number().optional().min(0),
        })
      )
      .required()
 ,

    address: Joi.object({
      pinCode: Joi.string()
        .pattern(/^[0-9]{6}$/)
        .optional()
        .allow(null)
        .messages({
          "string.pattern.base": "Pin code must be a valid 6-digit number.",
        }),
      country: Joi.string()
        .default("India")
        .required()
        .custom((value) => capitalizeWords(value), "Capitalization for Country"),
      state: Joi.string()
        .default("Andhra Pradesh")
        .required()
        .custom((value) => capitalizeWords(value), "Capitalization for State"),
      district: Joi.string()
        .required()
        .custom((value) => capitalizeWords(value), "Capitalization for District"),
      mandal: Joi.string()
        .required()
        .custom((value) => capitalizeWords(value), "Capitalization for Mandal"),
      village: Joi.string()
        .required()
        .custom((value) => capitalizeWords(value), "Capitalization for Village"),
      latitude: Joi.string().optional(),
      longitude: Joi.string().optional(),
      landMark: Joi.string().optional(),
      currentLocation: Joi.string().optional(),
    }).required(),
  }).required(),

  amenities: Joi.object({
    underGroundWater: Joi.boolean().required(),
    drainageSystem: Joi.boolean().required(),
    electricityFacility: Joi.string().optional(),
    swimmingPool: Joi.boolean().required(),
    playZone: Joi.boolean().required(),
    gym: Joi.boolean().required(),
    conventionHall: Joi.boolean().required(),
    roadType: Joi.string().optional(),
    distanceFromRoad: Joi.string().optional(),
    medical: Joi.number().optional().min(0),
    educational: Joi.number().optional().min(0),
    extraAmenities: Joi.array()
      .items(
        Joi.string().custom((value) => capitalizeWords(value), "Capitalization for Extra Amenities")
      )
      .optional(),
  }).optional(),

  uploadPics: Joi.array().items(Joi.string()).optional(),
  videos: Joi.array().items(Joi.any()).optional(),
  propertyInterestedCount: Joi.number().optional(),
});

// const layoutValidationSchema = Joi.object({
//   userId: Joi.string().required(),
//   propertyId: Joi.string().optional(),
//   enteredBy: Joi.string().required(),
//   role: Joi.number().required(),
//   propertyType: Joi.string().default("Layout"),
//   rating: Joi.number().default(0),
//   ratingCount: Joi.number().default(0),
//   status: Joi.number().default(0),
//   agentDetails: Joi.object({
//     userId: Joi.string().optional(),
//   }).optional(),
//   ownerDetails: Joi.object({
//     ownerName: Joi.string().required(),
//     ownerContact: Joi.string()
//       .length(10)
//       .pattern(/[6-9]{1}[0-9]{9}/)
//       .required(),
//     ownerEmail: Joi.string().email().optional(),
//   }).required(),
//   layoutDetails: Joi.object({
//     reraRegistered: Joi.boolean().required(),
//     dtcpApproved: Joi.boolean().required(),
//     tlpApproved: Joi.boolean().required(),
//     flpApproved: Joi.boolean().required(),
//     layoutTitle: Joi.string().required(),
//     description: Joi.string().optional(),
//     plotCount: Joi.number().required().min(0),
//     availablePlots: Joi.number().required().min(0),
//     plotSize: Joi.number().required().min(0.1),
//     sizeUnit: Joi.string().required(),
//     plotPrice: Joi.number().required().min(0),
//     priceUnit: Joi.string().required(),
//     totalAmount: Joi.number().required(),
//     address: Joi.object({
//       pinCode: Joi.string().optional(),
//       country: Joi.string().default("India").required(),
//       state: Joi.string().default("Andhra Pradesh").required(),
//       district: Joi.string().required(),
//       mandal: Joi.string().required(),
//       village: Joi.string().required(),
//       latitude: Joi.string().optional(),
//       longitude: Joi.string().optional(),
//     }).required(),
//   }).required(),
//   amenities: Joi.object({
//     underGroundWater: Joi.boolean().optional(),
//     drainageSystem: Joi.boolean().optional(),
//     electricityFacility: Joi.string().optional(),
//     swimmingPool: Joi.boolean().optional(),
//     playZone: Joi.boolean().optional(),
//     gym: Joi.boolean().optional(),
//     conventionHall: Joi.boolean().optional(),
//     roadType: Joi.string().optional(),
//     distanceFromRoad: Joi.string().optional(),
//   }).optional(),
//   uploadPics: Joi.array().items(Joi.string()).optional(),
//   videos: Joi.array().items(Joi.string()).optional(),
//   propertyInterestedCount: Joi.number().optional(),
// });


//update plots schema


const updatePlotsValidationSchema = Joi.object({
  userId: Joi.string().required(),
  propertyId: Joi.string().required().messages({
    "string.empty": "Property ID is required.",
    "any.required": "Property ID is required.",
  }),
  availablePlots: Joi.number().required().min(0).messages({
    "number.base": "Available plots must be a number.",
    "number.min": "Available plots cannot be negative.",
    "any.required": "Available plots are required.",
  }),
});




module.exports = {
  layoutValidationSchema,
  updatePlotsValidationSchema,
};
