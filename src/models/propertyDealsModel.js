const { string } = require("joi");
const mongoose = require("mongoose");

const dealsSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: true,
    },
    propertyName: {
      type: String,
    },
    propertyNameTe: {
      type: String,
    },
    propertyType: {
      type: String,
    },
    propertyTypeTe: {
      type: String,
    },
    propertyId: { type: String },
    customerId: { type: String },
    comments: { type: String },
    commentsTe: { type: String },
    interestIn: { type: String },
    csrId: {
      type: String,
    },
    agentId: { type: String },
    dealStatus:{
      type:String,
      default:"open"
    },
    amount:{
      type:String
    },
    sellingStatus:{
      type:String,
      default:"unSold"
    },
    expectedPrice:{
      type:String,
    },
    addedBy:{
      type:String,
    },
    addedByRole:{
      type:Number,
    }
  },
  { timestamps: true }
);

const dealsModel = mongoose.model("deals", dealsSchema);

module.exports = dealsModel;
