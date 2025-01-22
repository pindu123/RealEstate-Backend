const joi = require("joi");

const complaintSchema = joi.object({
  userId: joi.string().required(),
  role: joi.number().optional(),

  message: joi.string().required(),
  category: joi.string().optional(),
  attachment:joi.string().optional()
});

module.exports = {
  complaintSchema,
};
