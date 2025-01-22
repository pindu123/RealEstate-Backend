const express = require("express");
const {
  insertAgentRatings,
  getAgentRatingsByAgentId,
  getAgentRatings,
  getAgentsbyloc,
  getAgentsbyMandal,
  getAgentsbyDistrict,
  getAgentSales,
  getAgentByDistrict,
  getCsrByDistrict,
  getAllCsr,
  getAllAgents,
  getCSRAssignedToAgent,
  getAllMarketingAgents,
} = require("../controllers/agentController");

const agentRoutes = express.Router();
//
agentRoutes.post("/rating", insertAgentRatings);
agentRoutes.get("/getAgentRatingById", getAgentRatingsByAgentId);
agentRoutes.get("/getratings", getAgentRatings);
//agentRoutes.get('/getAgents/:role',getAgents);
agentRoutes.get("/getAgentsbyloc/:location/:userId", getAgentsbyloc);
agentRoutes.get("/getAgentsbyMandal/:location/:userId", getAgentsbyMandal);

agentRoutes.get("/getAgentsbyDistrict/:location/:userId", getAgentsbyDistrict);

agentRoutes.get("/getAgentSales", getAgentSales);
agentRoutes.get("/getAgentByDistrict/:district", getAgentByDistrict);

agentRoutes.get("/getCsrByDistrict/:district", getCsrByDistrict);

agentRoutes.get("/getAllCsr", getAllCsr);

agentRoutes.get("/getAllAgents", getAllAgents);
agentRoutes.get("/getAssignedCSR", getCSRAssignedToAgent);

agentRoutes.get("/getAllMarketingAgents", getAllMarketingAgents);
module.exports = agentRoutes;
