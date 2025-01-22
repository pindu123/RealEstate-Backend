const { string } = require("joi");
const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    meetingTitle: {
      type: String,
     },
    meetingType: {
      type: String,
     },
    propertyName: {
      type: String,
      required: true,
    },
    customerMail: {
        type: String,
        // required: true,
      },
    meetingInfo: {
      type: String,
    },
    meetingStartTime:{
        type:Date,
    },
    meetingEndTime:{
        type:Date,
    },
    scheduledBy:{
        type:String,
    },
    agentId:{
        type:String,
    },
    customerId:{
      type:String
    },
    location:{
      type:String
    },
    csrId:{
      type:String,
    },
    propertyId:{
      type:String
    }
  },
  { timestamps: true }
);

const meetingsModel = mongoose.model("Meeting", meetingSchema);

module.exports = meetingsModel;