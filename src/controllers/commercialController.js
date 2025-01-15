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
const createCommercials = async (req, res) => {
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
        "message":`${csrData[0].firstName} ${csrData[0].lastName}  has added a new property`,
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

/**
 * Utility function to generate a unique property ID for commercial properties.
 * Prefix: "PC"
 */
const generatePropertyId = async (typePrefix, model) => {
  const lastEntry = await model.findOne().sort({ _id: -1 }).select('propertyId');
  let lastId = 0;
  if (lastEntry && lastEntry.propertyId) {
    lastId = parseInt(lastEntry.propertyId.slice(2), 10); // Extract numeric part after "PC"
  }
  return `${typePrefix}${lastId + 1}`;
};

/**
 * API to create a commercial property.PC1
 */
const createCommercial = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    
    // Ensure required fields are structured correctly
    req.body.propertyDetails.amenities.isElectricity = String(req.body.propertyDetails.amenities.isElectricity);
    req.body.propertyDetails.landDetails.address.latitude = String(req.body.propertyDetails.landDetails.address.latitude);
    req.body.propertyDetails.landDetails.address.longitude = String(req.body.propertyDetails.landDetails.address.longitude);

    // Generate a unique property ID for commercial properties
    const propertyId = await generatePropertyId("PC", commercialModel);
    req.body.propertyId = propertyId;

    let commercialData;
    let message = {};

    // Fetch user data
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(409).json({ message: "User not found" });
    }

    if (role === 1) { // CSR role
      const csrId = userData.assignedCsr;
      const csrData = await userModel.findById(csrId);
      if (!csrData) {
        return res.status(409).json({ message: "Assigned CSR not found" });
      }

      commercialData = {
        userId,
        csrId: csrData._id.toString(),
        role,
        ...req.body,
        enteredBy: req.body.enteredBy || userId,
      };

      message = {
        senderId: userId,
        receiverId: csrData._id.toString(),
        message: `${csrData.firstName} ${csrData.lastName} has added a new commercial property`,
        notifyType: "Property",
      };
    } else if (role === 5) { // Agent role
      const agentData = await userModel.findOne({ email: req.body.propertyDetails.agentDetails.userId });
      if (!agentData) {
        return res.status(409).json({ message: "Agent not found" });
      }

      commercialData = {
        userId: agentData._id.toString(),
        csrId: userId,
        role,
        ...req.body,
        enteredBy: req.body.enteredBy || userId,
      };

      message = {
        senderId: userId,
        receiverId: req.body.propertyDetails.agentDetails.userId,
        message: `${userData.firstName} ${userData.lastName} has added a new property`,
        notifyType: "Property",
      };
    } else {
      return res.status(403).json({ message: "Unauthorized role for this action" });
    }

    // Clean up optional latitude/longitude if empty
    if (!commercialData.propertyDetails.landDetails.address.latitude) {
      delete commercialData.propertyDetails.landDetails.address.latitude;
    }
    if (!commercialData.propertyDetails.landDetails.address.longitude) {
      delete commercialData.propertyDetails.landDetails.address.longitude;
    }
console.log(commercialData)
    // Validate the data
    const validatedData = await commercialSchema.validateAsync(commercialData, { abortEarly: false });

    // Save the commercial details
    const commercialDetails = new commercialModel(validatedData);
    await commercialDetails.save();

    // Save the notification

    let message1={
      senderId:userId,
      receiverId:0,
      message:"A new property added ! Please checkout",
      notifyType:"Customer"
    }

    const notification = new notifyModel(message);
    const notification1=new notifyModel(message1);
    await notification.save();

    await notification1.save();
    
    res.status(201).json({
      message: "Commercial property added successfully",
      success: true,
      propertyDetails: validatedData,
    });
  } catch (error) {
    if (error.isJoi) {
      console.log(error)
      return res.status(422).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message),
        success: false,
      });
    }
    console.error(error);
    res.status(500).json({ message: "Error creating commercial property", error });
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
