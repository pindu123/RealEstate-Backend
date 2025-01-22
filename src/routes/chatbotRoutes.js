const express = require("express");
const {
 chatBot
} = require("../controllers/chatbotController"); // Import as an object

const chatbotRoutes = express.Router();

chatbotRoutes.post("/chat", chatBot); //route 

module.exports = chatbotRoutes;