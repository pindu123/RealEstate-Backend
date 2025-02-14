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
  getIntresetedCustomers,
  getDistinctProperties,
  getPropertyDeals,
  getDealsRelatedAgents,
  getIntrestedProperties,
  dealSearchOnCustomer,
  dealsSearchOnProps,
  searchPropertyDeals,
  getCustomerDealsFilters,
  getCustomerDealsFiltered,
  startDeal,
  customerDealsBasedOnAgents,
  propertyOnHold,
  getPropertyOnHold,
  unReserveProperty,
  getAgentDealings2,
  getDeals1,
  customerInterest,
} = require("../controllers/dealsController");
const {
  ModuleDataManagementInstance,
} = require("twilio/lib/rest/marketplace/v1/moduleDataManagement");
const { createDeal } = require("../controllers/dealsController");

const dealsRoutes = express.Router();

dealsRoutes.get("/getAllProperties", getAllProperties);

dealsRoutes.post("/createDeal", createDeal);
dealsRoutes.get("/agentBasedCustomerDeals", customerDealsBasedOnAgents);
dealsRoutes.get("/checkUser/:phoneNumber", getExisitingCustomer);

dealsRoutes.get("/getDeals", getDeals);
dealsRoutes.get("/getCustomerDeals/:customerId", getCustomerDeals);
dealsRoutes.get("/customerDealsFilter/:customerId", getCustomerDealsFiltered);
dealsRoutes.put("/startDeal", startDeal);
dealsRoutes.get("/getAgentDealings", getAgentDealings);

dealsRoutes.put("/changeInterest", changeInterest);

dealsRoutes.put("/closeDeal", closeDeal)

dealsRoutes.get("/getClosedDeals", getClosedDeals)

dealsRoutes.post("/holdProperty", propertyOnHold);
dealsRoutes.get("/reservedProperty", getPropertyOnHold);
dealsRoutes.get("/getIntresetedCustomers", getIntresetedCustomers)

dealsRoutes.get("/getDistinctProperties", getDistinctProperties)

dealsRoutes.get('/getPropertyDeals/:propertyId', getPropertyDeals)

dealsRoutes.get("/getDealsRelatedAgents", getDealsRelatedAgents)

dealsRoutes.get("/getIntrestedProperties", getIntrestedProperties)

dealsRoutes.get("/dealSearchonCustomer/:text", dealSearchOnCustomer);

dealsRoutes.get("/dealsSearchOnProps/:text", dealsSearchOnProps);
dealsRoutes.get("/customerFilter/:text/:customerId", getCustomerDealsFilters);
dealsRoutes.get("/searchPropertyDeals/:text/:propertyId", searchPropertyDeals);


dealsRoutes.put("/unReserveProperty", unReserveProperty)
dealsRoutes.get("/getAgentDealings2/:agentRole",  getAgentDealings2)


dealsRoutes.get("/getDeals1",getDeals1)


dealsRoutes.get("/customerInterest/:propertyId",customerInterest)

module.exports = dealsRoutes;
