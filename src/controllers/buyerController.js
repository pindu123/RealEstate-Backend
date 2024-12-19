const bookingModel = require("../models/bookingModel");
const userModel = require("../models/userModel");

const getAllBuyers = async (req, res) => {
  try {
    const result = await userModel.find({ role: 3 },{password:0});
    if (!result) {
      res.status(200).json("No Buyers Found");
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const removeBuyers = async (req, res) => {
  try {
    const result = await userModel.findByIdAndDelete({
      _id: req.params.buyerId,
    });
    if (!result) {
      res.status(404).json("Buyer Not Found");
    }
    const result1 = await bookingModel.deleteMany({
      userId: req.params.buyerId,
    });
    res.status(200).json("Buyer Removed Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

module.exports = {
  getAllBuyers,
  removeBuyers,
};
