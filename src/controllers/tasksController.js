const taskValidation = require("../helpers/taskValidation");
const tasksModel = require("../models/tasksModel");

const createTask = async (req, res) => {
  try {
    const result = await taskValidation.validateAsync(req.body);

    const tasks = new tasksModel(result);
    await tasks.save();
    res.status(200).json("Task Assigned Successfully");
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

module.exports = { createTask };
