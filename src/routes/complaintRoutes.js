const express = require("express");

const complaintRoute = express.Router();

const {
  postComplaint,
  getCompliants,
  getUserCompliants,
} = require("../controllers/complaintController");

complaintRoute.post("/postComplaint", postComplaint);

complaintRoute.get("/getCompliants/:role", getCompliants);

complaintRoute.get("/getUserCompliants/:userId", getUserCompliants);

module.exports = complaintRoute;
