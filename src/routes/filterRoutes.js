const express = require("express");
const {
  residentialSearch,
  payment,
  layoutSearch,
  commercialSearch,
  agriSearch,
} = require("../controllers/filterController");
const filterRoutes = express.Router();

filterRoutes.get("/residentialSearch", residentialSearch);

filterRoutes.get("/layoutSearch", layoutSearch);

filterRoutes.post("/payment", payment);

filterRoutes.get("/commercialSearch", commercialSearch);

filterRoutes.get("/agriSearch", agriSearch);

module.exports = filterRoutes;
