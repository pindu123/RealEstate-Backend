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

// Validation for residential property
// const residentialSchema = Joi.object({
//   userId: Joi.string().required(),
//   propertyId:Joi.string().optional(),
//   enteredBy: Joi.string().optional(),
//   propertyInterestedCount:Joi.number().optional(),
//   propertyType: Joi.string().required(),
//   agentDetails: Joi.object({ userId: Joi.string().optional() }).optional(),

//   rating: Joi.number().default(0),
//   ratingCount: Joi.number().default(0),
//   status: Joi.number().default(0),
//   csrId: Joi.string().optional(),
//   owner: Joi.object({
//     ownerName: Joi.string()
//       .required()
//       .regex(/^[A-Za-z\s]+$/)
//       .custom((value) => {
//         return capitalizeWords(value);
//       }, "Capitalization for ownerName")
//       .required(),

//     ownerEmail: Joi.string().email().optional().allow("").lowercase(),

//     contact: Joi.string()
//       .length(10)
//       .pattern(/[6-9]{1}[0-9]{9}/)
//       .required(),
//   }).required(),

//   propertyDetails: Joi.object({
//     type: Joi.string(),

//     apartmentName: Joi.string()
//       .required()
//       .custom((value) => {
//         return capitalizeWords(value);
//       }, "Capitalization for appartmentName"),

//     flatNumber: Joi.string().required(),

//     apartmentLayout: Joi.string().required(),

//     flatSize: Joi.number().required(),
//     sizeUnit: Joi.string().required(),

//     flatCost: Joi.number().required().min(0),
//     priceUnit: Joi.string().required(),

//     totalCost: Joi.number().required().min(0),

//     flatFacing: Joi.string().required(),

//     furnitured: Joi.string().required(),

//     propDesc: Joi.string().optional(),
//   }).required(),

//   address: Joi.object({
//     // pincode: Joi.string()
//     //   .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
//     //   .optional()
//     pinCode: Joi.string()
//       .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
//       .optional() // Makes the field optional
//       .allow(null) // Allows null as a valid value
//       .messages({
//         "string.pattern.base": "Pin code must be a valid 6-digit number.",
//       }),

//     country: Joi.string().default("India").required(),
//     state: Joi.string().default("Andhra Pradesh").required(),

//     district: Joi.string()
//       .required()
//       .custom((value) => {
//         return capitalizeWords(value);
//       }, "formatting district"),

//     mandal: Joi.string()
//       .required()
//       .custom((value) => {
//         return capitalizeWords(value);
//       }, "formatting mandal"),

//     village: Joi.string()
//       .required()
//       .custom((value) => {
//         return capitalizeWords(value);
//       }, "formatting village"),
//     latitude: Joi.string().optional(),
//     longitude: Joi.string().optional(),
//     landMark: Joi.string().optional(),
//     currentLocation:Joi.string().optional(),
//   }).required(), // Address is required

//   amenities: Joi.object({
//     powerSupply: Joi.string().required(),
//     waterFacility: Joi.boolean().required(),
//     electricityFacility: Joi.string().optional(),
//     roadType:Joi.string().optional(),
//     distanceFromRoad: Joi.string().optional(),
//     elevator: Joi.boolean().required(),
//     watchman: Joi.boolean().required(),
//     cctv: Joi.boolean().required(),
//     medical: Joi.number().min(0).required(),
//     educational: Joi.number().min(0).required(),
//     grocery: Joi.number().min(0).required(),
//     gymFacility: Joi.boolean().required(),
 
//   }).optional(),

//   propPhotos: Joi.array().items(Joi.string()).optional(),
//   videos:Joi.array().items(Joi.any()).optional(),

//   configurations: Joi.object({
//     bathroomCount: Joi.number().min(0).required(),
//     balconyCount: Joi.number().min(0).required(),
//     floorNumber: Joi.number().min(0).required(),
//     propertyAge: Joi.number().min(0).required(),
//     maintenanceCost: Joi.number().min(0).required(),
//     visitorParking: Joi.boolean().required(),
//     waterSource: Joi.array()
//       .items(
//         Joi.string().custom((value) => {
//           return capitalizeWords(value);
//         }, "Capitalization for watersource")
//       )
//       .required(),
//     playZone: Joi.boolean().required(),
//     extraAmenities: Joi.array()
//     .items(
//       Joi.string().custom((value) => {
//         return capitalizeWords(value);
//       }, "Capitalization for extra amenities")
//     ).optional(),
//   }).required(),
 
// });


const residentialSchema = Joi.object({
  userId: Joi.string().required(),
  propertyId: Joi.string().optional(),
  enteredBy: Joi.string().optional(),
  propertyInterestedCount: Joi.number().optional(),
  propertyTypeTe:Joi.string(),
  propertyType: Joi.string().required(),
  agentDetails: Joi.object({ userId: Joi.string().optional() }).optional(),

  rating: Joi.number().default(0),
  ratingCount: Joi.number().default(0),
  status: Joi.number().default(0),
  csrId: Joi.string().optional(),
  owner: Joi.object({
    ownerName: Joi.string()
      .required()
      .regex(/^[A-Za-z\s]+$/)
      .custom((value) => {
        return capitalizeWords(value);
      }, "Capitalization for ownerName")
      .messages({
        "string.pattern.base": "Owner name can only contain alphabets and spaces.",
      }),
      ownerNameTe:Joi.string().optional(0),
    ownerEmail: Joi.string()
      .email()
      .optional()
      .allow("")
      .lowercase()
      .messages({
        "string.email": "Please provide a valid email address.",
      }),

    contact: Joi.string()
      .length(10)
      .pattern(/[6-9]{1}[0-9]{9}/)
      .required()
      .messages({
        "string.pattern.base": "Contact number must start with 6-9 and be 10 digits long.",
      }),
  }).required(),
  

  propertyDetails: Joi.object({
    type: Joi.string(),
    apartmentName: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "Capitalization for apartmentName"),
      typeTe:Joi.string().optional(),
    flatNumber: Joi.string().required(),

    apartmentLayout: Joi.string().required(),
    
    flatSize: Joi.number().required(),
    sizeUnit: Joi.string().required(),

    flatCost: Joi.number().required().min(0),
    priceUnit: Joi.string().required(),

    totalCost: Joi.number().required().min(0),

    flatFacing: Joi.string().required(),

    furnitured: Joi.string().required(),

    propDesc: Joi.string().optional(),
    apartmentNameTe: Joi.string().optional(),
    sizeUnitTe: Joi.string().optional(),
    priceUnitTe: Joi.string().optional(),
    flatFacingTe: Joi.string().optional(),
    furnituredTe: Joi.string().optional(),
    propDescTe: Joi.string().optional().optional(),
  }).required(),
 
  address: Joi.object({
    pinCode: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .optional()
      .allow(null)
      .messages({
        "string.pattern.base": "Pin code must be a valid 6-digit number.",
      }),
    countryTe:Joi.string().optional(),
    country: Joi.string().default("India").required(),
    state: Joi.string().default("Andhra Pradesh").required(),
    stateTe:Joi.string().optional(),
    district: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "formatting district"),
    districtTe:Joi.string().optional(),
    mandalTe:Joi.string().optional(),
    mandal: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "formatting mandal"),
      villageTe:Joi.string().optional(),
    village: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "formatting village"),

    latitude: Joi.string().optional(),
    longitude: Joi.string().optional(),
    landMark: Joi.string().optional(),
    landMarkTe:Joi.string().optional(),
    currentLocation: Joi.string().optional(),
  }).required(),

  amenities: Joi.object({
    powerSupply: Joi.string().required(),
    powerSupplyTe:Joi.string().optional(),
    waterFacility: Joi.boolean().required(),
    electricityFacility: Joi.string().optional(),
    electricityFacilityTe:Joi.string().optional(),
    roadType: Joi.string().optional(),
    roadTypeTe:Joi.string().optional(),
    distanceFromRoad: Joi.string().optional(),
    elevator: Joi.boolean().required(),
    watchman: Joi.boolean().required(),
    cctv: Joi.boolean().required(),
    medical: Joi.number().min(0).required(),
    educational: Joi.number().min(0).required(),
    grocery: Joi.number().min(0).required(),
    gymFacility: Joi.boolean().required(),
  }).optional(),

  propPhotos: Joi.array().items(Joi.string()).optional(),
  videos: Joi.array().items(Joi.any()).optional(),

  configurations: Joi.object({
    bathroomCount: Joi.number().min(0).required(),
    balconyCount: Joi.number().min(0).required(),
    floorNumber: Joi.number().min(0).required(),
    propertyAge: Joi.number().min(0).required(),
    maintenanceCost: Joi.number().min(0).required(),
    visitorParking: Joi.boolean().required(),
    waterSource: Joi.array()
      .items(
        Joi.string().custom((value) => {
          return capitalizeWords(value);
        }, "Capitalization for waterSource")
      )
      .required(),
    playZone: Joi.boolean().required(),
    extraAmenities: Joi.array()
      .items(
        Joi.string().custom((value) => {
          return capitalizeWords(value);
        }, "Capitalization for extra amenities")
      )
      .optional(),
  }).required(),
});


module.exports = { residentialSchema };
