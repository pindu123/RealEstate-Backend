const Joi = require('joi');

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

const estateValidationSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.number(),
  serviceReq: Joi.array().items(Joi.string()).required(),
  ownerDetails: Joi.object({
    name: Joi.string().required().custom((value) => {
    return capitalizeWords(value);
  }, 'Capitalization for OwnerName'),
    email: Joi.string().email().optional().lowercase(),
    phoneNumber: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),

  }).required(),
  address: Joi.object({
    pinCode: Joi.string()
    .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
    .optional() // Makes the field optional
    .allow(null) // Allows null as a valid value
    .messages({
      "string.pattern.base": "Pin code must be a valid 6-digit number."
    }),
    state: Joi.string().required(),
    country: Joi.string().required(),
    village: Joi.string().required(),
    district: Joi.string().required(),
    mandal: Joi.string().required(),
  }).required(),
  landDetails: Joi.object({
    landTitle: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for title'),
    landType: Joi.string().required().custom((value) => {
        return capitalizeWords(value);
      }, 'Capitalization for type'),
    loanAvailed: Joi.boolean().required(),
    loanDesc: Joi.string().allow('').optional(),
    surveyNo: Joi.string().required(),
    size: Joi.number().required(),
    sizeUnit: Joi.string().required(),
    marketValue: Joi.number().required(),
    uploadPics: Joi.array().items(Joi.string()),
    uploadDocs: Joi.string(),
    }).required(),
   
    amenities: Joi.object({
        groundWaterLevel: Joi.string().required(),
        waterFacility: Joi.boolean().required(),
        electricity: Joi.boolean().required(),
        watchMan: Joi.boolean().required(),
        ccTv: Joi.boolean().required(),
        parking: Joi.boolean().required(),
        lift: Joi.boolean().required(),
        powerBackup: Joi.boolean().required(),
        swimmingPool: Joi.boolean().required(),
        rainWaterStorage: Joi.boolean().required()
    }).required(),
    buildingDetails: Joi.object({
      facing: Joi.string().optional().custom((value)=>{return capitalizeWords(value);},'capitalization for facing'),
      propertyAge: Joi.number().optional(),
      buildingType: Joi.string().optional().custom((value)=>{return capitalizeWords(value);},'capitalization for facing'),
    }).optional(),
    residence: Joi.object({
      doorNo: Joi.string().optional(),
      floorCount: Joi.number().integer().optional(),
      bedRoomType: Joi.number().integer().optional(),
      furnished:Joi.string().required().custom((value)=>{return capitalizeWords(value);},'capitalization for facing'),
      beds: Joi.number().integer().optional(),
      washrooms: Joi.number().integer().optional(),
    }).optional(),
    apartment: Joi.object({
      floorCount: Joi.number().integer().optional(),
      houseCount: Joi.number().integer().optional(),
    }).optional(),

});

module.exports = {estateValidationSchema};
