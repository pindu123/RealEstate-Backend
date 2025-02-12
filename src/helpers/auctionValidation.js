const joi = require('joi')

const auctionValidation = joi.object({
     propertyId: joi.string().required(),
     startDate: joi.string(),
     endDate: joi.string(),
     AgentId: joi.string().required(),
     amount: joi.string().required(),

     buyers: joi.array().items(joi.object({

     })),
     auctionStatus: joi.string(),

     startTime: joi.string(),
     endTime: joi.string(),
     auctionType: joi.string(),
})