const express = require("express");
const customerRoutes = express.Router();

const {
  createCustomer,
  getCustomer,
  sendPropertyDetailsToCustomer,
  sendPropertyToCustomer,
  customerBasedOnAddedBy,
} = require("../controllers/customerController");
customerRoutes.post("/addCustomers", createCustomer);
customerRoutes.get("/getCustomer", getCustomer);
customerRoutes.post("/shareProperty", sendPropertyToCustomer);
customerRoutes.get("/myCustomer",customerBasedOnAddedBy)
customerRoutes.post("/sendPropertyToCustomer", sendPropertyDetailsToCustomer);

module.exports = customerRoutes;
