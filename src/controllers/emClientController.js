const bookingModel = require("../models/bookingModel");
const emBookingModel = require("../models/emBookingModel");
const emFieldModel = require("../models/emFieldModel");
const emInterestModel = require("../models/emInterestModel");
const estateModel = require("../models/estateModel");
const userModel = require("../models/userModel");

const getInterestedAgents = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const lands = await emFieldModel.find({ userId: userId });
    const estIds = lands.map((field) => field._id.toString());
    let result = [];

    for (let estId of estIds) {
      const interests = await emInterestModel.find({ estId: estId });

      for (let interest of interests) {
        const agentId = interest.userId;
        const agentDetails = await userModel.findOne({ _id: agentId });

        if (agentDetails) {
          result.push({
            ...interest.toObject(),
            agentDetails,
          });
        }
      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json("Internal server error");
  }
};

 const getAllAgents = async (req, res) => {
  try {
    const { estId } = req.params;
    const userId = req.user.user.userId;
    const fields =
      "firstName lastName role phoneNumber profilePicture email city mandal district pinCode";
    let agents = await userModel.find({ role: 1 }).select(fields);
    if (agents.length === 0) {
      return res.status(404).json("Agents not found");
    }
    agents = await Promise.all(
      agents.map(async (agent) => {
        const bookings = await emBookingModel.find({
          estId: estId,
          status: 1,
          agentId: agent._id,
          clientId: userId,
        });
        console.log("bookings", bookings);
        let assign = bookings.length !== 0;
        return {
          ...agent.toObject(),
          assign,
        };
      })
    );
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

const getAllEmClients = async (req, res) => {
  try {
    const result = await userModel.find({ role: 4 });

    if (!result) {
      res.status(404).json("No Estate Clients Found");
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const removeEmClients = async (req, res) => {
  try {
    let clientId = req.params.clientId;
    const result = await userModel.findByIdAndDelete({ _id: clientId });
    if (result) {
      const result2 = await emBookingModel.deleteMany({ clientId: clientId });
    }
    res.status(200).json("Estate Client Removed Successfully");
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

module.exports = {
  getInterestedAgents,
  getAllAgents,
  getAllEmClients,
  removeEmClients,
};
