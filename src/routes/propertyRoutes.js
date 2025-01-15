const express = require("express");
const {
  getPropertiesByLocation,
  getPropertiesByUserId,
  updatePropertyStatus,
  getAllProperties,
  getLatestProps,
  insertPropertyRatings,
  getPropertiesByType,
  getPropertyRatings,
  getPropertiesById,
  getProperty,
  maxPrice,
  getPropsByLocation,
  maximumSize,
  maximumSizeForAllProps,
  maxPriceForAllProps,
  getCountOfRatings,
  getMyPropsByLocation,
  propertyFilters,
  getABC,
  propertyBasedOnLocation,
  updatePropertyDetails,
  plansBasedProperties,
  recentlyAddedProperties
} = require("../controllers/propertyController");

const propertyRoutes = express.Router();

const apicache = require('apicache');
let cache = apicache.middleware;

// propertyRoutes.get('/latestprops',getLatestProps);
propertyRoutes.get("/recentlyAddedProperties",recentlyAddedProperties);
propertyRoutes.put("/markassold/", updatePropertyStatus);
propertyRoutes.get("/getpropbyid/:agentId", getPropertiesByUserId);
propertyRoutes.get("/getproprating/:propertyId",cache('5 seconds'), getPropertyRatings);
propertyRoutes.post("/insertproprating", insertPropertyRatings);
propertyRoutes.get("/getpropbyid/:propertyType/:propertyId",cache('5 seconds'), getPropertiesById);
propertyRoutes.get("/getpropbytype/:type",cache('5 seconds'), getPropertiesByType);
propertyRoutes.get("/getprop/:propertyType/:userId/:propertyId",getProperty);
propertyRoutes.get('/maxPrice/:type/:sell/:rent/:lease/:flat/:house',cache('5 seconds'),maxPrice);
// propertyRoutes.get('/location/:type/:district/:mandal/:village',getPropsByLocation);
propertyRoutes.get('/location/:type/:location',getPropsByLocation);
propertyRoutes.get('/mypropslocation/:type/:location',getMyPropsByLocation);
propertyRoutes.get('/maxSizeForAllProps/:type/:sell/:rent/:lease/:flat/:house/:sold/:unsold',cache('5 seconds'),maximumSizeForAllProps);
propertyRoutes.get('/maxSize/:type/:sell/:rent/:lease/:flat/:house/:sold/:unsold',cache('5 seconds'),maximumSize);
propertyRoutes.get('/maxPriceForAllProps/:type/:sell/:rent/:lease/:flat/:house',cache('5 seconds'),maxPriceForAllProps);
propertyRoutes.get('/countOfRatings/:propertyId/:propertyType',getCountOfRatings);
propertyRoutes.get('/userLocation/property',propertyBasedOnLocation);
propertyRoutes.get("/plansBasedProperties",plansBasedProperties);
propertyRoutes.get("/:location",cache('5 seconds'), getPropertiesByLocation); 

propertyRoutes.patch("/updatePropertyDetails",updatePropertyDetails)

module.exports = propertyRoutes;
