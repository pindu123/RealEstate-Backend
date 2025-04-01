const express = require("express");

const { getAgentEstates } = require("../controllers/emAgentController");

const emAgentRoutes = express.Router();

emAgentRoutes.get("/getAgentEstates", getAgentEstates);

module.exports = emAgentRoutes;
