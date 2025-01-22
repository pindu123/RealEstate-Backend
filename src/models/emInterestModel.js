

const mongoose = require("mongoose");

const emInterestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },
    estId: {
      type: String,
    }
  },
  { timestamps: true }
);

const emInterestModel = mongoose.model("emInterests", emInterestSchema);

module.exports = emInterestModel;
