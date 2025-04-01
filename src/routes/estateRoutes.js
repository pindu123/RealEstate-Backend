const express = require("express");

const {
  addEstate,
  getClientEstates,
  getAllEstates,
  assignAgent,
} = require("../controllers/estateController");

const estateRoutes = express.Router();
const apicache = require("apicache");
const cache = apicache.middleware;

estateRoutes.get("/getClientEstates", getClientEstates);
estateRoutes.get("/getAllEstates", getAllEstates);
estateRoutes.post("/insert", addEstate);
estateRoutes.put("/assignAgent/:agentId/:estId", assignAgent);

module.exports = estateRoutes;
