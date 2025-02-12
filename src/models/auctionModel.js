const { string } = require("joi");
const mongoose = require("mongoose");


const auctionSchema = new mongoose.Schema({

   propertyId: {
      type: String,
      required: true
   },
   startDate: {
      type: Date,
    },
   endDate: {
      type: Date,
    },


   startTime:{
      type:String,
      
   },
   endTime:{
   type:String
   },
   auctionType:{
     type:String
   },
   AgentId: {
      type: String,

   },
   amount: {
      type: String
   },

   buyers: [{
      bidAmount:{
type:String
      },
buyerName:{
   type:String
},
 buyerId:{
   type:String
 },
 bidTime: {
   type: Date,
   default: Date.now
},
transactionId: {
   type:String
},
reservationAmount:{
   type:String
}
 
   },
      
   ],
   auctionStatus: {
      type: String
   }

}, {
   timestamps: true
})


const auctionModel = mongoose.model("auction", auctionSchema);

module.exports = auctionModel;
