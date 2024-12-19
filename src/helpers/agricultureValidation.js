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

const fieldValidationSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.number().required(),
  propertyType: Joi.string().default("Agricultural land"),
  rating: Joi.number().default(0),
  ratingCount: Joi.number().default(0),
  status: Joi.number().default(0),
  csrId: Joi.string().optional(),
  enteredBy: Joi.string().optional(),
  ownerDetails: Joi.object({
    ownerName: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "Capitalization for OwnerName"),
    phoneNumber: Joi.string()
      .length(10)
      .pattern(/[6-9]{1}[0-9]{9}/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be a valid 10-digit number.",
      }),
  }).required(),

  landDetails: Joi.object({
    title: Joi.string().custom((value) => {
      return capitalizeWords(value);
    }, "Capitalization for title"),
    surveyNumber: Joi.string().required(),
    size: Joi.number().min(0).required(),
    sizeUnit: Joi.string().required(),
    price: Joi.number().min(0).required(),
    priceUnit: Joi.string().required(),
    totalPrice: Joi.number().min(0).required(),
    landType: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "Capitalization for landtype"),

    crops: Joi.array()
      .items(
        Joi.string().custom((value) => {
          return capitalizeWords(value);
        }, "Capitalization for crops")
      )
      .required(),
    litigation: Joi.boolean().required(),
    litigationDesc: Joi.string().when("litigation", {
      is: true, // When litigation is true
      then: Joi.string().required(), // litigationDesc is required
      otherwise: Joi.string().optional(), // If litigation is false, litigationDesc is optional
    }),
    images: Joi.array().items(Joi.string()).optional(),
    videos:Joi.array().optional(),
    propertyDesc: Joi.string().allow("").optional(),
  }).required(),

  agentDetails:Joi.object( { userId: Joi.string().optional() }).optional(),

  address: Joi.object({
    // pinCode: Joi.string()
    //   .pattern(/^[0-9]{6}$/)
    //   .messages({
    //     "string.pattern.base": "Pin code must be a valid 6-digit number.",
    //   }),
    //   pinCode: Joi.string()
    // .pattern(/^[0-9]{6}$/)
    // .optional() // This makes the pinCode field optional
    // .messages({
    //   "string.pattern.base": "Pin code must be a valid 6-digit number."
    // })
    pinCode: Joi.string()
      .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
      .optional() // Makes the field optional
      .allow(null) // Allows null as a valid value
      .messages({
        "string.pattern.base": "Pin code must be a valid 6-digit number.",
      }),
    country: Joi.string().default("India").required(),
    state: Joi.string().default("Andhra Pradesh").required(),
    district: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "Capitalization for district"),
    mandal: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "Capitalization for mandal"),
    village: Joi.string()
      .required()
      .custom((value) => {
        return capitalizeWords(value);
      }, "Capitalization for village"),

    latitude: Joi.string().optional(),
    longitude: Joi.string().optional(),
    landMark: Joi.string().optional(),
  }),

  amenities: Joi.object({
    boreWell: Joi.boolean(),
    electricity: Joi.string(),
    roadType:Joi.string().required(),
    distanceFromRoad: Joi.number().min(0),
    storageFacility: Joi.boolean(),
    extraAmenities: Joi.array()
      .items(
        Joi.string().custom((value) => {
          return capitalizeWords(value);
        }, "Capitalization for extra amenities")
      )
      .optional(),
  }).optional(),
});

module.exports = { fieldValidationSchema };
