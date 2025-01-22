// get all seller properties

const commercialModel = require("../models/commercialModel");
const fieldModel = require("../models/fieldModel");
const layoutModel = require("../models/layoutModel");
const residentialModel = require("../models/residentialModel");
const userModel = require("../models/userModel");

const getAllSellerProperties = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    console.log(userId);
    let result;
    if (req.params.type === "agriculture") {
      result = await fieldModel.find({ userId: userId });
    } else if (req.params.type === "commercial") {
      result = await commercialModel.find({ userId: userId });
      console.log("com", result);
    } else if (req.params.type === "layout") {
      result = await layoutModel.find({ userId: userId });
    } else {
      result = await residentialModel.find({ userId: userId });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const getAllSellers = async (req, res) => {
  try {
    const result = await userModel.find({ role: 2 }, { password: 0 });

    if (!result) {
      res.status(409).json("No Seller Found");
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const removerSeller = async (req, res) => {
  try {
    let sellerId = req.params.sellerId;

    const result = await userModel.findByIdAndDelete({ _id: sellerId });

    if (!result) {
      res.status(409).json("Seller Not Found");
    }
    res.status(200).json("Seller Removed Successfully");
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const getSellerStats = async (req, res) => {
  try {
    const users = await userModel.find({ role: 2 },{password:0});
    let sellerStats = [];
    for (let user of users) {
      let userId = user.id;
      const fields = await fieldModel.find({ userId: userId });
      const commercial = await commercialModel.find({ userId: userId });

      const layout = await layoutModel.find({ userId: userId });

      const residential = await residentialModel.find({ userId: userId });

      let totalSold = 0;
      fields.forEach(async (prop) => {
        if (prop.status === 1) {
          totalSold += 1;
        }
      });
      commercial.forEach(async (prop) => {
        if (prop.status === 1) {
          totalSold += 1;
        }
      });
      layout.forEach(async (prop) => {
        if (prop.status === 1) {
          totalSold += 1;
        }
      });
      residential.forEach(async (prop) => {
        if (prop.status === 1) {
          totalSold += 1;
        }
      });

      let data = {
        name: user.firstName + " " + user.lastName,
        userId: userId,
        profile: user.profilePicture,
        totalProperty:
          fields.length +
          commercial.length +
          layout.length +
          residential.length,
        totalSold: totalSold,
      };
      sellerStats.push(data);
    }

    sellerStats.sort((a, b) => b.totalProperty - a.totalProperty);

    res.status(200).json({ selllerStats: sellerStats });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

module.exports = {
  getAllSellerProperties,
  getAllSellers,
  removerSeller,
  getSellerStats,
};
