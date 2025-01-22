const Joi = require("joi");

const dealsSchema = Joi.object({
  propertyId: Joi.string().required(),
  propertyName: Joi.string().required(),
  propertyType: Joi.string().required(),
  propertyNameTe: Joi.string().optional(),
  propertyTypeTe: Joi.string().optional(),
  customerId: Joi.string().optional(),
  propertyNameTe:Joi.string().optional(),
  interestIn: Joi.string().optional(),
  comments: Joi.string().optional(),
  commentsTe: Joi.string().optional(),
  csrId: Joi.string().optional(),
  agentId: Joi.string().optional(),
  expectedPrice:Joi.string().optional(),
  addedBy:Joi.string().optional(),
  addedByRole:Joi.number().optional(),
});

module.exports = dealsSchema;
