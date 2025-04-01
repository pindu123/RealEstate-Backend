const mongoose = require("mongoose");

const dealCloseSchema = new mongoose.Schema(
  {
    dealId: {
      type: String,
      required: true,
    },
    propertyId: {
      type: String,
      required: true,
    },
    propertyName: {
      type: String,
    },
    customerId: {
      type: String,
    },
    customerName: {
      type: String,
    },
    amount: {
      type: String,
    },
    agentId: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);

const dealCloseModel = mongoose.model("dealClosing", dealCloseSchema);

module.exports = dealCloseModel;
