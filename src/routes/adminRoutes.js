const express = require("express");

const {
  countOfPropsInMandal,
  countOfPropsInDistrict,
  countOfPropsInVillage,
  getAllAgents,
  removeAgent,
  getFeildStats,
  getCommercialStats,
  getResidentialStats,
  getLayoutStats,
  removeProperties,
  getTotalSales,
  getStateWiseStats,
  getTopPropOnPrice,
  unAssignAgent,
  deleteDeal,
  getPropsOnFilter,
  getPropertiesFilter,
  getMaxPriceAndSize,
 } = require("../controllers/adminController");

const adminRoutes = express.Router();

adminRoutes.get("/getAllAgents", getAllAgents);
adminRoutes.get("/countOfPropsInMandal/:type/:mandal", countOfPropsInMandal);
adminRoutes.get(
  "/countOfPropsInDistrict/:type/:district",
  countOfPropsInDistrict
);
adminRoutes.get("/countOfPropsInVillage/:type/:village", countOfPropsInVillage);
adminRoutes.delete("/removeAgent/:agentId", removeAgent);
adminRoutes.get("/getFeildStats", getFeildStats);
adminRoutes.get("/getCommercialStats", getCommercialStats);
adminRoutes.get("/getResidentialStats", getResidentialStats);
adminRoutes.get("/getLayoutStats", getLayoutStats);
adminRoutes.delete("/removeProperties/:propertyId/:type", removeProperties);
adminRoutes.get("/getTotalSales", getTotalSales);
adminRoutes.get("/getStateWiseStats", getStateWiseStats);
adminRoutes.get("/getTopPropOnPrice",getTopPropOnPrice)
adminRoutes.put("/deleteDeal",deleteDeal)


adminRoutes.get("/getPropsOnFilter", getPropsOnFilter)

adminRoutes.get("/getMaxPriceAndSize",getMaxPriceAndSize)

adminRoutes.get("/getPropertiesFilter/:text",getPropertiesFilter )
adminRoutes.put("/unAssignAgent",unAssignAgent)
module.exports = adminRoutes;
