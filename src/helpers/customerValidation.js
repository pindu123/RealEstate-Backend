const Joi = require("joi");

const customerSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .regex(/^[A-Za-z]+$/)
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting first name"),

  lastName: Joi.string()
    .required()
    .regex(/^[A-Za-z]+$/)
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting last name"),

  phoneNumber: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),

  email: Joi.string().email().lowercase().optional(),

  state: Joi.string().optional(),

  country: Joi.string()
    .optional()
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting country"),

  district: Joi.string()
    .optional()
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting district"),

  mandal: Joi.string()
    .optional()
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting mandal"),
  village: Joi.string()
    .optional()
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting village"),
  pincode: Joi.string().optional(),
  occupation: Joi.string().optional(),
  budget: Joi.string().optional(),
  interestedIn: Joi.string().optional(),
  // expectedsize: Joi.string().optional(),
  // affordableBudget: Joi.string().optional(),
  addedBy: Joi.string().optional(),
  addedByRole: Joi.number().optional(),
  whatsAppNumber: Joi.any().optional(),
  customerRole: Joi.string().optional(),
  description: Joi.string().optional(),
  pinCode: Joi.any().optional(),
  city: Joi.any().optional(),
});

module.exports = { customerSchema };
