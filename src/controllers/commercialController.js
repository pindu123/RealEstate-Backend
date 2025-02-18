// controllers/commercialController.js
const Commercial = require("../models/commercialModel");
const wishlistModel = require("../models/wishlistModel");
const propertyRatingModel = require("../models/propertyRatingModel");
const { commercialSchema } = require("../helpers/commercialValidation");
const userModel = require("../models/userModel");
const commercialModel = require("../models/commercialModel");
const notifyModel = require("../models/notificationModel");
const propertyReservation = require("../models/propertyReservation");

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
    console.log(userId, role)
    let createcomm;

    req.body.propertyDetails.amenities.isElectricity = String(req.body.propertyDetails.amenities.isElectricity);
    req.body.propertyDetails.landDetails.address.latitude = String(req.body.propertyDetails.landDetails.address.latitude);
    req.body.propertyDetails.landDetails.address.longitude = String(req.body.propertyDetails.landDetails.address.longitude);
    let message = {}
    if (role === 1) {
      if (req.body.enteredBy) {
        const csrData = await userModel.find({ _id: userId }, { password: 0 });

        createcomm = {
          userId,
          ...req.body,
          csrId: csrData[0].assignedCsr,
        };
      } else {
        console.log("abc");
        console.log("xyz", req.user.user.userId)
        const csrData = await userModel.find({ _id: req.user.user.userId }, { password: 0 });
        console.log("sddds")
        createcomm = {
          userId,
          enteredBy: userId,
          ...req.body,
          csrId: csrData[0].assignedCsr,
        };
      }
      const csrData = await userModel.find({ _id: userId }, { password: 0 });

      message = {
        "senderId": req.user.user.userId,
        "receiverId": csrData[0].assignedCsr,
        "message": `${csrData[0].firstName} ${csrData[0].lastName} Has Added New Property`,
        "notifyType": "Property"

      }
    }
    if (role === 5) {
      console.log(req.body);
      const userData = await userModel.find({
        email: req.body.propertyDetails.agentDetails.userId,
      }, { password: 0 });

      if (req.body.enteredBy) {
        createcomm = {
          csrId: userId,

          ...req.body,
          userId: userData[0]._id.toString(),
        };
      } else {
        console.log("abc");
        console.log("xyz", req.user.user.userId, userId)
        createcomm = {
          csrId: userId,
          enteredBy: userId,
          ...req.body,
          userId: userData[0]._id.toString(),
        };
      }
      console.log("agent", createcomm)

      const csrData = await userModel.find({ _id: req.user.user.userId }, { password: 0 });
      console.log("agent", req.body)
      message = {
        "senderId": req.user.user.userId,
        "receiverId": req.body.propertyDetails.agentDetails.userId,
        "message": `${csrData[0].firstName} ${csrData[0].lastName}  has added a new property`,
        "notifyType": "Property"

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


    const notify = new notifyModel(message)
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
const translate = require('@iamtraction/google-translate'); // Import translation library
const auctionModel = require("../models/auctionModel");
const { UserBindingInstance } = require("twilio/lib/rest/ipMessaging/v2/service/user/userBinding");


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
        message: `${userData.firstName} ${userData.lastName} has added a new receiverId property`,
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

    // Translate all string fields and append Telugu versions
    for (const [key, value] of Object.entries(commercialData)) {
      if (typeof value === "string" && /^[a-zA-Z\s]+$/.test(value)) {
        const { text: translatedValue } = await translate(value, { to: "te" });
        commercialData[`${key}Te`] = translatedValue; // Add directly to commercialData
      } else if (typeof value === "object" && !Array.isArray(value)) {
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (typeof nestedValue === "string" && /^[a-zA-Z\s]+$/.test(nestedValue)) {
            const { text: translatedValue } = await translate(nestedValue, { to: "te" });
            commercialData[key][`${nestedKey}Te`] = translatedValue; // Add directly to nested object in commercialData
          }
        }
      }
    }

    // Validate the data
    const validatedData = await commercialSchema.validateAsync(commercialData, { abortEarly: false });
    console.log(req.body)
    // Save the commercial details
    const commercialDetails = new commercialModel(validatedData);
    const commercialDataResponse = await commercialDetails.save();
    const pId = commercialDataResponse._id;
    // Save the notification
    let message1 = {
      senderId: userId,
      receiverId: 0,
      message: "A new Commercial property added! Please checkout",
      details: `Property type : Commercial of location ${req.body.propertyDetails.landDetails.address.district}`,
      propertyId: pId,
      notifyType: "Customer",
    };

    const notification = new notifyModel(message);
    const notification1 = new notifyModel(message1);
    await notification.save();
    await notification1.save();

    res.status(201).json({
      message: "Commercial property added successfully",
      success: true,
      propertyDetails: validatedData,
    });
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
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



const createCommercialInUse = async (req, res) => {
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
    const userData = await userModel.findById(userId, { password: 0 });
    if (!userData) {
      return res.status(409).json({ message: "User not found" });
    }

    if (role === 1) { // CSR role
      const csrId = userData.assignedCsr;
      const csrData = await userModel.findById(csrId, { password: 0 });
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

    let message1 = {
      senderId: userId,
      receiverId: 0,
      message: "A new property added ! Please checkout",
      notifyType: "Customer"
    }

    const notification = new notifyModel(message);
    const notification1 = new notifyModel(message1);
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
    let page = req.query.page
    let limit = req.query.limit
    let commercials = []
    if (page) {
      let offset = (page - 1) * limit
      commercials = await Commercial.find({ userId: userId }).sort({
        status: 1,
        updatedAt: -1,
      }).skip(offset).limit(limit);
    }
    else {
      commercials = await Commercial.find({ userId: userId }).sort({
        status: 1,
        updatedAt: -1,
      });
    }

    if (commercials.length === 0) {
      return res.status(200).json([]);
    }


    let resultData = []
    for (let comm of commercials) {
      const id = comm._id
      const data = await auctionModel.find({ propertyId: id })

      const reservation = await propertyReservation.find({ "propId": id,"reservationStatus":true,"userId":userId })

      if (reservation.length > 0) {
        comm.reservedBy = reservation[0].userId
      }

      comm.auctionData = data
      comm.auctionData = data
      if (data.length === 0) {
        comm.auctionStatus = "InActive";

      }
      else {


        for (let auction of data) {
          if (auction.auctionStatus === "active") {
            comm.auctionStatus = auction.auctionStatus;
            comm.auctionType=auction.auctionType
            break;
          }
          else {
            comm.auctionStatus = auction.auctionStatus;
            comm.auctionType=auction.auctionType
          }

        }

        const buyerData = data[0].buyers
        if (buyerData.length > 0) {
          buyerData.sort((a, b) => b.bidAmount - a.bidAmount)
        }
      }

      resultData.push({ ...comm._doc, "reservedBy": comm.reservedBy, "auctionStatus": comm.auctionStatus, "auctionData": comm.auctionData })
    }

    res.status(200).json(resultData);
  } catch (error) {

    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

// Function to get all commercial properties
const getAllCommercials = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const role = req.user.user.role;

    let page = req.query.page
    let limit = req.query.limit
    // Fetch all commercials
    let commercials;

    if (page) {
      let offset = (page - 1) * limit

      if (role === 3) {
        commercials = await Commercial.find({ status: 0 }).sort({
          updatedAt: -1,
        }).skip(offset).limit(limit);;
      } else {
        commercials = await Commercial.find().sort({
          status: 1,
          updatedAt: -1,
        }).skip(offset).limit(limit);
      }

    }
    else {
      if (role === 3) {
        commercials = await Commercial.find({ status: 0 }).sort({
          updatedAt: -1,
        })
      } else {
        commercials = await Commercial.find().sort({
          status: 1,
          updatedAt: -1,
        });
      }

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



    for (let comm of updatedCommercials) {
      const id = comm._id
      const data = await auctionModel.find({ propertyId: id })
      const reservation = await propertyReservation.find({ "propId": id ,"reservationStatus":true,"userId":userId})


      if (reservation.length > 0) {
        comm.reservedBy = reservation[0].userId
      }
      comm.auctionData = data
      if (data.length === 0) {
        comm.auctionStatus = "InActive";

      }
      else {
for(let auction of data)
{
  if(auction.auctionType==="active"|| auction.auctionType==="Active")
  {
    comm.auctionStatus=auction.auctionStatus
   comm.auctionType=auction.auctionType
  break;
  }
  else
  {
    comm.auctionType=auction.auctionType
    comm.auctionStatus=auction.auctionStatus

  }
}

         const buyerData = data[0].buyers
        if (buyerData.length > 0) {
          buyerData.sort((a, b) => b.bidAmount - a.bidAmount)
        }
        comm.auctionData.buyers = buyerData
      }
    }

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





const getProperties = async (req, res) => {
  try {
    const type = req.params.type
    const {page,limit}=req.query
 
    let commercialData
    if(page&&limit)
    {
      let offset=(page-1)*limit
        commercialData = await commercialModel.find().skip(offset).limit(limit)

    }
    else
    {
        commercialData = await commercialModel.find();

    }
 
 
    let resultData = []

    for (let comm of commercialData) {
      if (type === "sell" && comm.propertyDetails.landDetails.sell.landUsage.length > 0) {
        resultData.push(comm)
      }

      if (type === "lease" && comm.propertyDetails.landDetails.lease.landUsage.length > 0) {
        resultData.push(comm)
      }

      if (type === "rent" && comm.propertyDetails.landDetails.rent.landUsage.length > 0) {
        resultData.push(comm)
      }

    }

    if (resultData.length === 0) {
      res.status(400).json({ "message": "No Data Found" })
    }
    else
    {

    res.status(200).json({ "data": resultData })
    }

  }
  catch (error) {
    res.status(500).json({ "message": "Internal Server Error" })
  }
}

// Exporting the display function
module.exports = {
  createCommercial,
  getCommercials,
  getAllCommercials,
  editCommDetails,
  getProperties
};
