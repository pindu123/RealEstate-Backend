const express = require("express");
const {
  getAllProperties,
  getExisitingCustomer,
  getDeals,
  getAgentDealings,
  changeInterest,
  closeDeal,
  getClosedDeals,
  getCustomerDeals,
} = require("../controllers/dealsController");
const {
  ModuleDataManagementInstance,
} = require("twilio/lib/rest/marketplace/v1/moduleDataManagement");
const { createDeal } = require("../controllers/dealsController");

const dealsRoutes = express.Router();

dealsRoutes.get("/getAllProperties", getAllProperties);

dealsRoutes.post("/createDeal", createDeal);

dealsRoutes.get("/checkUser/:phoneNumber", getExisitingCustomer);

dealsRoutes.get("/getDeals", getDeals);
dealsRoutes.get("/getCustomerDeals/:customerId", getCustomerDeals);


dealsRoutes.get("/getAgentDealings", getAgentDealings);

dealsRoutes.put("/changeInterest", changeInterest);

dealsRoutes.put("/closeDeal",closeDeal)

dealsRoutes.get("/getClosedDeals",getClosedDeals)

module.exports = dealsRoutes;
