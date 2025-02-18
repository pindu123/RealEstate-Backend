const express = require("express");
const { userLoginController, otpForLogin, otpLogin, verifyPhno, verifyEmail, resetMail, contactUs } = require("../controllers/noAuthController");
const { display } = require("../controllers/defaultController");
const { createUser, findAnAgent } = require("../controllers/userController");
const {
  getAllProperties,
  resetRatings,
  getLatestProps,
  getAllProperties1,
} = require("../controllers/propertyController");
const { getByDistrict } = require("../controllers/fieldController");

const apicache = require('apicache');
let cache = apicache.middleware;
 
const noAuthRouter = express.Router();
noAuthRouter.get('/verifyPhno/:phoneNumber',verifyPhno);
noAuthRouter.get('/verifyEmail/:email',verifyEmail);
noAuthRouter.get("/latestprops",cache('5 seconds'), getLatestProps);
noAuthRouter.put("/reset", resetRatings);
noAuthRouter.get("/getallprops",getAllProperties);
noAuthRouter.get("/getbydist",cache('5 seconds'), getByDistrict);
noAuthRouter.post("/login", userLoginController);
noAuthRouter.post("/create", createUser);
noAuthRouter.get("/hi", display);
noAuthRouter.post("/otp",otpForLogin);
noAuthRouter.post('/verify',otpLogin);
noAuthRouter.put("/resetPassword", resetMail);
noAuthRouter.post("/contactUs",contactUs);
noAuthRouter.get("/findAnAgent",findAnAgent);

noAuthRouter.get("/getAllProperties1",getAllProperties1);
module.exports = noAuthRouter;
