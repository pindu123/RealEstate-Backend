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




const validateType = Joi.object({
    propertyType: Joi.string().required()
})

const validateId = Joi.object({
    propertyId: Joi.string().required()
})

const validateIdAndType= Joi.object({
    propertyId: Joi.string().required(),
    propertyType: Joi.string().required()
})

const validateIdTypeStatus = Joi.object({
    propertyId: Joi.string().required(),
    propertyType: Joi.string().required(),
    status: Joi.number().valid(0,1).required()
})

const validateIdUserIdType= Joi.object({
    propertyType: Joi.string().required().custom((value, helper) => {
        // Convert the first character to uppercase and the rest to lowercase
        const formattedValue =
          value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        return formattedValue;
      }, "formatting propertyType"),
    userId: Joi.string().required(),
    propertyId: Joi.string().required()
})


const validateLocation = Joi.object({
   type: Joi.string().required().custom((value, helper) => {
    // Convert the first character to uppercase and the rest to lowercase
    const formattedValue =
      value.toLowerCase();
    return formattedValue;
  }, "formatting propertyType"), 
  location: Joi.string().required().custom((value) => {
    return capitalizeWords(value);
  }, 'Capitalization for location')
})


const validateSlider = Joi.object({
  type: Joi.string()
  .valid('agricultural', 'residential', 'layout', 'commercial')
  .required(),
sell: Joi.string().valid('sell', '@').required(),
rent: Joi.string().valid('rent', '@').required(),
lease: Joi.string().valid('lease', '@').required(),
flat: Joi.string().valid('flat', '@').required(),
house: Joi.string().valid('house', '@').required(),
sold: Joi.string().valid('sold', '@').required(),
unsold: Joi.string().valid('unsold', '@').required(),
})
module.exports= {validateType,validateIdAndType, validateIdTypeStatus, validateIdUserIdType, validateId, validateLocation,validateSlider}