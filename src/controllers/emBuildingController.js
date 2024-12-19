// Import necessary modules
const emFieldModel = require("../models/emFieldModel");
const {emFieldValidationSchema} = require('../helpers/emAgricultureValidation');
const { handleFileUpload } = require('../services/fileUploadService');
const emInterestModel = require("../models/emInterestModel");
const userModel = require("../models/userModel");
const { emBuildingValidationSchema } = require("../helpers/emBuildingValidation");
const emBuildingModel = require("../models/emBuildingModel");




// Get all fields which are added by that user(client)
const getEmBuildings = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const buildings = await emBuildingModel
      .find({ userId: userId })
      .sort({ updatedAt: -1 });
    if (buildings.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(buildings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching buildings", error });
  }
};

// Create a new field
const insertEmBuildingDetails = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    const buildingDetailsData = {
      userId,
      role,
      ...req.body, // Spread the rest of the fields from the request body
    };
     // Validate the field details data against the Joi schema
     const validatedData = await emBuildingValidationSchema.validateAsync(buildingDetailsData, { abortEarly: false });
console.log(validatedData);
    const buildingDetails = new emBuildingModel(validatedData);
    await buildingDetails.save();
    console.log("success");
    res
      .status(201)
      .json({ message: "building details added successfully", success: true });
  } catch (error) {
    // Handle validation errors
    
    if (error.isJoi) {
      console.log(error)
      return res.status(422).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message), // Provide detailed Joi validation errors
        success: false,
      });
    }
    
    // Handle server errors
    console.log(error);
    res.status(500).json({ message: "Error inserting building details", error });
  }
};

//get all the fields for agents to show interest
const getAllEmBuildings = async (req, res) => {
  try {
    const userId = req.user.user.userId;
     buildings = await emBuildingModel.find().sort({ updatedAt: -1 });
    if (buildings.length === 0) {
      return res.status(200).json([]);
    }
console.log(buildings);
    // Extract property IDs
    const estIds = buildings.map((building) => building._id.toString());

     // Fetch interest statuses for all property IDs
     const statuses = await emInterestModel
       .find({ userId: userId, estId: { $in: estIds } })
       .select("estId status");
   
    // // Create a map for quick status lookup
    const statusMap = statuses.reduce((map, item) => {
      map[item.estId.toString()] = item.status;
      return map;
    }, {});

   
     // Add interestStatus to each field item
     const updatedFields = await Promise.all(
        buildings.map(async (building) => {
          console.log(building.userId);
          
          // Await the result of findOne
          const user = await userModel.findOne({ _id: building.userId });
          if (!user) {
            console.log('User not found for userId:', building.userId);
            return null; // Handle this case appropriately if needed
          }
      
          // Add properties to the field object
          let fieldObj = {
            ...building.toObject(), // Convert Mongoose document to a plain object if necessary
            ownerName: `${user.firstName} ${user.lastName}`,
            ownerEmail: user.email,
            ownerPhoneNumber: user.phoneNumber,
            ownerMandal: user.mandal,
            ownerDistrict: user.district,
            ownerCity: user.city,
            interestStatus: statusMap[building._id.toString()] || 0, // Default to 0 if not found
          };
      
          return fieldObj;
        })
      );
      

    res.status(200).json(updatedFields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching buildings", error });
  }
};



// Export functions
module.exports = {
  getEmBuildings,
  insertEmBuildingDetails,
  getAllEmBuildings,
};
