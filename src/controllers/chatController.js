const { chatSchema } = require("../helpers/chatValidation");
const chatModel = require("../models/chatModel");

const sendMessage = async (req, res) => {
  try {
    const result = await chatSchema.validateAsync(req.body);

    const chatting = new chatModel(result);

    await chatting.save();
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    } else {
      res.status(500).json("Internal Server Error");
    }
  }
};

const readMessage = async (req, res) => {
  try {
    const data = await chatModel
      .find({ 
        $or: [
          { senderId: req.params.senderId, receiverId: req.params.receiverId },
          { senderId: req.params.receiverId, receiverId: req.params.senderId },
        ],
      })
      .sort({ createdAt: 1 });
  

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(200).json("No Messages");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

module.exports = {
  sendMessage,
  readMessage,
};
