const layoutModel = require("../models/layoutModel");
const propertyRatingModel = require("../models/propertyRatingModel");
const wishlistModel = require("../models/wishlistModel");
const userModel = require("../models/userModel");
const {
  layoutValidationSchema,
  updatePlotsValidationSchema,
} = require("../helpers/layoutValidation");
const notifyModel = require("../models/notificationModel");

// Create a new field
const insertLayoutDetails = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
console.log("asas",req.body.amenities.electricityFacility  )

  

 
    let layoutDetailsData;
    let message={}

    req.body.amenities.electricityFacility = String(req.body.amenities.electricityFacility);

if(role===1)
 {  

    if (req.body.enteredBy) {
      const csrData = await userModel.find({ _id: userId });

      layoutDetailsData = {
        userId,
        role,
        ...req.body,
        csrId: csrData[0].assignedCsr,
        // "amenities.electricityFacility":req.body.amenities.electricityFacility.toString(),

      };
    } else {
      console.log("abc");
      const csrData = await userModel.find({ _id: userId });

      layoutDetailsData = {
        userId,
        role,
        enteredBy: userId,
        ...req.body,
        csrId: csrData[0].assignedCsr,
        // "amenities.electricityFacility":req.body.amenities.electricityFacility.toString(),

      };
    }
    const csrData = await userModel.find({ _id: userId });

     message={
      "senderId":req.user.user.userId,
      "receiverId":csrData[0].assignedCsr,
      "message":`${csrData[0].firstName} ${csrData[0].lastName}  has added a new property`,
      "notifyType":"Property"

    }
  }
    if (role === 5) {
      const userData = await userModel.find({
        email: req.body.agentDetails.userId,
      });

      if (req.body.enteredBy) {
        layoutDetailsData = {
          csrId: userId,

          role,
          ...req.body,
          userId: userData[0]._id.toString(),
          // "amenities.electricityFacility":req.body.amenities.electricityFacility.toString(),

        };
      } else {
        console.log("abc");
        layoutDetailsData = {
          csrId: userId,
          role,
          enteredBy: userId,
          // "amenities.electricityFacility":req.body.amenities.electricityFacility.toString(),

          ...req.body,
          userId: userData[0]._id.toString(),
 
        };
      }
      const csrData = await userModel.find({ _id: req.user.user.userId });
console.log("layoutDetailsData",layoutDetailsData)
      message={
        "senderId":req.user.user.userId,
        "receiverId":req.body.agentDetails.userId,
        "message":`${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
        "notifyType":"Property"

      }
    }



    if (layoutDetailsData.layoutDetails.address.latitude === '' || layoutDetailsData.layoutDetails.address.latitude === undefined) {
      delete layoutDetailsData.layoutDetails.address.latitude;
    }
    
    if (layoutDetailsData.layoutDetails.address.longitude === '' || layoutDetailsData.layoutDetails.address.longitude === undefined) {
      delete layoutDetailsData.layoutDetails.address.longitude;
    }
    

    // Validate the request body against the Joi schema
    const result = await layoutValidationSchema.validateAsync(
      layoutDetailsData
    );
    console.log("result", result);

    const layoutDetails = new layoutModel(result);
    await layoutDetails.save();



    const notify=new notifyModel(message)
await notify.save()
    res
      .status(201)
      .json({ message: "Layout details added successfully", success: true });
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message), // Provide detailed Joi validation errors
        success: false,
      });
    }
    console.log(error);
    res.status(500).json({ message: "Error inserting layout details", error });
  }
};
// Function to get all layout properties added by that user
const getLayouts = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const layouts = await layoutModel
      .find({ userId: userId })
      .sort({ status: 1, updatedAt: -1 });
    if (layouts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(layouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all layouts

const getAllLayouts = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const role = req.user.user.role;
    // Fetch all layouts
    let layouts;
    if (role === 3) {
      layouts = await layoutModel.find({ status: 0 }).sort({ updatedAt: -1 });
    } else {
      layouts = await layoutModel.find().sort({ status: 1, updatedAt: -1 });
    }

    if (layouts.length === 0) {
      return res.status(200).json([]);
    }

    // Extract property IDs
    const propertyIds = layouts.map((property) => property._id.toString());

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
    // Add wishStatus to each layout item
    const updatedLayouts = layouts.map((layout) => {
      const layoutObj = layout.toObject(); // Convert Mongoose document to plain object
      layoutObj.wishStatus = statusMap[layout._id.toString()] || 0;
      layoutObj.ratingStatus = ratingstatusMap[layout._id.toString()] || 0; // Default to 0 if not found
      return layoutObj;
    });

    res.status(200).json(updatedLayouts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//update available plots
const updateplots = async (req, res) => {
  try {
    // Extract userId from the authenticated user
    const userId = req.user.user.userId;

    // Prepare the data to be validated
    const updateData = {
      ...req.body, // Spread the request body which includes propertyId and availablePlots
      userId, // Include the userId from the token
    };

    // Validate the request body using the Joi schema
    const validatedData = await updatePlotsValidationSchema.validateAsync(
      updateData,
      { abortEarly: false }
    );

    const { propertyId, availablePlots } = validatedData;

    // Check if the property belongs to the user
    const property = await layoutModel.findOne({
      _id: propertyId,
      userId: userId,
    });
    if (!property) {
      return res
        .status(404)
        .json({ message: "This is not your property to update." });
    }

    // Update the available plots
    const updatedProperty = await layoutModel.findOneAndUpdate(
      { _id: propertyId, userId: userId }, // Ensure the propertyId belongs to the user
      { $set: { "layoutDetails.availablePlots": availablePlots } }, // Update availablePlots
      { new: true } // Return the updated document
    );

    // Check if the property was found and updated
    if (!updatedProperty) {
      return res
        .status(404)
        .json({ message: "No property found with the specified ID." });
    }

    return res
      .status(200)
      .json({ message: "Updated successfully", property: updatedProperty });
  } catch (error) {
    if (error.isJoi) {
      // Handle Joi validation errors
      console.log(error);
      return res.status(422).json({
        message: "Validation error",
        details: error.details.map((err) => err.message), // Provide detailed Joi validation errors
      });
    }
    // Handle any other errors
    console.error("Error updating available plots:", error);
    return res
      .status(500)
      .json({ message: "Error updating available plots", error });
  }
};

// Export functions
module.exports = {
  insertLayoutDetails,
  getLayouts,
  getAllLayouts,
  updateplots,
};
