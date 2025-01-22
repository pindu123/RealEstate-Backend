const { required } = require("joi");
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
    },
    message: {
      type: String,
      required: true,
    },

    status: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
    },
    attachment: {
      type: String,
    },
  },
  { timestamps: true }
);

const complaintModel = mongoose.model("complaint", complaintSchema);

module.exports = complaintModel;
