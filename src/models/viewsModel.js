const mongoose = require("mongoose");

const viewsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "users",
      required: true,
    },
    role: {
      type: Number,
      required: true,
    },
    propertyId:{
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
  viewsCount:{
    type:Number,
    required: true
  }
  },
  { timestamps: true }
);

const viewsModel = mongoose.model("views", viewsSchema);

module.exports = viewsModel;
