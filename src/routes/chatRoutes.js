const express=require('express')
const { sendMessage, readMessage } = require('../controllers/chatController')

const chatRoutes=express.Router()

chatRoutes.post("/sendMessage",sendMessage)
chatRoutes.get("/getMessages/:senderId/:receiverId",readMessage)


module.exports=chatRoutes