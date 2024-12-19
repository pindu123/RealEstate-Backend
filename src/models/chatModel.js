 const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
       required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    message:{
        type:String,
        required:true
    },
    senderRole:{
        type:Number,
        required:true
    },
    status:{
        type:Boolean,
        default:false
    }
},
  { timestamps: true }
);

const chatModel = mongoose.model("chat", chatSchema );

module.exports = chatModel;
