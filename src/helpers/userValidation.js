const Joi = require("joi");

// const registrationSchema = Joi.object({
//   firstName: Joi.string()
//     .required()
//     .regex(/^[A-Za-z]+$/)
//     .custom((value, helper) => {
//       // Convert the first character to uppercase and the rest to lowercase
//       const formattedValue =
//         value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
//       return formattedValue;
//     }, "formatting first name"),

//   lastName: Joi.string()
//     .required()
//     .regex(/^[A-Za-z]+$/)
//     .custom((value, helper) => {
//       // Convert the first character to uppercase and the rest to lowercase
//       const formattedValue =
//         value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
//       return formattedValue;
//     }, "formatting last name"),

//   phoneNumber: Joi.string()
//     .length(10)
//     .pattern(/[6-9]{1}[0-9]{9}/)
//     .required(),
//     budget:Joi.any().optional(),
//     accountId:Joi.string().optional(),
//     addedBy:Joi.string().optional(),
//   email: Joi.string().email().lowercase().optional(),

//   altPhoneNumber:Joi.string().optional(),
//   village: Joi.string().optional(),
//   pinCode: Joi.string()
//     .pattern(/^[0-9]{6}$/) // Must be exactly 6 digits
//     .required(),

//   city: Joi.string().optional()
//     .custom((value, helper) => {
//       // Convert the first character to uppercase and the rest to lowercase
//       const formattedValue =
//         value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
//       return formattedValue;
//     }, "formatting city"),

//   state: Joi.string().required(),
//   // .custom((value, helper) => {
//   //   // Convert the first character to uppercase and the rest to lowercase
//   //   const formattedValue =
//   //     value.charAt(0).toUpperCase()+value.slice(1).toLowerCase();
//   //   return formattedValue;
//   // }, "formatting state"),
//   country: Joi.string()
//     .required()
//     .custom((value, helper) => {
//       // Convert the first character to uppercase and the rest to lowercase
//       const formattedValue =
//         value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
//       return formattedValue;
//     }, "formatting country"),

//   city: Joi.string()
//      .custom((value, helper) => {
//       // Convert the first character to uppercase and the rest to lowercase
//       const formattedValue =
//         value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
//       return formattedValue;
//     }, "formatting city"),

//   // password: Joi.string().required().min(5).max(15)
//   // .pattern(
//   //   new RegExp(
//   //      //"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W)[A-Z][a-zA-Z\\d\\W]{7,}$"
//   //   )
//   // )
//   //   .message(
//   //     "Password must start with a capital letter, contain at least one digit, one lowercase letter, and one special character."
//   //   ),
//   password: Joi.string()
//     .optional()
//     .min(5)
//     .max(15)
//     .pattern(
//       new RegExp(
//         "^(?=[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?])[A-Z][A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]{7,14}$"
//       )
//     )
//     .message(
//       "Password must start with a capital letter, contain at least one digit, one lowercase letter, and one special character."
//     ),

//   district: Joi.string()
//     .required()
//     .custom((value, helper) => {
//       // Convert the first character to uppercase and the rest to lowercase
//       const formattedValue =
//         value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
//       return formattedValue;
//     }, "formatting district"),

//   mandal: Joi.string()
//     .required()
//     .custom((value, helper) => {
//       // Convert the first character to uppercase and the rest to lowercase
//       const formattedValue =
//         value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
//       return formattedValue;
//     }, "formatting mandal"),

//   role: Joi.number().integer().valid(1, 2, 3, 4, 5, 6).required().messages({
//     "any.only": "Role must be one of 1, 2, 3, 5, 4.",
//     "number.base": "Role must be a number.",
//   }),

//   profilePicture: Joi.string(),
//   identityProof: Joi.array().optional(),
//   agentUserId: Joi.string().optional(),
//   occupation:Joi.string().optional(),
//   assignedDistrict: Joi.string().optional(),
//   income:Joi.string().optional(),
//   assignedMandal: Joi.string().optional(),

//   subscription:Joi.object({
//     planType:Joi.string().optional(),
//     planDuration:Joi.string().optional(),
//     planStartDate:Joi.string().optional(),
//     planEndDate:Joi.string().optional(),
//     amount:Joi.string().optional()
// }).optional()

// });

//validation for role
const roleSchema = Joi.object({
  role: Joi.number().integer().valid(0,1, 2, 3, 4, 5,6).required().messages({
    "any.only": "Role must be one of 0,1, 2,3,4,5 or 6.",
    "number.base": "Role must be a number.",
  }),
});

//validation for update profile data
const newProfileSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .regex(/^[A-Za-z]+$/)
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting first name"),

  lastName: Joi.string()
    .required()
    .regex(/^[A-Za-z]+$/)
    .custom((value, helper) => {
      // Convert the first character to uppercase and the rest to lowercase
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting last name"),

  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Z][a-zA-Z\\d@$!%*?&]{7,}$"
      )
    )
    .message(
      "Password must start with a capital letter, contain at least one digit, one lowercase letter, and one special character."
    ),

  phoneNumber: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),

  profilePicture: Joi.string(),
});

const registrationSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .regex(/^[A-Za-z]+$/)
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting first name"),
  firstNameTe: Joi.string().optional(), // Telugu first name
  active:Joi.number().optional(),
  lastName: Joi.string()
    .required()
    .regex(/^[A-Za-z]+$/)
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting last name"),
  lastNameTe: Joi.string().optional(), // Telugu last name

  phoneNumber: Joi.string()
    .length(10)
    .pattern(/^[6-9][0-9]{9}$/)
    .required(),
  altPhoneNumber: Joi.string().length(10).pattern(/^[6-9][0-9]{9}$/).optional(),

  email: Joi.string().email().lowercase().optional(),

  password: Joi.string()
    .optional()
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

  pinCode: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required(),

  city: Joi.string()
    .optional()
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting city"),
  cityTe: Joi.string().optional(), // Telugu city

  state: Joi.string().required(),
  stateTe: Joi.string().optional(), // Telugu state

  country: Joi.string()
    .required()
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting country"),
    countryTe:Joi.string().optional(),
  district: Joi.string()
    .required()
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting district"),
  districtTe: Joi.string().optional(), // Telugu district

  village: Joi.string().optional(),
  villageTe: Joi.string().optional(), // Telugu village

  mandal: Joi.string()
    .required()
    .custom((value, helper) => {
      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      return formattedValue;
    }, "formatting mandal"),
  mandalTe: Joi.string().optional(), // Telugu mandal

  role: Joi.number().integer().valid(1, 2, 3, 4, 5, 6).required().messages({
    "any.only": "Role must be one of 1, 2, 3, 4, 5, 6.",
    "number.base": "Role must be a number.",
  }),

  profilePicture: Joi.string().optional(),
  identityProof: Joi.array().items(Joi.string()).optional(),

  agentUserId: Joi.string().optional(),
  occupation: Joi.string().optional(),
  income: Joi.string().optional(),
  budget: Joi.any().optional(),
  accountId: Joi.string().optional(),
  addedBy: Joi.string().optional(),
  assignedDistrict: Joi.string().optional(),
  assignedMandal: Joi.string().optional(),

  subscription: Joi.object({
    planType: Joi.string().optional(),
    planDuration: Joi.string().optional(),
    planStartDate: Joi.string().isoDate().optional(),
    planEndDate: Joi.string().isoDate().optional(),
    amount: Joi.string().optional(),
  }).optional(),
});


module.exports = {
  registrationSchema,
  roleSchema,
  newProfileSchema,
};
