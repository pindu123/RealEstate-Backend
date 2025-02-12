const express = require("express");
const customerRoutes = express.Router();

const {
  createCustomer,
  getCustomer,
  sendPropertyDetailsToCustomer,
  sendPropertyToCustomer,
  customerBasedOnAddedBy,
  getCustomers,
} = require("../controllers/customerController");
customerRoutes.post("/insertSurvey", createCustomer);
customerRoutes.get("/getSurveyData", getCustomer);
customerRoutes.get("/getCustomer",getCustomers);
customerRoutes.post("/shareProperty", sendPropertyToCustomer);
customerRoutes.get("/myCustomer",customerBasedOnAddedBy)
customerRoutes.post("/sendPropertyToCustomer", sendPropertyDetailsToCustomer);

module.exports = customerRoutes;
