// Import necessary modules
const emFieldModel = require("../models/emFieldModel");
const {emFieldValidationSchema} = require('../helpers/emAgricultureValidation');
const { handleFileUpload } = require('../services/fileUploadService');
const emInterestModel = require("../models/emInterestModel");
const userModel = require("../models/userModel");




// Get all fields which are added by that user
const getEmFields = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const fields = await emFieldModel
      .find({ userId: userId })
      .sort({ updatedAt: -1 });
    if (fields.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fields", error });
  }
};

// Create a new field
const insertEmFieldDetails = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    // console.log(req.user.user);
    const fieldDetailsData = {
      userId,
      role,
      ...req.body, // Spread the rest of the fields from the request body
    };
    // console.log(fieldDetailsData);
     // Validate the field details data against the Joi schema
     const validatedData = await emFieldValidationSchema.validateAsync(fieldDetailsData, { abortEarly: false });
console.log(validatedData);
    const fieldDetails = new emFieldModel(validatedData);
    await fieldDetails.save();
    console.log("success");
    res
      .status(201)
      .json({ message: "field details added successfully", success: true });
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
    res.status(500).json({ message: "Error inserting field details", error });
  }
};

//get all the fields for agents to show interest
const getAllEmFields = async (req, res) => {
  try {
    const userId = req.user.user.userId;
     fields = await emFieldModel.find().sort({ updatedAt: -1 });
    if (fields.length === 0) {
      return res.status(200).json([]);
    }

    // Extract property IDs
    const estIds = fields.map((field) => field._id.toString());

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
        fields.map(async (field) => {
          console.log(field.userId);
          
          // Await the result of findOne
          const user = await userModel.findOne({ _id: field.userId });
          if (!user) {
            console.log('User not found for userId:', field.userId);
            return null; // Handle this case appropriately if needed
          }
      
          // Add properties to the field object
          let fieldObj = {
            ...field.toObject(), // Convert Mongoose document to a plain object if necessary
            ownerName: `${user.firstName} ${user.lastName}`,
            ownerEmail: user.email,
            ownerPhoneNumber: user.phoneNumber,
            ownerMandal: user.mandal,
            ownerDistrict: user.district,
            ownerCity: user.city,
            interestStatus: statusMap[field._id.toString()] || 0, // Default to 0 if not found
          };
      
          return fieldObj;
        })
      );
      

    res.status(200).json(updatedFields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching fields", error });
  }
};



// Export functions
module.exports = {
  getEmFields,
  insertEmFieldDetails,
  getAllEmFields,
};
