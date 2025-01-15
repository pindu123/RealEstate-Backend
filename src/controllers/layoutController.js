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
const insertLayoutDetail = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    console.log("asas", req.body.amenities.electricityFacility);

    let layoutDetailsData;
    let message = {};

    req.body.amenities.electricityFacility = String(
      req.body.amenities.electricityFacility
    );

    if (role === 1) {
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

      message = {
        senderId: req.user.user.userId,
        receiverId: csrData[0].assignedCsr,
        message: `${csrData[0].firstName} ${csrData[0].lastName}  has added a new property`,
        notifyType: "Property",
      };
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
      console.log("layoutDetailsData", layoutDetailsData);
      message = {
        senderId: req.user.user.userId,
        receiverId: req.body.agentDetails.userId,
        message: `${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
        notifyType: "Property",
      };
    }

    if (
      layoutDetailsData.layoutDetails.address.latitude === "" ||
      layoutDetailsData.layoutDetails.address.latitude === undefined
    ) {
      delete layoutDetailsData.layoutDetails.address.latitude;
    }

    if (
      layoutDetailsData.layoutDetails.address.longitude === "" ||
      layoutDetailsData.layoutDetails.address.longitude === undefined
    ) {
      delete layoutDetailsData.layoutDetails.address.longitude;
    }

    // Validate the request body against the Joi schema
    const result = await layoutValidationSchema.validateAsync(
      layoutDetailsData
    );
    console.log("result", result);

    const layoutDetails = new layoutModel(result);
    await layoutDetails.save();

    const notify = new notifyModel(message);
    await notify.save();
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

/**
 * Utility function to generate a unique property ID for layout properties.
 * Prefix: "PL"
 */
const generatePropertyId = async (typePrefix, model) => {
  const lastEntry = await model
    .findOne()
    .sort({ _id: -1 })
    .select("propertyId");
  let lastId = 0;
  if (lastEntry && lastEntry.propertyId) {
    lastId = parseInt(lastEntry.propertyId.slice(2), 10); // Extract numeric part after "PL"
  }
  return `${typePrefix}${lastId + 1}`;
};

/**
 * API to insert layout details.
 */
const insertLayoutDetails = async (req, res) => {
  try {
    const { userId, role } = req.user.user;

    req.body.amenities.electricityFacility = String(
      req.body.amenities.electricityFacility
    );

    // Generate a unique property ID for layout properties
    const propertyId = await generatePropertyId("PL", layoutModel);
    req.body.propertyId = propertyId;

    let layoutDetailsData;
    let message = {};

    if (role === 1) {
      // CSR role
      const csrData = await userModel.findById(userId);
      if (!csrData) {
        return res.status(404).json({ message: "CSR not found" });
      }

      layoutDetailsData = {
        userId,
        role,
        enteredBy: req.body.enteredBy || userId,
        ...req.body,
        csrId: csrData.assignedCsr,
      };

      message = {
        senderId: userId,
        receiverId: csrData.assignedCsr,
        message: `${csrData.firstName} ${csrData.lastName} has added a new property`,
        notifyType: "Property",
      };
    } else if (role === 5) {
      // Agent role
      const agentData = await userModel.findOne({
        email: req.body.agentDetails.userId,
      });
      if (!agentData) {
        return res.status(404).json({ message: "Agent not found" });
      }

      layoutDetailsData = {
        csrId: userId,
        role,
        enteredBy: req.body.enteredBy || userId,
        ...req.body,
        userId: agentData._id.toString(),
      };

      const csrData = await userModel.findById(userId);
      message = {
        senderId: userId,
        receiverId: req.body.agentDetails.userId,
        message: `${csrData.firstName} ${csrData.lastName} has added a new property`,
        notifyType: "Property",
      };
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized role for this action" });
    }

    // Clean up optional latitude/longitude if empty
    if (!layoutDetailsData.layoutDetails.address.latitude) {
      delete layoutDetailsData.layoutDetails.address.latitude;
    }
    if (!layoutDetailsData.layoutDetails.address.longitude) {
      delete layoutDetailsData.layoutDetails.address.longitude;
    }

    // Validate the request body against the Joi schema
    const validatedData = await layoutValidationSchema.validateAsync(
      layoutDetailsData,
      { abortEarly: false }
    );

    // Save layout details
    const layoutDetails = new layoutModel(validatedData);
    await layoutDetails.save();

    // Save notification

    let message1 = {
      senderId: userId,
      receiverId: 0,
      message: "A new property added ! Please checkout",
      notifyType: "Customer",
    };
    const notification = new notifyModel(message);

    const notification1 = new notifyModel(message1);
    await notification.save();
    await notification1.save();
    res.status(201).json({
      message: "Layout details added successfully",
      success: true,
      propertyDetails: validatedData,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(422).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message),
        success: false,
      });
    }
    res.status(500).json({ message: "Error inserting layout details", error });
  }
};

module.exports = { insertLayoutDetails };

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

    const page=req.query.page
    const limit=req.query.limit
    let layouts;

    // Fetch all layouts

    if(page)
    {
           let offset=(page-1)*limit
           if (role === 3) {
            layouts = await layoutModel.find({ status: 0 }).skip(offset).limit(limit).sort({ updatedAt: -1 });
          } else {
            layouts = await layoutModel.find().skip(offset).limit(limit).sort({ status: 1, updatedAt: -1 });
          }
    }
    else
    {
      if (role === 3) {
        layouts = await layoutModel.find({ status: 0 }).sort({ updatedAt: -1 });
      } else {
        layouts = await layoutModel.find().sort({ status: 1, updatedAt: -1 });
      }
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
