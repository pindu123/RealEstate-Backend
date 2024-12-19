const express = require("express");
const {
  createBooking,getClientRequests,getAllRequests,
  updateBookingStatus
} = require("../controllers/emBookingController"); // Import as an object

const emBookingRoutes = express.Router();

emBookingRoutes.get("/getAllClientRequests",getClientRequests);
emBookingRoutes.get('/getAllRequests',getAllRequests); // for agent side
emBookingRoutes.put(
    "/updatebookingstatus/:bookingId/:status",
    updateBookingStatus
  );
emBookingRoutes.post("/clientBook", createBooking); //route for a buyer/seller to book appointment with agent

module.exports = emBookingRoutes; // Export the correct variable
