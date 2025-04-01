const express = require("express");
const {
  getFields,
  insertFieldDetails,
  getAllFields,
  editFieldDetails,
} = require("../controllers/fieldController");

const fieldRoutes = express.Router();
const apicache = require("apicache");
const cache = apicache.middleware;

fieldRoutes.get("/getfields", getFields);
fieldRoutes.post("/insert", insertFieldDetails);
fieldRoutes.get("/getallfields", getAllFields);

fieldRoutes.patch("/editFieldDetails", editFieldDetails);

module.exports = fieldRoutes;
