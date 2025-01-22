const joi=require('joi')

const chatSchema=joi.object({
    senderId: joi.string().required(),
    receiverId:joi.string().required(),
    message:joi.string().required(),
    senderRole:joi.number()
})


module.exports={
    chatSchema
}