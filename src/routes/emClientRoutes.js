const express = require("express");
const {
  getInterestedAgents,
  getAllAgents,
  getAllEmClients,
  removeEmClients,
} = require("../controllers/emClientController");

const emClientRoutes = express.Router();
const apicache = require("apicache");

const cache = apicache.middleware;

emClientRoutes.get("/getInterestedAgents", getInterestedAgents);
emClientRoutes.get("/getAllAgents/:estId", getAllAgents);

emClientRoutes.get("/getAllEmClients", getAllEmClients);

emClientRoutes.delete("/removeEmClients/:clientId", removeEmClients);
module.exports = emClientRoutes;
