// controllers/commercialController.js
const Commercial = require("../models/commercialModel");
const wishlistModel = require("../models/wishlistModel");
const propertyRatingModel = require("../models/propertyRatingModel");
const { commercialSchema } = require("../helpers/commercialValidation");
const userModel = require("../models/userModel");
const commercialModel = require("../models/commercialModel");
const notifyModel = require("../models/notificationModel");

function formatToIndianRupees(number) {
  const [integerPart, decimalPart] = number.toString().split(".");
  const lastThreeDigits = integerPart.slice(-3);
  const otherDigits = integerPart.slice(0, -3);
  const formattedInteger =
    otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
    (otherDigits.length > 0 ? "," : "") +
    lastThreeDigits;

  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

// Function to create a new commercial property
const createCommercial = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    console.log(userId,role)
    let createcomm;

    req.body.propertyDetails.amenities.isElectricity = String(req.body.propertyDetails.amenities.isElectricity);
 req.body.propertyDetails.landDetails.address.latitude=String(req.body.propertyDetails.landDetails.address.latitude);
 req.body.propertyDetails.landDetails.address.longitude=String(req.body.propertyDetails.landDetails.address.longitude);
    let message={}
    if(role ===1)
    {
    if (req.body.enteredBy) {
      const csrData = await userModel.find({ _id: userId });

      createcomm = {
        userId,
        ...req.body,
        csrId: csrData[0].assignedCsr,
      };
    } else {
      console.log("abc");
      console.log("xyz",req.user.user.userId )
      const csrData = await userModel.find({ _id: req.user.user.userId });
console.log("sddds")
      createcomm = {
        userId,
        enteredBy: userId,
        ...req.body,
        csrId: csrData[0].assignedCsr,
      };
    }
    const csrData = await userModel.find({ _id: userId });

      message={
      "senderId":req.user.user.userId,
      "receiverId":csrData[0].assignedCsr,
      "message":`${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
      "notifyType":"Property"

    }
  }
    if (role === 5) {
      console.log(req.body);
      const userData = await userModel.find({
        email: req.body.propertyDetails.agentDetails.userId,
      });

      if (req.body.enteredBy) {
        createcomm = {
          csrId: userId,

          ...req.body,
          userId: userData[0]._id.toString(),
        };
      } else {
        console.log("abc");
        console.log("xyz",req.user.user.userId,userId)
        createcomm = {
          csrId: userId,
          enteredBy: userId,
          ...req.body,
          userId: userData[0]._id.toString(),
        };
      }
      console.log("agent", createcomm)

      const csrData = await userModel.find({ _id: req.user.user.userId });
console.log("agent",req.body)
      message={
        "senderId":req.user.user.userId,
        "receiverId":req.body.propertyDetails.agentDetails.userId,
        "message":`${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
        "notifyType":"Property"

      }
    }



    if (createcomm.propertyDetails.landDetails.address.latitude === '' || createcomm.propertyDetails.landDetails.address.latitude === undefined) {
      delete createcomm.propertyDetails.landDetails.address.latitude;
    }
    
    if (createcomm.propertyDetails.landDetails.address.longitude === '' || createcomm.propertyDetails.landDetails.address.longitude === undefined) {
      delete createcomm.propertyDetails.landDetails.address.longitude;
    }

    const result = await commercialSchema.validateAsync(createcomm);
    const commercialDetails = new Commercial(result);
    await commercialDetails.save();
    console.log(result);


const notify=new notifyModel(message)
await notify.save()

    console.log(commercialDetails);
    res.status(201).json("property added successfully");
  } catch (error) {
    console.log(error);
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// Function to get all commercial properties added by that user
const getCommercials = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const commercials = await Commercial.find({ userId: userId }).sort({
      status: 1,
      updatedAt: -1,
    });
    if (commercials.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(commercials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to get all commercial properties
const getAllCommercials = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const role = req.user.user.role;
    // Fetch all commercials
    let commercials;
    if (role === 3) {
      commercials = await Commercial.find({ status: 0 }).sort({
        updatedAt: -1,
      });
    } else {
      commercials = await Commercial.find().sort({
        status: 1,
        updatedAt: -1,
      });
    }

    if (commercials.length === 0) {
      return res.status(200).json([]);
    }

    // Extract property IDs
    const propertyIds = commercials.map((property) => property._id.toString());

    // Fetch wishlist statuses for all property IDs
    const statuses = await wishlistModel
      .find({ userId: userId, propertyId: { $in: propertyIds } })
      .select("propertyId status");
    const ratingstatuses = await propertyRatingModel
      .find({ userId: userId, propertyId: { $in: propertyIds } })
      .select("propertyId status");
    // Create a map for quick status lookup
    const statusMap = statuses.reduce((map, item) => {
      map[item.propertyId.toString()] = item.status;
      return map;
    }, {});

    const ratingstatusMap = ratingstatuses.reduce((map, item) => {
      map[item.propertyId.toString()] = item.status;
      return map;
    }, {});
    // Add wishStatus to each commercial item
    const updatedCommercials = commercials.map((commercial) => {
      const commercialObj = commercial.toObject(); // Convert Mongoose document to plain object
      commercialObj.wishStatus = statusMap[commercial._id.toString()] || 0;
      commercialObj.ratingStatus =
        ratingstatusMap[commercial._id.toString()] || 0; // Default to 0 if not found
      return commercialObj;
    });

    res.status(200).json(updatedCommercials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const editCommDetails = async (req, res) => {
  try {
    const comm = new commercialModel(req.body);
    await comm.save().then((resp) => {
      res.status(200).status("Updated Successfully");
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

// Exporting the display function
module.exports = {
  createCommercial,
  getCommercials,
  getAllCommercials,
  editCommDetails
};
