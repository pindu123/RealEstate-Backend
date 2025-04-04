const mongoose = require("mongoose");

const emBookingSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      ref: "users",
      required: true,
    },
    role: {
      type: Number,
      required: true,
    },
    agentId: {
      type: String,
      required: true,
    },
    estId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timing: {
      type: String, // Use Date for both date and time
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: true }
);

const emBookingModel = mongoose.model("estateBookings", emBookingSchema);

module.exports = emBookingModel;
