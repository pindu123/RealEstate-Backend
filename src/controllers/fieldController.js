// Import necessary modules
const fieldModel = require("../models/fieldModel");
const propertyRatingModel = require("../models/propertyRatingModel");
const wishlistModel = require("../models/wishlistModel");
const { fieldValidationSchema } = require("../helpers/agricultureValidation");
const userModel = require("../models/userModel");
const notifyModel = require("../models/notificationModel");

// Get all fields which are added by that user
const getFields = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const fields = await fieldModel
      .find({ userId: userId })
      .sort({ status: 1, updatedAt: -1 });
    if (fields.length === 0) {
      return res.status(200).json({ data: [] });
    }
    res.status(200).send({ data: fields, count: fields.length });
  } catch (error) {
    res.status(500).json({ message: "Error fetching fields", error });
  }
};

// Create a new field
const insertFieldDetails = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    // console.log(req.user.user);
    let fieldDetailsData;
    console.log("enteredby", req.body.enteredBy);

    let message={}
     if (role === 1) {
      const csrData = await userModel.find({ _id: userId });
      console.log("csrData", csrData.assignedCsr);
      if (req.body.enteredBy) {
        fieldDetailsData = {
          userId,
          csrId: csrData[0].assignedCsr,
          role,
          ...req.body,
        };
      } else {
        const csrData = await userModel.find({ _id: userId });

        console.log("abc");
        fieldDetailsData = {
          userId,
          role,
          enteredBy: userId,
          csrId: csrData[0].assignedCsr,
          ...req.body,
        };
      }  

message={
  "senderId":req.user.user.userId,
  "receiverId":csrData[0].assignedCsr,
     "message":`${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
     "notifyType":"Property"
}

    }
    if (role === 5) {
      const userData = await userModel.find({
        email: req.body.agentDetails.userId,
      });

      if (req.body.enteredBy) {
        fieldDetailsData = {
          csrId: userId,

          role,
          ...req.body,
          userId: userData[0]._id.toString(),
        };
      } else {
        console.log("abc");
        fieldDetailsData = {
          csrId: userId,
          role,
          enteredBy: userId,
          ...req.body,
          userId: userData[0]._id.toString(),
        };
      }
      const csrData = await userModel.find({ _id: req.user.user.userId });

      message={
        "senderId":req.user.user.userId,
        "receiverId":req.body.agentDetails.userId,
        "message":`${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
        "notifyType":"Property"

      }
    }

    if (fieldDetailsData.address.latitude === '' || fieldDetailsData.address.latitude === undefined) {
      delete fieldDetailsData.address.latitude;
    }
    
    if (fieldDetailsData.address.longitude === '' || fieldDetailsData.address.longitude === undefined) {
      delete fieldDetailsData.address.longitude;
    }
    
    const validatedData = await fieldValidationSchema.validateAsync(
      fieldDetailsData,
      { abortEarly: false }
    );
    console.log("after validation", validatedData);
    const fieldDetails = new fieldModel(validatedData);
    await fieldDetails.save();
    console.log("success");

const notify=new notifyModel(message)
await notify.save()

    res
      .status(201)
      .json({ message: "field details added successfully", success: true });
  } catch (error) {
    // Handle validation errors

    if (error.isJoi) {
      console.log(error);
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

//get all the fields
const getAllFields = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const role = req.user.user.role;
    // Fetch all fields
    let fields;
    if (role === 3) {
      fields = await fieldModel.find({ status: 0 }).sort({ updatedAt: -1 });
    } else {
      fields = await fieldModel.find().sort({ status: 1, updatedAt: -1 });
    }
    if (fields.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // Extract property IDs
    const propertyIds = fields.map((field) => field._id.toString());

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
    // Add wishStatus to each field item
    const updatedFields = fields.map((field) => {
      const fieldObj = field.toObject(); // Convert Mongoose document to plain object
      fieldObj.wishStatus = statusMap[field._id.toString()] || 0; // Default to 0 if not found
      fieldObj.ratingStatus = ratingstatusMap[field._id.toString()] || 0; // Default to 0 if not found
      return fieldObj;
    });

    res.status(200).json({ data: updatedFields, count: updatedFields.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching fields", error });
  }
};

//get fields by district
const getByDistrict = async (req, res) => {
  try {
    const properties = await fieldModel
      .find(
        {},
        {
          "landDetails.images": 1,
          "address.district": 1,
          "landDetails.title": 1,
          "landDetails.size": 1,
          "landDetails.totalPrice": 1,
        }
      )
      .exec();
    if (properties.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).send(properties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fields", error });
  }
};

const editFieldDetails = async (req, res) => {
  try {
   
    let propertyId=req.body.propertyId
    let data={...req.body}
      const updateFileds = await fieldModel.findByIdAndUpdate(propertyId, data , {
      new: true, 
      runValidators: true,
    });
    
    res.status(200).json("Updated Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

module.exports = {
  getFields,
  insertFieldDetails,
  getAllFields,
  getByDistrict,
  editFieldDetails
};
