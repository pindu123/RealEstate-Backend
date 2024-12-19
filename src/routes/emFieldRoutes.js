const express = require("express");
const {
  getEmFields,
  insertEmFieldDetails,
  getAllEmFields,
} = require("../controllers/emFieldController");

const emFieldRoutes = express.Router();
const apicache = require('apicache');
const cache = apicache.middleware;

emFieldRoutes.get("/getfields", getEmFields);
emFieldRoutes.post("/insert", insertEmFieldDetails);
emFieldRoutes.get("/getallfields", getAllEmFields);

module.exports = emFieldRoutes;
