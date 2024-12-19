const propertyRatingModel = require("../models/propertyRatingModel");
const residentialModel = require("../models/residentialModel");
const wishlistModel = require("../models/wishlistModel");
const { residentialSchema } = require("../helpers/residentialValidation");
const userModel = require("../models/userModel");
const notifyModel = require("../models/notificationModel");

const createResidential = async (req, res) => {
  try {
    const { userId, role } = req.user.user;

    let insertData;
    let message={}
    req.body.amenities.electricityFacility = String( req.body.amenities.electricityFacility );


    req.body.amenities.powerSupply = String( req.body.amenities.powerSupply );

    req.body.amenities.distanceFromRoad=String( req.body.amenities.distanceFromRoad)



if(role===1)
{
    if (req.body.enteredBy) {
      const csrData = await userModel.find({ _id: userId });

      insertData = {
        userId,
        ...req.body,
        csrId: csrData[0].assignedCsr,
      };
    } else {
      const csrData = await userModel.find({ _id: userId }, { password: 0 });

      insertData = {
        userId,
        csrId: csrData[0].assignedCsr,

        enteredBy: userId,
        ...req.body,
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
      const userData = await userModel.find({
        email: req.body.agentDetails.userId,
      });

      if (req.body.enteredBy) {
        insertData = {
          csrId: userId,

          ...req.body,
          userId: userData[0]._id.toString(),
        };
      } else {
        console.log("abc");
        insertData = {
          csrId: userId,
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



    if (insertData.address.latitude === '' || insertData.address.latitude === undefined) {
      delete insertData.address.latitude;
    }
    
    if (insertData.address.longitude === '' || insertData.address.longitude === undefined) {
      delete insertData.address.longitude;
    }
    

    const result = await residentialSchema.validateAsync(insertData);
    // Create a new instance of the residential model with data from the request body
    const residential = new residentialModel(result);

    // Save the residential document to the database
    await residential.save();
    console.log(residential);
    // Send a success response

    const notify=new notifyModel(message)
await notify.save()

    res.send({
      message: "Residential Property Added Successfully",
      success: true,
    });
  } catch (error) {
    // Log detailed error information
    if (error.isJoi) {
      console.error("Error Details:", error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.error("Error Details:", error);

    // Handle any errors and send response
    res.status(500).send({
      message: "Error Adding Residential Property",
      error: error.message || error,
    });
  }
};

const getPropertiesByUserId = async (req, res) => {
  try {
    // Extract userId from req.user which should be set by authentication middleware
    const userId = req.user.user.userId;

    // Log userId for debugging
    console.log("User ID:", userId);

    // Query the residentialModel collection to find properties with the specified userId
    const properties = await residentialModel
      .find({ userId })
      .sort({ status: 1, updatedAt: -1 })
      .exec();

    if (properties.length === 0) {
      return res.status(200).json([]);
    }

    // Send the found properties as the response
    res.status(200).json(properties);
  } catch (error) {
    // Log detailed error information
    console.error("Error Details:", error);

    // Handle any errors and send response
    res.status(500).json({
      message: "Error retrieving properties",
      error: error.message || error,
    });
  }
};

//get all residential props
const getAllResidentials = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const role = req.user.user.role;
    // Query the residentialModel collection to find all residential properties
    let properties;
    if (role === 3) {
      properties = await residentialModel
        .find({ status: 0 })
        .sort({ updatedAt: -1 });
    } else {
      properties = await residentialModel
        .find()
        .sort({ status: 1, updatedAt: -1 });
    }

    if (properties.length === 0) {
      return res.status(200).json([]);
    }

    // Extract all property IDs from the properties and store them in an array
    const propertyIds = properties.map((property) => property._id.toString());

    // Prepare to store the wishlist status
    const wishStatus = await Promise.all(
      propertyIds.map(async (propertyId) => {
        const statusEntry = await wishlistModel.findOne(
          { userId, propertyId },
          { status: 1 }
        );
        return { propertyId, status: statusEntry ? statusEntry.status : 0 };
      })
    );

    // Prepare to store the rating status
    const ratingStatus = await Promise.all(
      propertyIds.map(async (propertyId) => {
        const rating = await propertyRatingModel.findOne(
          { userId, propertyId },
          { status: 1 }
        );
        return { propertyId, status: rating ? rating.status : 0 };
      })
    );

    // Combine property data with wishlist status
    const response = properties.map((property) => {
      const statusEntry = wishStatus.find(
        (entry) => entry.propertyId === property._id.toString()
      );
      const rating = ratingStatus.find(
        (entry) => entry.propertyId === property._id.toString()
      );
      return {
        ...property.toObject(),
        wishlistStatus: statusEntry ? statusEntry.status : 0,
        ratingStatus: rating ? rating.status : 0,
      };
    });

    // Send the combined data as the response
    res.status(200).json(response);
  } catch (error) {
    // Log detailed error information
    console.error("Error Details:", error);
    // Handle any errors and send response
    res.status(500).json({
      message: "Error retrieving properties",
      error: error.message || error,
    });
  }
};

module.exports = {
  createResidential,
  getPropertiesByUserId,
  getAllResidentials,
};
