const express = require("express");
const {
  getAllSellerProperties,
  getAllSellers,
  removerSeller,
  getSellerStats,
} = require("../controllers/sellerController");
const sellerRoute = express.Router();

sellerRoute.get("/getAllSellerProperties/:type", getAllSellerProperties);

sellerRoute.get("/getAllSellers", getAllSellers);

sellerRoute.delete("/removerSeller/:sellerId", removerSeller);

sellerRoute.get("/getSellerStats", getSellerStats);
module.exports = sellerRoute;
