const express = require("express");
const apicache = require("apicache");
const {
createActivity,
getAllActivities,
getSpecificActivity,
updateActivity,
getActivities
} = require("../controllers/activityController");

const activityRoutes = express.Router();
const cache = apicache.middleware;

activityRoutes.post("/add", createActivity);
activityRoutes.get("/activities", getAllActivities);
activityRoutes.get("/activity/:activityId", getSpecificActivity);
activityRoutes.put("/activity/:activityId", updateActivity);
activityRoutes.get("/getActivities",getActivities);






module.exports = activityRoutes;