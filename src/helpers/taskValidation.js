const Joi = require("joi");

const taskValidation=Joi.object({
    platformTitle:Joi.string().required(),
    target:Joi.string().required(),
    pampletDist:Joi.string().required()
})

module.exports=taskValidation