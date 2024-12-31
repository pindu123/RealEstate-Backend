
const { required } = require("joi");
const mongoose = require("mongoose");

const customerAssignmentSchema = new mongoose.Schema(
  {
    customerIds: [
      {
        type: String,
        required: true,
      },
    ],
    assignedBy: {
        // no ids will be in array of strings only
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
      required: true,
    },
    assignedDate:{
        type:Date,
        required:true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CustomerAssignment", customerAssignmentSchema);
