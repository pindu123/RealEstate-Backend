const propertyRatingModel = require("../models/propertyRatingModel");
const residentialModel = require("../models/residentialModel");
const wishlistModel = require("../models/wishlistModel");
const { residentialSchema } = require("../helpers/residentialValidation");
const userModel = require("../models/userModel");
const notifyModel = require("../models/notificationModel");

const createResidentials = async (req, res) => {
  try {
    const { userId, role } = req.user.user;

    let insertData;
    let message={}
     req.body.amenities.electricityFacility = String( req.body.amenities.electricityFacility );
     req.body.amenities.powerSupply = String( req.body.amenities.powerSupply );
     req.body.amenities.distanceFromRoad=String( req.body.amenities.distanceFromRoad)
console.log("request",req.body)





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
      "message":`${csrData[0].firstName} ${csrData[0].lastName}  has added a new property`,
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
        "message":`${csrData[0].firstName} ${csrData[0].lastName}  has added a new property`,
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

const generatePropertyId = async (typePrefix, model) => {
  const lastEntry = await model.findOne().sort({ _id: -1 }).select('propertyId');
  let lastId = 0;
  
  // Check if there's a previous propertyId
  if (lastEntry && lastEntry.propertyId) {
    // Extract numeric part after the "PR" prefix and parse it as an integer
    lastId = parseInt(lastEntry.propertyId.slice(2), 10); 
  }

  // Return the next propertyId by incrementing the lastId
  return `${typePrefix}${lastId + 1}`;
};

const createResidential = async (req, res) => {
  try {
    const { userId, role } = req.user.user;

    let insertData;
    let message = {};

    // Ensure amenities are stored as strings where required
    req.body.amenities.electricityFacility = String(req.body.amenities.electricityFacility);
    req.body.amenities.powerSupply = String(req.body.amenities.powerSupply);
    req.body.amenities.distanceFromRoad = String(req.body.amenities.distanceFromRoad);

    console.log("Request Body:", req.body);

    // Generate propertyId
    const propertyId = await generatePropertyId("PR", residentialModel);
    insertData = {
      propertyId,  // Assign generated propertyId
      userId,  // Add the userId to the insertData object
      ...req.body,
    };

    if (role === 1) {
      if (req.body.enteredBy) {
        const csrData = await userModel.find({ _id: userId });

        insertData.csrId = csrData[0].assignedCsr;
      } else {
        const csrData = await userModel.find({ _id: userId }, { password: 0 });

        insertData.enteredBy = userId;
        insertData.csrId = csrData[0].assignedCsr;
      }

      const csrData = await userModel.find({ _id: userId });

      message = {
        senderId: req.user.user.userId,
        receiverId: csrData[0].assignedCsr,
        message: `${csrData[0].firstName} ${csrData[0].lastName} has added a new property`,
        notifyType: "Property",
      };
    }

    if (role === 5) {
      const userData = await userModel.find({ email: req.body.agentDetails.userId });

      if (req.body.enteredBy) {
        insertData.csrId = userId;
        insertData.userId = userData[0]._id.toString();
      } else {
        insertData.csrId = userId;
        insertData.enteredBy = userId;
        insertData.userId = userData[0]._id.toString();
      }

      const csrData = await userModel.find({ _id: req.user.user.userId });

      message = {
        senderId: req.user.user.userId,
        receiverId: req.body.agentDetails.userId,
        message: `${csrData[0].firstName} ${csrData[0].lastName} has added a new property`,
        notifyType: "Property",
      };
    }

    // Handle the case where latitude and longitude might be missing
    if (!insertData.address.latitude) {
      delete insertData.address.latitude;
    }
    if (!insertData.address.longitude) {
      delete insertData.address.longitude;
    }

    // Validate the data against the Joi schema
    const result = await residentialSchema.validateAsync(insertData);
    const residential = new residentialModel(result);  // Create the new residential model instance

    // Save the residential property to the database
    await residential.save();
    console.log("Residential Property Created:", residential);


    let message1 = {
      senderId: userId,
      receiverId: 0,
      message: "A new property added ! Please checkout",
      notifyType: "Customer",
    };
    // Save the notification for the property addition
    const notify = new notifyModel(message);
    const notification1=new notifyModel(message1);
    await notify.save();
    await notification1.save();
    // Send a success response
    res.send({
      message: "Residential Property Added Successfully",
      success: true,
    });
  } catch (error) {
    // Log detailed error information
    if (error.isJoi) {
      console.error("Validation Error:", error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }

    console.error("Error Details:", error);

    // Handle any other errors and send a response
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

    const page=req.query.page
    const limit=req.query.limit

    // Log userId for debugging
    console.log("User ID:", userId);

    // Query the residentialModel collection to find properties with the specified userId
let properties=[]
    if(page)
    {
         let offset=(page-1)*limit

           properties = await residentialModel
         .find({ userId }).skip(offset).limit(limit)
         .sort({ status: 1, updatedAt: -1 })
         .exec();
    }
    else
    {
        properties = await residentialModel
      .find({ userId })
      .sort({ status: 1, updatedAt: -1 })
      .exec();
    }
     

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
    
    const page=req.query.page
    const limit=req.query.limit


    // Query the residentialModel collection to find all residential properties
    let properties;


if(page)
{
  let offset=(page-1)*limit;

  if (role === 3) {
    properties = await residentialModel
      .find({ status: 0 }).skip(offset).limit(limit)
      .sort({ updatedAt: -1 });
  } else {
    properties = await residentialModel
      .find().skip(offset).limit(limit)
      .sort({ status: 1, updatedAt: -1 });
  }
}
else
{
    if (role === 3) {
      properties = await residentialModel
        .find({ status: 0 })
        .sort({ updatedAt: -1 });
    } else {
      properties = await residentialModel
        .find()
        .sort({ status: 1, updatedAt: -1 });
    }
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
