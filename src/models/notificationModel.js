const mongoose = require("mongoose");

const notifySchema = new mongoose.Schema(
  {
    receiverId: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    status: {
      type: String,
      default: "unSeen",
    },
    notifyType: {
      type: String,
    },
  },
  { timestamps: true }
);

const notifyModel = new mongoose.model("notifications", notifySchema);

module.exports = notifyModel;
