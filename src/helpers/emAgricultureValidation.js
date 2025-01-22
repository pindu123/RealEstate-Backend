const Joi = require("joi");

// Function to capitalize the first letter of each word
const capitalizeWords = (value) => {
    if (typeof value === 'string') {
      return value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return value;
  };

const emFieldValidationSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.number().required(),
  estType: Joi.string().default("Agriculture"),
  status: Joi.number().default(0),
  
  landDetails: Joi.object({
    landName: Joi.string().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for title'),
    surveyNo: Joi.string()
      .required(),
    size: Joi.number().min(0).required(),
    sizeUnit : Joi.string().required(),
    price: Joi.number().min(10).required(),
    landType: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for landtype'),
    images: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().allow('').optional()
  }).required(),
  
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
    "string.pattern.base": "Pin code must be a valid 6-digit number."
  }),
    country: Joi.string().default("India").required(),
    state: Joi.string().default("Andhra Pradesh").required(),
    district: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for district'),
    mandal: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for mandal'),
    village: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for village'),
  }).required(),
  
  amenities: Joi.object({
    boreWell: Joi.boolean(),
    electricity: Joi.boolean(),
    distanceFromRoad: Joi.number().min(0).required(),
    storageFacility: Joi.boolean()
  }),

});

module.exports = { emFieldValidationSchema};
