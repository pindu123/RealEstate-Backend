const express = require("express");

const {updateViewCount, totalViews, viewsFromABuyer, getTopView, getTopProperties} = require('../controllers/viewsController');

const viewsRoutes = express.Router();
const apicache = require('apicache');
const cache = apicache.middleware;

viewsRoutes.get('/viewsFromABuyer/:propertyId',viewsFromABuyer);
viewsRoutes.get('/totalViews/:propertyId',totalViews);
viewsRoutes.put('/updateViewCount',updateViewCount);
viewsRoutes.get("/getTopView", getTopView);

viewsRoutes.get("/getTopProperties", getTopProperties);
module.exports = viewsRoutes;
