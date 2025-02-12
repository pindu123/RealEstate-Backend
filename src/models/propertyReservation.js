const mongoose = require("mongoose");

const propertyReservationSchema = new mongoose.Schema(
  {
    propId: {
      type: String,
      required: true, 
    },
    propertyType: {
      type: String,
      required: true, 
    },
    startDate: {
      type: Date,
      required: true, 
    },
    transactionId: {
      type: String,
      required: true, 
    },
    reservationAmount: {
      type: Number,
      required: true, 
    },
    agentId:{
        type:String,
        
    },
    userId: {
      type: String,
      required: true, 
    },
    role: {
      type: Number,
      required: true, 
    },
    addedBy: {
      type: String,
      required: true, 
    },
    reservationStatus:{
    type:Boolean,
    required:false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PropertyReservation", propertyReservationSchema);

