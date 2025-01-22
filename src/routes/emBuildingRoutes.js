const express = require("express");

const {insertEmBuildingDetails, getEmBuildings, getAllEmBuildings} = require('../controllers/emBuildingController');

const emBuildingRoutes = express.Router();
const apicache = require('apicache');
const cache = apicache.middleware;

emBuildingRoutes.get('/getBuildings',getEmBuildings);
emBuildingRoutes.get('/getAllBuildings',getAllEmBuildings);
emBuildingRoutes.post('/insert',insertEmBuildingDetails);

module.exports = emBuildingRoutes;
