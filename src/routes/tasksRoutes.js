const express = require("express");
const { createTask } = require("../controllers/tasksController");

const taskRoutes = express.Router();

taskRoutes.post("/createTask", createTask);

module.exports = taskRoutes;
