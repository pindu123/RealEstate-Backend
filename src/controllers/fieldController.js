// Import necessary modules
const fieldModel = require("../models/fieldModel");
const propertyRatingModel = require("../models/propertyRatingModel");
const wishlistModel = require("../models/wishlistModel");
const { fieldValidationSchema } = require("../helpers/agricultureValidation");
const userModel = require("../models/userModel");
const notifyModel = require("../models/notificationModel");
const Counter = require("../models/counterModel");


// Get all fields which are added by that user
const getFields = async (req, res) => {
  try {
    const userId = req.user.user.userId;

    console.log(userId)
    const fields = await fieldModel
      .find({ userId: userId })
      .sort({ status: 1, updatedAt: -1 });

 let resultData=[]

    for (let field of fields) {
      const id = field._id

      const data = await auctionModel.find({ propertyId: id })

      const reservation = await propertyReservation.find({ "propId": id,reservationStatus:true,userId:userId })

      field.auctionData = data;


      if (reservation.length > 0) {
        field.reservedBy = reservation[0].userId
      }

      console.log(field.reservedBy)

      if (data.length === 0) {
        field.auctionStatus = "InActive";

      }
      else {

         for(let auction of data)
          {
            if(auction.auctionStatus==="active")
            {
               field.auctionStatus = auction.auctionStatus;
               field.auctionType=auction.auctionType
              break;           
            }
            else
            {
              field.auctionStatus = auction.auctionStatus;
              field.auctionType=auction.auctionType


            }
             
          } 
 
        console.log( field.auctionStatus,data)
        const buyerData = data[0].buyers
        if (buyerData.length > 0) {
          buyerData.sort((a, b) => b.bidAmount - a.bidAmount)
        }
         field.auctionData.buyers = buyerData
      }
resultData.push({...field._doc,"reservedBy":field.reservedBy,"auctionStatus":field.auctionStatus,"auctionData":field.auctionData,"auctionType":field.auctionType})
      console.log("fields",field.reservedBy)
    }


    if (fields.length === 0) {
      return res.status(200).json({ data: [] });
    }
    res.status(200).send({ data: resultData, count: fields.length });
  } catch (error) {
    res.status(500).json({ message: "Error fetching fields", error });
  }
};

// Create a new field
// const insertFieldDetails = async (req, res) => {
//   try {
//     const { userId, role } = req.user.user;
//     let fieldDetailsData;
//   req.body.amenities.electricity=String(req.body.amenities.electricity)

//     let message={}
//      if (role === 1) {
//       const csrData = await userModel.find({ _id: userId });
//       if (req.body.enteredBy) {
//         fieldDetailsData = {
//           userId,
//           csrId: csrData[0].assignedCsr,
//           role,
//           ...req.body,

//         };
//       } else {
//         const csrData = await userModel.find({ _id: userId });

//         fieldDetailsData = {
//           userId,
//           role,
//           enteredBy: userId,
//           csrId: csrData[0].assignedCsr,
//           ...req.body,

//          };
//       }  

// message={
//   "senderId":req.user.user.userId,
//   "receiverId":csrData[0].assignedCsr,
//      "message":`${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
//      "notifyType":"Property"
// }

//     }
//     if (role === 5) {
//       const userData = await userModel.find({
//         email: req.body.agentDetails.userId,
//       });

//       if (req.body.enteredBy) {
//         fieldDetailsData = {
//           csrId: userId,

//           role,
//           ...req.body,

//           userId: userData[0]._id.toString(),
//         };
//       } else {
//         fieldDetailsData = {
//           csrId: userId,
//           role,
//           enteredBy: userId,
//           ...req.body,
//           userId: userData[0]._id.toString(),

//         };
//       }
//       const csrData = await userModel.find({ _id: req.user.user.userId });

//       message={
//         "senderId":req.user.user.userId,
//         "receiverId":req.body.agentDetails.userId,
//         "message":`${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
//         "notifyType":"Property"

//       }
//     }

//     if (fieldDetailsData.address.latitude === '' || fieldDetailsData.address.latitude === undefined) {
//       delete fieldDetailsData.address.latitude;
//     }

//     if (fieldDetailsData.address.longitude === '' || fieldDetailsData.address.longitude === undefined) {
//       delete fieldDetailsData.address.longitude;
//     }

//     const validatedData = await fieldValidationSchema.validateAsync(
//       fieldDetailsData,
//       { abortEarly: false }
//     );
//     const fieldDetails = new fieldModel(validatedData);
//     await fieldDetails.save();

// const notify=new notifyModel(message)
// await notify.save()

//     res
//       .status(201)
//       .json({ message: "field details added successfully", success: true ,"landDetails":validatedData});
//   } catch (error) {
//     // Handle validation errors

//     if (error.isJoi) {
//       return res.status(422).json({
//         message: "Validation failed",
//         details: error.details.map((err) => err.message), // Provide detailed Joi validation errors
//         success: false,
//       });
//     }

//     // Handle server errors
//     res.status(500).json({ message: "Error inserting field details", error });
//   }
// };

const insertFieldDetail = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    req.body.amenities.electricity = String(req.body.amenities.electricity); // Ensure electricity is a string

    let fieldDetailsData;
    let message = {};

    // Fetch user data once
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(409).json({ message: "User not found" });
    }
    console.log(userData, '  user data')
    console.log(userData.assignedCsr, ' csr data')
    if (role === 1) { // CSR role
      const csrId = userData.assignedCsr;

      const csrData = await userModel.findById(csrId);
      console.log(csrData[0]);
      if (!csrData) {
        return res.status(409).json({ message: "CSR not found" });
      }

      if (req.body.enteredBy) {
        fieldDetailsData = {
          userId,
          csrId: csrData._id.toString(),
          role,
          ...req.body,
        };
      } else {
        fieldDetailsData = {
          userId,
          role,
          enteredBy: userId,
          csrId: csrData._id.toString(),
          ...req.body,
        };
      }

      message = {
        senderId: userId,
        receiverId: csrData._id.toString(),
        message: `${csrData.firstName} ${csrData.lastName} has added a new property`,
        notifyType: "Property",
      };
    }

    if (role === 5) { // Agent role
      const agentData = await userModel.findOne({ email: req.body.agentDetails.userId });
      if (!agentData) {
        return res.status(404).json({ message: "Agent not found" });
      }

      if (req.body.enteredBy) {
        fieldDetailsData = {
          csrId: userId,
          role,
          userId: agentData._id.toString(),
          ...req.body,
        };
      } else {
        fieldDetailsData = {
          csrId: userId,
          role,
          enteredBy: userId,
          userId: agentData._id.toString(),
          ...req.body,
        };
      }

      const csrData = await userModel.findById(userId);
      if (!csrData) {
        return res.status(409).json({ message: "CSR not found" });
      }

      message = {
        senderId: userId,
        receiverId: req.body.agentDetails.userId.toString(),
        message: `${csrData.firstName} ${csrData.lastName} has added a new property`,
        notifyType: "Property",
      };
    }

    // Handle address latitude and longitude if they are empty or undefined
    if (!fieldDetailsData.address.latitude) {
      delete fieldDetailsData.address.latitude;
    }

    if (!fieldDetailsData.address.longitude) {
      delete fieldDetailsData.address.longitude;
    }

    // Validate the data using Joi schema
    const validatedData = await fieldValidationSchema.validateAsync(fieldDetailsData, { abortEarly: false });
    console.log("After validation:", validatedData);

    // Save the field details to the database
    const fieldDetails = new fieldModel(validatedData);
    await fieldDetails.save();
    console.log("Field details added successfully");

    // Create and save the notification

    const notification = new notifyModel(message);
    await notification.save();

    // Respond to the client
    res.status(201).json({
      message: "Field details added successfully",
      success: true,
      landDetails: validatedData,
    });
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
const mongoose = require("mongoose");


/**
 * Utility function to generate a unique property ID for agricultural land.
 * Prefix: "PA"
 */
const generatePropertyId = async (typePrefix, model) => {
  const lastEntry = await model.findOne().sort({ _id: -1 }).select('propertyId');
  let lastId = 0;
  if (lastEntry && lastEntry.propertyId) {
    lastId = parseInt(lastEntry.propertyId.slice(2), 10); // Extract numeric part after "PA"
  }
  return `${typePrefix}${lastId + 1}`;
};

const translate = require('@iamtraction/google-translate'); // Import translation library
const auctionModel = require("../models/auctionModel");
const propertyReservation = require("../models/propertyReservation");
const { AgentpushNotification } = require("./pushNotifyController");

const insertFieldDetails = async (req, res) => {
  try {
    console.log(req.body, ' fields');
    const { userId, role } = req.user.user;
    req.body.amenities.electricity = String(req.body.amenities.electricity);

    const propertyId = await generatePropertyId("PA", fieldModel);
    req.body.propertyId = propertyId;

    let fieldDetailsData;
    let message = {};

    // Fetch user data
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(409).json({ message: "User not found" });
    }

    if (role === 1) {
      // CSR role
      const csrId = userData.assignedCsr;
      const csrData = await userModel.findById(csrId);
      if (!csrData) {
        return res.status(404).json({ message: "Assigned CSR not found" });
      }

      fieldDetailsData = {
        userId,
        csrId: csrData._id.toString(),
        role,
        ...req.body,
        enteredBy: req.body.enteredBy || userId,
      };

      message = {
        senderId: userId,
        receiverId: csrData._id.toString(),
        message: `${userData.firstName} ${userData.lastName} has added a new Agriculutral property`,
        notifyType: "Property",
      };
    } else if (role === 5) {
      // Agent role
      fieldDetailsData = {
        userId,
        role,
        ...req.body,
        enteredBy: req.body.enteredBy || userId,
      };

      message = {
        senderId: userId,
        receiverId: "Admin",
        message: `${userData.firstName} ${userData.lastName} has added a new Agriculutral property`,
        notifyType: "Property",
      };
  AgentpushNotification("New Property!",`A Agriculutral property ${req.body.landDetails.title} is added`,3)
      title, message, role
    } else {
      return res.status(403).json({ message: "Unauthorized role for this action" });
    }

    // Remove translated fields (those with 'Te' suffix)
    const sanitizedData = {};
    Object.keys(fieldDetailsData).forEach((key) => {
      if (!key.endsWith("Te")) {
        sanitizedData[key] = fieldDetailsData[key];
      }
    });

    // Translate all string fields and append Telugu versions
    for (const [key, value] of Object.entries(sanitizedData)) {
      if (typeof value === "string" && /^[a-zA-Z\s]+$/.test(value)) {
        const { text: translatedValue } = await translate(value, { to: "te" });
        sanitizedData[`${key}Te`] = translatedValue;
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // Recursively handle nested objects
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (typeof nestedValue === "string" && /^[a-zA-Z\s]+$/.test(nestedValue)) {
            const { text: translatedValue } = await translate(nestedValue, { to: "te" });
            sanitizedData[key][`${nestedKey}Te`] = translatedValue;
          }
        }
      }
    }

    // Validate and save field details
    const validatedData = await fieldValidationSchema.validateAsync(sanitizedData, { abortEarly: false });
    const fieldDetails = new fieldModel(validatedData);
    await fieldDetails.save();
    let message1 = {
      senderId: userId,
      receiverId: 0,
      message: "A new property added ! Please checkout",
      details: `Property type : Agriculutral of location ${req.body.address.district}`,
      notifyType: "Customer",
    }

    console.log("Notification Object:", message);

    const notification1 = new notifyModel(message1);

    await notification1.save();
    // Validate and save the notification object
    const notification = new notifyModel(message);
    await notification.save();

    res.status(201).json({
      message: "Field details added successfully",
      success: true,
      landDetails: validatedData,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(422).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message),
        success: false,
      });
    }
    console.error("Error inserting field details:", error);
    res.status(500).json({ message: "Error inserting field details", error });
  }
};


const insertFieldDetailsInUse = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    req.body.amenities.electricity = String(req.body.amenities.electricity);

    // Generate a unique property ID for agricultural land
    const propertyId = await generatePropertyId("PA", fieldModel);
    req.body.propertyId = propertyId;

    let fieldDetailsData;
    let message = {};

    // Fetch user data
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role === 1) { // CSR role
      const csrId = userData.assignedCsr;
      const csrData = await userModel.findById(csrId);
      if (!csrData) {
        return res.status(404).json({ message: "Assigned CSR not found" });
      }

      fieldDetailsData = {
        userId,
        csrId: csrData._id.toString(),
        role,
        ...req.body,
        enteredBy: req.body.enteredBy || userId,
      };

      message = {
        senderId: userId,
        receiverId: csrData._id.toString(),
        message: `${userData.firstName} ${userData.lastName} has added a new property`,
        notifyType: "Property",
      };
    } else if (role === 5) { // Agent role
      fieldDetailsData = {
        userId,
        role,
        ...req.body,
        enteredBy: req.body.enteredBy || userId,
      };

      message = {
        senderId: userId,
        receiverId: "Admin", // Example for agent notifying admin
        message: `${userData.firstName} ${userData.lastName} has added a new property`,
        notifyType: "Property",
      };
    } else {
      return res.status(403).json({ message: "Unauthorized role for this action" });
    }

    // Clean up optional latitude/longitude if empty
    if (!fieldDetailsData.address.latitude) {
      delete fieldDetailsData.address.latitude;
    }
    if (!fieldDetailsData.address.longitude) {
      delete fieldDetailsData.address.longitude;
    }

    // Validate and save field details
    const validatedData = await fieldValidationSchema.validateAsync(fieldDetailsData, { abortEarly: false });
    const fieldDetails = new fieldModel(validatedData);
    await fieldDetails.save();

    // Validate and save the notification object

    let message1 = {
      senderId: userId,
      receiverId: 0,
      message: "A new property added ! Please checkout",
      notifyType: "Customer"
    }

    console.log("Notification Object:", message);
    const notification = new notifyModel(message);
    const notification1 = new notifyModel(message1);
    await notification.save();
    await notification1.save();

    res.status(201).json({
      message: "Field details added successfully",
      success: true,
      landDetails: validatedData,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(422).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message),
        success: false,
      });
    }
    console.error("Error inserting field details:", error);
    res.status(500).json({ message: "Error inserting field details", error });
  }
};

/**
 * Helper function to generate unique property IDs.
 */
// const generatePropertyId = async (typePrefix, model) => {
//   const lastEntry = await model.findOne().sort({ _id: -1 }).select("propertyId");
//   let lastId = 0;
//   if (lastEntry && lastEntry.propertyId) {
//     lastId = parseInt(lastEntry.propertyId.slice(2), 10); // Extract numeric part after the prefix
//   }
//   return `${typePrefix}${lastId + 1}`;
// };


const getAllFields = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const role = req.user.user.role;

    const {page,limit}=req.query
    // Fetch all fields
    let fields;
    
    if(page&&limit)
    {
      let offset=(page-1)*limit

    if (role === 3) {
      fields = await fieldModel.find({ status: 0 }).sort({ updatedAt: -1 }).skip(offset).limit(limit)
    } else {
      fields = await fieldModel.find().sort({ status: 1, updatedAt: -1 }).skip(offset).limit(limit)
    }
    }
    else
    {

      if (role === 3) {
        fields = await fieldModel.find({ status: 0 }).sort({ updatedAt: -1 });
      } else {
        fields = await fieldModel.find().sort({ status: 1, updatedAt: -1 });
      }
    }  
 
    if (fields.length === 0) {
      return res.status(200).json({ data: [] });
    }

     const propertyIds = fields.map((field) => field._id.toString());

     const statuses = await wishlistModel
      .find({ userId: userId, propertyId: { $in: propertyIds } })
      .select("propertyId status");
    const ratingstatuses = await propertyRatingModel
      .find({ userId: userId, propertyId: { $in: propertyIds } })
      .select("propertyId status");



     const statusMap = statuses.reduce((map, item) => {
      map[item.propertyId.toString()] = item.status;
      return map;
    }, {});

    const ratingstatusMap = ratingstatuses.reduce((map, item) => {
      map[item.propertyId.toString()] = item.status;
      return map;
    }, {});
     const updatedFields = fields.map((field) => {
      const fieldObj = field.toObject(); // Convert Mongoose document to plain object
      fieldObj.wishStatus = statusMap[field._id.toString()] || 0; // Default to 0 if not found
      fieldObj.ratingStatus = ratingstatusMap[field._id.toString()] || 0; // Default to 0 if not found
      return fieldObj;
    });


    for (let fields of updatedFields) {
      const id = fields._id

      const data = await auctionModel.find({ propertyId: id })

      const reservation = await propertyReservation.find({ "propId": id ,reservationStatus:true,userId:userId})

      fields.auctionData = data;


      if (reservation.length > 0) {
        fields.reservedBy = reservation[0].userId
      }

      // if (data.length === 0) {
      //   fields.auctionStatus = "InActive";

      // }
      // else {


      //   console.log(data[0].buyers)
      //   const buyerData = data[0].buyers
      //   if (buyerData.length > 0) {
      //     buyerData.sort((a, b) => b.bidAmount - a.bidAmount)
      //   }
      //   fields.auctionStatus = data[0].auctionStatus;
      //   fields.auctionData.buyers = buyerData
      // }

      // console.log("data.lengtgh",data.length,id)
      if (data.length === 0) {
        fields.auctionStatus = "InActive";

      }
      else {
          for(let auction of data)
          {
            if(auction.auctionStatus==="active")
            {
               fields.auctionStatus = auction.auctionStatus;
               fields.auctionType=auction.auctionType
              break;           
            }
            else
            {
              fields.auctionStatus = auction.auctionStatus;
              fields.auctionType=auction.auctionType
            }
             
          } 
 
        console.log( fields.auctionStatus,data)
        const buyerData = data[0].buyers
        if (buyerData.length > 0) {
          buyerData.sort((a, b) => b.bidAmount - a.bidAmount)
        }
         fields.auctionData.buyers = buyerData
      }
    }


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

    let propertyId = req.body.propertyId
    let data = { ...req.body }
    const updateFileds = await fieldModel.findByIdAndUpdate(propertyId, data, {
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
