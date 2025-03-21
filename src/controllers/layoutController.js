const layoutModel = require("../models/layoutModel");
const propertyRatingModel = require("../models/propertyRatingModel");
const wishlistModel = require("../models/wishlistModel");
const userModel = require("../models/userModel");
const {
  layoutValidationSchema,
  updatePlotsValidationSchema,
} = require("../helpers/layoutValidation");
const notifyModel = require("../models/notificationModel");

const propertyReservation = require("../models/propertyReservation");


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

const translate = require("@iamtraction/google-translate");
const auctionModel = require("../models/auctionModel");
const { AgentpushNotification } = require("./pushNotifyController");

const insertLayoutDetails = async (req, res) => {
  try {
    console.log("Start: insertLayoutDetails function");

    const { userId, role } = req.user.user;
    console.log("Extracted user info:", { userId, role });

    req.body.amenities.electricityFacility = String(req.body.amenities.electricityFacility);
    console.log("Updated amenities.electricityFacility:", req.body.amenities.electricityFacility);

    // Generate a unique property ID for layout properties
    console.log("Generating unique property ID...");
    const propertyId = await generatePropertyId("PL", layoutModel);
    req.body.propertyId = propertyId;
    console.log("Generated propertyId:", propertyId);

    let layoutDetailsData;
    let message = {};

    if (role === 1) {
      console.log("Processing as CSR role...");
      const csrData = await userModel.findById(userId);
      if (!csrData) {
        console.error("CSR not found for userId:", userId);
        return res.status(404).json({ message: "CSR not found" });
      }

      layoutDetailsData = {
        userId,
        role,
        enteredBy: req.body.enteredBy || userId,
        ...req.body,
        csrId: csrData.assignedCsr,
      };
      console.log("CSR layoutDetailsData created:", layoutDetailsData);

      message = {
        senderId: userId,
        receiverId: csrData.assignedCsr,
        message: `${csrData.firstName} ${csrData.lastName} has added a new Layout property`,
        notifyType: "Property",
      };
    } else if (role === 5) {
      console.log("Processing as Agent role...");
      const agentData = await userModel.findOne({ email: req.body.agentDetails.userId });
      if (!agentData) {
        console.error("Agent not found for email:", req.body.agentDetails.userId);
        return res.status(404).json({ message: "Agent not found" });
      }

      layoutDetailsData = {
        csrId: userId,
        role,
        enteredBy: req.body.enteredBy || userId,
        ...req.body,
        userId: agentData._id.toString(),
      };
      console.log("Agent layoutDetailsData created:", layoutDetailsData);

      const csrData = await userModel.findById(userId);
      message = {
        senderId: userId,
        receiverId: req.body.agentDetails.userId,
        message: `${csrData.firstName} ${csrData.lastName} has added a new property`,
        notifyType: "Property",
      };
    } else {
      console.error("Unauthorized role:", role);
      return res.status(403).json({ message: "Unauthorized role for this action" });
    }

    // Clean up optional latitude/longitude if empty
    if (!layoutDetailsData.layoutDetails.address.latitude) {
      console.log("Latitude is empty. Removing...");
      delete layoutDetailsData.layoutDetails.address.latitude;
    }
    if (!layoutDetailsData.layoutDetails.address.longitude) {
      console.log("Longitude is empty. Removing...");
      delete layoutDetailsData.layoutDetails.address.longitude;
    }

    // Generate plot IDs and ensure plots align with the count
    // const { plotCount, plots } = layoutDetailsData.layoutDetails;
    // if (plots) {
    //   if (plots.length !== plotCount) {
    //     console.error(`Mismatch between plotCount (${plotCount}) and plots provided (${plots.length}).`);
    //     return res.status(400).json({
    //       message: `The number of plots provided (${plots.length}) does not match the plotCount (${plotCount}).`,
    //     });
    //   }
    //   console.log("Plots verified successfully:", plots);
    // }

    // Validate the request body against the Joi schema
    console.log("Validating layoutDetailsData...");
    const validatedData = await layoutValidationSchema.validateAsync(layoutDetailsData, { abortEarly: false });
    console.log("Validation successful:", validatedData);

    // Translate all string fields and append Telugu versions
    console.log("Translating string fields to Telugu...");
    for (const [key, value] of Object.entries(validatedData)) {
      if (typeof value === "string" && /^[a-zA-Z\s]+$/.test(value)) {
        const { text: translatedValue } = await translate(value, { to: "te" });
        validatedData[`${key}Te`] = translatedValue;
      } else if (typeof value === "object" && !Array.isArray(value)) {
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (typeof nestedValue === "string" && /^[a-zA-Z\s]+$/.test(nestedValue)) {
            const { text: translatedValue } = await translate(nestedValue, { to: "te" });
            validatedData[key][`${nestedKey}Te`] = translatedValue;
          }
        }
      }
    }
    console.log("Translation complete.");

    // Save layout details with translations
    console.log("Saving layout details...");
    const layoutDetails = new layoutModel(validatedData);
    await layoutDetails.save();
    console.log("Layout details saved successfully.");

    // Save notifications
    console.log("Saving notifications...");
    const message1 = {
      senderId: userId,
      receiverId: 0,
      message: "A new property added! Please checkout",
      details: `Property type: Layout of location ${req.body.layoutDetails.address.district}`,
      notifyType: "Customer",
    };
    const notification = new notifyModel(message);
    const notification1 = new notifyModel(message1);
    await notification.save();
    await notification1.save();
    console.log("Notifications saved successfully.");

    AgentpushNotification("New Property!",`A Layout ${req.body.layoutDetails.layoutTitle} is added`,3)


    res.status(201).json({
      message: "Layout details added successfully",
      success: true,
      propertyDetails: validatedData,
    });
  } catch (error) {
    console.error("Error occurred:", error);
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


// /**
//  * API to insert layout details.
//  */
// const translate = require('@iamtraction/google-translate'); // Import translation library




// const insertLayoutDetails = async (req, res) => {
//   try {
//     const { userId, role } = req.user.user;

//     req.body.amenities.electricityFacility = String(req.body.amenities.electricityFacility);

//     // Generate a unique property ID for layout properties
//     const propertyId = await generatePropertyId("PL", layoutModel);
//     req.body.propertyId = propertyId;

//     let layoutDetailsData;
//     let message = {};

//     if (role === 1) {
//       // CSR role
//       const csrData = await userModel.findById(userId);
//       if (!csrData) {
//         return res.status(404).json({ message: "CSR not found" });
//       }

//       layoutDetailsData = {
//         userId,
//         role,
//         enteredBy: req.body.enteredBy || userId,
//         ...req.body,
//         csrId: csrData.assignedCsr,
//       };

//       message = {
//         senderId: userId,
//         receiverId: csrData.assignedCsr,
//         message: `${csrData.firstName} ${csrData.lastName} has added a new Layout property`,
//         notifyType: "Property",
//       };
//     } else if (role === 5) {
//       // Agent role
//       const agentData = await userModel.findOne({ email: req.body.agentDetails.userId });
//       if (!agentData) {
//         return res.status(404).json({ message: "Agent not found" });
//       }

//       layoutDetailsData = {
//         csrId: userId,
//         role,
//         enteredBy: req.body.enteredBy || userId,
//         ...req.body,
//         userId: agentData._id.toString(),
//       };

//       const csrData = await userModel.findById(userId);
//       message = {
//         senderId: userId,
//         receiverId: req.body.agentDetails.userId,
//         message: `${csrData.firstName} ${csrData.lastName} has added a new property`,
//         notifyType: "Property",
//       };
//     } else {
//       return res.status(403).json({ message: "Unauthorized role for this action" });
//     }

//     // Clean up optional latitude/longitude if empty
//     if (!layoutDetailsData.layoutDetails.address.latitude) {
//       delete layoutDetailsData.layoutDetails.address.latitude;
//     }
//     if (!layoutDetailsData.layoutDetails.address.longitude) {
//       delete layoutDetailsData.layoutDetails.address.longitude;
//     }

//     // Validate the request body against the Joi schema
//     const validatedData = await layoutValidationSchema.validateAsync(layoutDetailsData, { abortEarly: false });

//     // Translate all string fields and append Telugu versions
//     for (const [key, value] of Object.entries(validatedData)) {
//       if (typeof value === "string" && /^[a-zA-Z\s]+$/.test(value)) {
//         const { text: translatedValue } = await translate(value, { to: "te" });
//         validatedData[`${key}Te`] = translatedValue; // Add directly to validatedData
//       } else if (typeof value === "object" && !Array.isArray(value)) {
//         for (const [nestedKey, nestedValue] of Object.entries(value)) {
//           if (typeof nestedValue === "string" && /^[a-zA-Z\s]+$/.test(nestedValue)) {
//             const { text: translatedValue } = await translate(nestedValue, { to: "te" });
//             validatedData[key][`${nestedKey}Te`] = translatedValue; // Add directly to nested object in validatedData
//           }
//         }
//       }
//     }

//     // Save layout details with translations
//     const layoutDetails = new layoutModel(validatedData);
//     await layoutDetails.save();

//     // Save notifications
//     let message1 = {
//       senderId: userId,
//       receiverId: 0,
//       message: "A new property added! Please checkout",
//       details:`Property type : Layout of location ${req.body.layoutDetails.address.district}`,
//       notifyType: "Customer",
//     };
//     const notification = new notifyModel(message);
//     const notification1 = new notifyModel(message1);
//     await notification.save();
//     await notification1.save();

//     res.status(201).json({
//       message: "Layout details added successfully",
//       success: true,
//       propertyDetails: validatedData,
//     });
//   } catch (error) {
//     if (error.isJoi) {
//       return res.status(422).json({
//         message: "Validation failed",
//         details: error.details.map((err) => err.message),
//         success: false,
//       });
//     }
//     res.status(500).json({ message: "Error inserting layout details", error });
//   }
// };


// for saving without translation

// const insertLayoutDetails = async (req, res) => {
//   try {
//     const { userId, role } = req.user.user;

//     req.body.amenities.electricityFacility = String(
//       req.body.amenities.electricityFacility
//     );

//     // Generate a unique property ID for layout properties
//     const propertyId = await generatePropertyId("PL", layoutModel);
//     req.body.propertyId = propertyId;

//     let layoutDetailsData;
//     let message = {};

//     if (role === 1) {
//       // CSR role
//       const csrData = await userModel.findById(userId);
//       if (!csrData) {
//         return res.status(404).json({ message: "CSR not found" });
//       }

//       layoutDetailsData = {
//         userId,
//         role,
//         enteredBy: req.body.enteredBy || userId,
//         ...req.body,
//         csrId: csrData.assignedCsr,
//       };

//       message = {
//         senderId: userId,
//         receiverId: csrData.assignedCsr,
//         message: `${csrData.firstName} ${csrData.lastName} has added a new property`,
//         notifyType: "Property",
//       };
//     } else if (role === 5) {
//       // Agent role
//       const agentData = await userModel.findOne({
//         email: req.body.agentDetails.userId,
//       });
//       if (!agentData) {
//         return res.status(404).json({ message: "Agent not found" });
//       }

//       layoutDetailsData = {
//         csrId: userId,
//         role,
//         enteredBy: req.body.enteredBy || userId,
//         ...req.body,
//         userId: agentData._id.toString(),
//       };

//       const csrData = await userModel.findById(userId);
//       message = {
//         senderId: userId,
//         receiverId: req.body.agentDetails.userId,
//         message: `${csrData.firstName} ${csrData.lastName} has added a new property`,
//         notifyType: "Property",
//       };
//     } else {
//       return res
//         .status(403)
//         .json({ message: "Unauthorized role for this action" });
//     }

//     // Clean up optional latitude/longitude if empty
//     if (!layoutDetailsData.layoutDetails.address.latitude) {
//       delete layoutDetailsData.layoutDetails.address.latitude;
//     }
//     if (!layoutDetailsData.layoutDetails.address.longitude) {
//       delete layoutDetailsData.layoutDetails.address.longitude;
//     }

//     // Validate the request body against the Joi schema
//     const validatedData = await layoutValidationSchema.validateAsync(
//       layoutDetailsData,
//       { abortEarly: false }
//     );

//     // Save layout details
//     const layoutDetails = new layoutModel(validatedData);
//   // Remove translated fields (those with 'Te' suffix)
//   const sanitizedData = {};
//   Object.keys(layoutDetailsData).forEach((key) => {
//     if (!key.endsWith("Te")) {
//       sanitizedData[key] = layoutDetailsData[key];
//     }
//   });

//   // Translate all string fields and append Telugu versions
//   for (const [key, value] of Object.entries(sanitizedData)) {
//     if (typeof value === "string" && /^[a-zA-Z\s]+$/.test(value)) {
//       const { text: translatedValue } = await translate(value, { to: "te" });
//       sanitizedData[`${key}Te`] = translatedValue;
//     } else if (typeof value === "object" && !Array.isArray(value)) {
//       // Recursively handle nested objects
//       for (const [nestedKey, nestedValue] of Object.entries(value)) {
//         if (typeof nestedValue === "string" && /^[a-zA-Z\s]+$/.test(nestedValue)) {
//           const { text: translatedValue } = await translate(nestedValue, { to: "te" });
//           sanitizedData[key][`${nestedKey}Te`] = translatedValue;
//         }
//       }
//     }
//   }

//     await layoutDetails.save();

//     // Save notification

//     let message1 = {
//       senderId: userId,
//       receiverId: 0,
//       message: "A new property added ! Please checkout",
//       notifyType: "Customer",
//     };
//     const notification = new notifyModel(message);

//     const notification1 = new notifyModel(message1);
//     await notification.save();
//     await notification1.save();
//     res.status(201).json({
//       message: "Layout details added successfully",
//       success: true,
//       propertyDetails: validatedData,
//     });
//   } catch (error) {
//     if (error.isJoi) {
//       return res.status(422).json({
//         message: "Validation failed",
//         details: error.details.map((err) => err.message),
//         success: false,
//       });
//     }
//     res.status(500).json({ message: "Error inserting layout details", error });
//   }
// };

module.exports = { insertLayoutDetails };

// Function to get all layout properties added by that user
const getLayouts = async (req, res) => {
  try {
    const userId = req.user.user.userId;


    const page = req.query.page
    const limit = req.query.limit
    // if(page)
    // {

    // }
    const layouts = await layoutModel
      .find({ userId: userId })
      .sort({ status: 1, updatedAt: -1 });



    let resultData = []

    for (let res of layouts) {
      const id = res._id
      const data = await auctionModel.find({ propertyId: id })

      res.auctionData = data

      const reservation = await propertyReservation.find({ "propId": id ,reservationStatus:true,"userId":userId})


      if (reservation.length > 0) {
        res.reservedBy = reservation[0].userId
      }
      if (data.length === 0) {
        res.auctionStatus = "InActive";

      }
      else {

        for (let auction of data) {
          res.auctionType=auction.auctionType
          if (auction.auctionStatus === "active") {
            res.auctionStatus = auction.auctionStatus;
            break;
          }
          else {
            res.auctionStatus = auction.auctionStatus;

          }

        }
        const buyerData = data[0].buyers
        if (buyerData.length > 0) {
          buyerData.sort((a, b) => b.bidAmount - a.bidAmount)
        }
        res.auctionData.buyers = buyerData
      }

      resultData.push({
        ...res._doc,
        "reservedBy": res.reservedBy,
        "auctionStatus": res.auctionStatus,
        "auctionData": res.auctionData
      })
    }





    if (layouts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(resultData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all layouts

const getAllLayouts = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const role = req.user.user.role;

    const page = req.query.page
    const limit = req.query.limit
    let layouts;

    // Fetch all layouts

    if (page) {
      let offset = (page - 1) * limit
      if (role === 3) {
        layouts = await layoutModel.find({ status: 0 }).skip(offset).limit(limit).sort({ updatedAt: -1 });
      } else {
        layouts = await layoutModel.find().skip(offset).limit(limit).sort({ status: 1, updatedAt: -1 });
      }
    }
    else {
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



    for (let res of updatedLayouts) {
      const id = res._id
      const data = await auctionModel.find({ propertyId: id })

      res.auctionData = data

      const reservation = await propertyReservation.find({ "propId": id,"reservationStatus":true,"userId":userId })


      if (reservation.length > 0) {
        res.reservedBy = reservation[0].userId
      }
      if (data.length === 0) {
        res.auctionStatus = "InActive";

      }
      else {

        for(let auction of data)
        {
          res.auctionType=auction.auctionType
          res.auctionStatus=auction.auctionStatus
          if(auction.auctionStatus==="active" || auction.auctionStatus==="Active")
          {
            break;
          }
        }

         const buyerData = data[0].buyers
        if (buyerData.length > 0) {
          buyerData.sort((a, b) => b.bidAmount - a.bidAmount)
        }
        res.auctionData.buyers = buyerData
      }
    }



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
