const express = require("express");

const {updateViewCount, totalViews, totalViews1,viewsFromABuyer, getTopView, getTopProperties} = require('../controllers/viewsController');

const viewsRoutes = express.Router();
const apicache = require('apicache');
const cache = apicache.middleware;

viewsRoutes.get('/viewsFromABuyer/:propertyId',viewsFromABuyer);
viewsRoutes.get('/totalViews/:propertyId',totalViews);
viewsRoutes.put('/updateViewCount',updateViewCount);
viewsRoutes.get("/getTopView", getTopView);
viewsRoutes.get("/totalViews1/:propertyId/:propertyType", totalViews1);
viewsRoutes.get("/getTopProperties", getTopProperties);
module.exports = viewsRoutes;
