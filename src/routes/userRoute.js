const express = require("express");
const {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  namesBasedOnRole,
  getProfile,
  getUsersByRole,
  createCSR,
} = require("../controllers/userController");

const userRoutes = express.Router();

userRoutes.get("/", getUsers);
// userRoutes.post('/create', createUser);
userRoutes.put("/update", updateUser);
userRoutes.delete("/delete/:_id", deleteUser);
userRoutes.get("/getprofile", getProfile);
userRoutes.get("/getnames/:role", namesBasedOnRole);
userRoutes.get("/getusersbyrole/:role", getUsersByRole);
userRoutes.post("/createCSR", createCSR);
module.exports = userRoutes;
