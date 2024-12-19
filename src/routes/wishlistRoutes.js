const express = require("express");
// const { getBuyers, createBuyer } = require('../controllers/buyersController');
const {
  addToWishlist,
  getWishlist,
  deleteFromWishlist,
  getRecentWishlist,
} = require("../controllers/wishListController");

const wishlistRoutes = express.Router();

wishlistRoutes.get("/getwishList", getWishlist);
wishlistRoutes.post("/addtowishList", addToWishlist);
wishlistRoutes.delete("/delete/:propertyId", deleteFromWishlist);
wishlistRoutes.get("/getRecentWishlist/:buyerId",getRecentWishlist)

module.exports = wishlistRoutes;
