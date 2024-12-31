const express = require("express");
const {
addMarketingAgent,
getMarketingAgents,
getCustomersByAssignedTo,
myAreaProperties,
getAssignedCustomers,
getAssignedPropertyDetails
} = require("../controllers/marketingAgentController");

const marketingAgent = express.Router();

marketingAgent.post("/addMAgent", addMarketingAgent);
marketingAgent.get("/getMAgent", getMarketingAgents);
marketingAgent.get("/getCustomer/:assignedTo", getCustomersByAssignedTo);
marketingAgent.get("/myAreaProperties/:agentId", myAreaProperties);
marketingAgent.get("/assignedProperty/:userId/:role",getAssignedPropertyDetails)
marketingAgent.get("/getAssignedCustomers/:userId/:role",getAssignedCustomers)






module.exports = marketingAgent;