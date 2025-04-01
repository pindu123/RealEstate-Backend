const express = require("express");
const {
  getAllBuyers,
  removeBuyers,
} = require("../controllers/buyerController");
const buyerRoutes = express.Router();

buyerRoutes.get("/getAllBuyers", getAllBuyers);
buyerRoutes.delete("/removeBuyers/:buyerId", removeBuyers);
module.exports = buyerRoutes;
