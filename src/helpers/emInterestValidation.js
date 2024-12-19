const Joi=require('joi');



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

const interestSchema=Joi.object({

    userId: Joi.string().required(),

    estId: Joi.string().required().messages({
        'any.required': 'Property ID is required.',
        'string.empty': 'Property ID should not be empty.',
      }),
      status: Joi.number().valid(0, 1).default(1).messages({
        'any.only': 'Status must be either 0 (removed) or 1 (active).',
        'number.base': 'Status must be a valid number.',
      }),

})


const removeInterestValidationSchema = Joi.object({
    estId: Joi.string().required().messages({
      "any.required": "Estate ID is required."
    }),
  });

module.exports={interestSchema, removeInterestValidationSchema}