const express = require("express");
const { postInFacebook } = require("../controllers/socialMediaPost");
const socialMedia = express.Router();

socialMedia.post("/facebook", postInFacebook);

module.exports = socialMedia;
