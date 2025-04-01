const mongoose = require("mongoose");

const customerAssignmentSchema = new mongoose.Schema(
  {
    assignedBy: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
      required: true,
    },
    assignedDate: {
      type: Date,
      required: true,
    },
    customers: [
      {
        customerId: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          default: "Pending",
        },
        description: {
          type: String,
        },

        property: [
          {
            landTitle: {
              type: String,
            },
            propertyType: {
              type: String,
            },
            propertyId: {
              type: String,
            },
            agentName: {
              type: String,
            },
            agentId: {
              type: String,
            },
          },
        ],
        size: {
          type: String,
        },
        price: {
          type: String,
        },
        location: {
          type: String,
        },
        reschedule: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CustomerAssignment", customerAssignmentSchema);
