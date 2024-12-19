
const express = require("express");

const analytics = require("../controllers/analyticsController");
const apiRouter = express.Router();

apiRouter.get("/analytics", async (req, res) => {
 try {
 const data = await analytics.getAnalyticsData();
 res.json(data);
 } catch (error) {
 console.log(error);
 res.status(500).json({ error: "Failed to fetch analytics data" });
 }
});

apiRouter.get("/countbyevent", async (req, res) => {
 try {
 const data = await analytics.getTopEventsData();
 res.json(data);
 } catch (error) {
 console.log(error);
 res.status(500).json({ error: "Failed to fetch analytics data" });
 }
});

apiRouter.get("/country", async (req, res) => {
 try {
 const data = await analytics.getDemographicsByCountry();
 res.json(data);
 } catch (error) {
 console.log(error);
 res.status(500).json({ error: "Failed to fetch analytics data" });
 }
});


// apiRouter.get("/pageview", async (req, res) => {
// try {
// const data = await analytics.getPageViewsByProperty();
// res.json(data);
// } catch (error) {
// console.log(error);
// res.status(500).json({ error: "Failed to fetch analytics data" });
// }
// });



apiRouter.get("/pageview", async (req, res) => {
 try {
 const propertyId = req.query.propertyId; // Read from query parameter
 const data = await analytics.getPageViewsByProperty(propertyId);
 res.json(data);
 } catch (error) {
 console.error(error);
 res.status(500).json({ error: "Failed to fetch analytics data" });
 }
});







module.exports = apiRouter;