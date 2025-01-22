const express = require("express");
// const { getBuyers, createBuyer } = require('../controllers/buyersController');
const {
    addToInterests,
    removeFromInterests
} = require("../controllers/emInterestController");

const emInterestRoutes = express.Router();

// emInterestRoutes.get("/getwishList", getWishlist);
emInterestRoutes.post("/addToInterests", addToInterests);
emInterestRoutes.delete('/delete/:estId',removeFromInterests);
// emInterestRoutes.delete("/delete/:propertyId", deleteFromWishlist);

module.exports = emInterestRoutes;
