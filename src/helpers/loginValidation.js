const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .required()
    .min(5)
    .max(15)
    .pattern(
      new RegExp(
        "^(?=[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?])[A-Z][A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]{7,14}$"
      )
    )
    .message(
      "Password must start with a capital letter, contain at least one digit, one lowercase letter, and one special character."
    ),
});

const validateNumber = Joi.object({
  phoneNumber: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),
});

const otpValidation = Joi.object({
  phoneNumber: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),

  otp: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required(),
});

module.exports = {
  loginSchema,
  validateNumber,
  otpValidation,
};
