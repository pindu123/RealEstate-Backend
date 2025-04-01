const { estateValidationSchema } = require("../helpers/estateValidation");
const estateModel = require("../models/estateModel");
const userModel = require("../models/userModel");

const addEstate = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    const data = {
      userId,
      role,
      ...req.body,
    };

    console.log(req.body);

    const result = await estateValidationSchema.validateAsync(data);
    console.log(result);

    const insert = new estateModel(result);
    await insert.save();

    res.status(201).json("Estate added successfully");
  } catch (error) {
    if (error.isJoi) {
      console.error(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }

    console.error(error);
    return res.status(500).json("Internal server error");
  }
};

const getClientEstates = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    console.log(userId);
    const fields = await estateModel
      .find({ userId: userId })
      .sort({ updatedAt: -1 });
    console.log(fields);
    if (fields.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({ message: "Error fetching estates", error });
  }
};

const getAllEstates = async (req, res) => {
  try {
    const fields = await estateModel.find().sort({ updatedAt: -1 });
    console.log(fields);
    if (fields.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({ message: "Error fetching estates", error });
  }
};

const assignAgent = async (req, res) => {
  try {
    const { agentId, estId } = req.params;

    const agent = await userModel.findOne({ _id: agentId });
    await estateModel.updateOne(
      { _id: estId },
      {
        $set: {
          status: 1,
          agentId: agentId,
          agentName: agent.firstName + " " + agent.lastName,
        },
      } // Update operation
    );
    res.status(200).json({ agentName: agent.firstName + " " + agent.lastName });
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};
module.exports = { addEstate, getClientEstates, getAllEstates, assignAgent };
