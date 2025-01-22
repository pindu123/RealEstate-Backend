const dealsSchema = require("../helpers/dealsValidation");
const customerModel = require("../models/customerModel");
const dealsModel = require("../models/propertyDealsModel");
const fieldModel = require("../models/fieldModel");
const commercialModel = require("../models/commercialModel");
const residentialModel = require("../models/residentialModel");
const layoutModel = require("../models/layoutModel");

const { ObjectId } = require("mongodb");

const userModel = require("../models/userModel");
const { customerSchema } = require("../helpers/customerValidation");
const notifyModel = require("../models/notificationModel");
const { registrationSchema } = require("../helpers/userValidation");
const getAllProperties = async (req, res) => {
  try {
    const fieldsData = await fieldModel.find({ status: 0 });
    const commercialData = await commercialModel.find({ status: 0 });
    const residentialData = await residentialModel.find({ status: 0 });
    const layoutData = await layoutModel.find({ status: 0 });

    // Extract the required fields from each collection

    const fields = fieldsData.map((item) => ({
      id: item._id,
      propertyName: item.landDetails.title,
      type: item.propertyType,
      agentId: item.userId,
    }));
    console.log(fields);
    const commercials = commercialData.map((item) => ({
      id: item._id,
      propertyName: item.propertyTitle,
      type: item.propertyType,
      agentId: item.userId,
    }));
    console.log(commercials);
    const residentials = residentialData.map((item) => ({
      id: item._id,
      propertyName: item.propertyDetails.apartmentName,
      type: item.propertyDetails.type,
      agentId: item.userId,
    }));

    const layouts = layoutData.map((item) => ({
      id: item._id,
      propertyName: item.layoutDetails.layoutTitle,
      type: item.propertyType,
      agentId: item.userId,
    }));
    console.log(layouts);
    // Combine all properties into one array
    const allProperties = [
      ...fields,
      ...commercials,
      ...residentials,
      ...layouts,
    ];

    // Return the combined data
    return res.status(200).json({ success: true, data: allProperties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



// const createDeal = async (req, res) => {
//   try {
//     console.log(req.body, 'deal body');
//     const userId = req.user.user.userId;
//     const role = req.user.user.role;
//     let csrId = 0;

//     if (!req.body.properties || req.body.properties.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "Properties are required.",
//       });
//     }

//     if (typeof req.body.interestIn === 'undefined') {
//       return res.status(400).json({
//         status: "error",
//         message: "Interest level is required.",
//       });
//     }

//     // Translate fields if necessary
//     if (req.body.comments) {
//       const translatedComments = await translate(req.body.comments, { to: "te" }); // Translate to Telugu
//       req.body.commentsTe = translatedComments.text; // Store translated comments with "Te" suffix
//     }
   

//     // Determine customer ID
//     let customerId = userId;
//     if (role !== 3) {
//       if (req.body.customerId) {
//         customerId = req.body.customerId;
//       } else if (!req.body.email) {
//         return res.status(400).json({
//           status: "error",
//           message: "Email is required for non-customer roles.",
//         });
//       } else {
//         const customer = await userModel.findOne({ email: req.body.email });
//         if (!customer) {
//           return res.status(409).json({
//             status: "error",
//             message: "Customer not found with the provided email.",
//           });
//         }
//         customerId = customer._id.toString();
//       }
//     }

//     // Process each property
//     for (let property of req.body.properties) {
//       const { propertyId, propertyName, propertyType, agentId } = property;

//       if (!propertyId || !propertyName || !propertyType) {
//         return res.status(400).json({
//           status: "error",
//           message: "Each property must include propertyId, propertyName, and propertyType.",
//         });
//       }

//       const existingDeal = await dealsModel.findOne({
//         propertyId,
//         customerId,
//       });

//       if (existingDeal) {
//         return res.status(400).json({
//           status: "error",
//           message: `Customer already made a deal for property ${propertyName}.`,
//         });
//       }

//       if (role === 5) {
//         csrId = userId;
//       } else if ([1, 3, 6].includes(role)) {
//         const agentData = await userModel.findById(agentId, { assignedCsr: 1 });
//         if (!agentData) {
//           return res.status(409).json({
//             status: "error",
//             message: "Agent not found.",
//           });
//         }
//         csrId = agentData.assignedCsr;

//         const message = {
//           senderId: userId,
//           receiverId: role === 3 ? agentId : customerId,
//           message: `Deal has been created for ${propertyName}`,
//           notifyType: "Deal",
//         };

//         const notify = new notifyModel(message);
//         await notify.save();
//       }

//       // Prepare deal details
//       const dealDetails = {
//         propertyId,
//         propertyName,
//         propertyType,
//         customerId,
//         interestIn: req.body.interestIn,
//         csrId,
//         agentId: agentId || null,
//         addedBy: userId,
//         addedByRole: role,
//         comments: req.body.comments || "",
//       };

//       // Save the deal
//       const validatedDeal = await dealsSchema.validateAsync(dealDetails);
//       const newDeal = new dealsModel(validatedDeal);
//       await newDeal.save();

//       // Increment propertyInterestedCount if interestIn is 1
//       if (req.body.interestIn === 1 || req.body.interestIn === "1") {
//         console.log('entered in updating propertyInterestedCount');
//         let updateCount;
//         switch (property.propertyType) {
//           case "Residential":
//             updateCount = residentialModel;
//             break;

//           case "Agricultural land":
//           case "Agricultural":
//             updateCount = fieldModel;
//             break;

//           case "Commercial":
//             updateCount = commercialModel;
//             break;

//           case "Layout":
//             updateCount = layoutModel;
//             break;

//           default:
//             throw new Error(`Unknown propertyType: ${property.propertyType}`);
//         }

//         // Ensure propertyId is in ObjectId format for comparison (in case it's passed as a string)
//         const propertyObjectId = new mongoose.Types.ObjectId(property.propertyId);
//         const existsPropertyInDeal = await dealsModel.find({'property.propertyId': propertyId});

//         // Check if the property already exists in the model
//         const existingProperty = await updateCount.findById({ _id: propertyId });
//         console.log(existingProperty, "existingProperty");

//         if (existsPropertyInDeal) {
//           console.log('propertyInterestedCount existing check');
//           // If the property exists, increment the propertyInterestedCount by 1 using $inc
//           await updateCount.findByIdAndUpdate(
//             { _id: propertyObjectId },
//             { $inc: { propertyInterestedCount: 1 } },
//             { new: true }  // This will return the updated document
//           );
//           console.log(`Property ${property.propertyId} already exists, incremented propertyInterestedCount.`);
//         } else {
//           // If the property does not exist, initialize the propertyInterestedCount to 1
//           await updateCount.create({
//             _id: propertyObjectId,
//             propertyType: property.propertyType,
//             propertyInterestedCount: 1,
//           });
//           console.log(`Property ${property.propertyId} does not exist, initialized propertyInterestedCount.`);
//         }
//       }
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Deals created successfully.",
//     });
//   } catch (error) {
//     if (error.isJoi) {
//       return res.status(422).json({
//         status: "error",
//         message: error.details.map((detail) => detail.message).join(", "),
//       });
//     }
//     console.error(error);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// };

const translate = require('@iamtraction/google-translate'); 

const createDeal = async (req, res) => {
  try {
    console.log(req.body, 'deal body');
    const userId = req.user.user.userId;
    const role = req.user.user.role;
    let csrId ;
     if(role===1||role===3){
      const agentDetail=await userModel.findById(userId);
      csrId=agentDetail.assignedCsr;
     }else if(role===5){
      csrId=userId;
     }else if(role===3){
        
     }
    if (!req.body.properties || req.body.properties.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Properties are required.",
      });
    }

    if (typeof req.body.interestIn === 'undefined') {
      return res.status(400).json({
        status: "error",
        message: "Interest level is required.",
      });
    }

    if (req.body.comments) {
      const translatedComments = await translate(req.body.comments, { to: "te" }); 
      req.body.commentsTe = translatedComments.text; 
      }

    // Process each property
    for (let property of req.body.properties) {
      const { propertyId, propertyName, propertyType, agentId } = property;

      if (propertyName) {
        const translatedPropertyName = await translate(propertyName, { to: "te" });
        property.propertyNameTe = translatedPropertyName.text; 
      }

      if (propertyType) {
        const translatedPropertyType = await translate(propertyType, { to: "te" });
        property.propertyTypeTe = translatedPropertyType.text; 
      }

      if (!propertyId || !propertyName || !propertyType) {
        return res.status(400).json({
          status: "error",
          message: "Each property must include propertyId, propertyName, and propertyType.",
        });
      }

    // Determine customer ID
    let customerId = userId;
    if (role !== 3) {
      if (req.body.customerId) {
        customerId = req.body.customerId;
      } else if (!req.body.email) {
        return res.status(400).json({
          status: "error",
          message: "Email is required for non-customer roles.",
        });
      } else {
        const customer = await userModel.findOne({ email: req.body.email });
        if (!customer) {
          return res.status(409).json({
            status: "error",
            message: "Customer not found with the provided email.",
          });
        }
        customerId = customer._id.toString();
      }
    }

      const existingDeal = await dealsModel.findOne({
        propertyId,
        customerId,
      });

      if (existingDeal) {
        return res.status(400).json({
          status: "error",
          message: `Customer already made a deal for property ${propertyName}.`,
        });
      }

      
      // Prepare deal details
      const dealDetails = {
        propertyId,
        propertyName,
        propertyNameTe: property.propertyNameTe, // Include translated propertyNameTe
        propertyType,
        propertyTypeTe: property.propertyTypeTe, // Include translated propertyTypeTe
        customerId,
        interestIn: req.body.interestIn,
        csrId,
        agentId: agentId || null,
        addedBy: userId,
        addedByRole: role,
        comments: req.body.comments || "",
        commentsTe: req.body.commentsTe || "", // Include translated commentsTe
      };

      // Save the deal
      const validatedDeal = await dealsSchema.validateAsync(dealDetails);
      const newDeal = new dealsModel(validatedDeal);
      await newDeal.save();

      // Increment propertyInterestedCount if interestIn is 1
      if (req.body.interestIn === 1 || req.body.interestIn === "1") {
        console.log('entered in updating propertyInterestedCount');
        let updateCount;
        switch (property.propertyType) {
          case "Residential":
            updateCount = residentialModel;
            break;

          case "Agricultural land":
          case "Agricultural":
            updateCount = fieldModel;
            break;

          case "Commercial":
            updateCount = commercialModel;
            break;

          case "Layout":
            updateCount = layoutModel;
            break;

          default:
            throw new Error(`Unknown propertyType: ${property.propertyType}`);
        }

        // Ensure propertyId is in ObjectId format for comparison (in case it's passed as a string)
        const propertyObjectId = new mongoose.Types.ObjectId(property.propertyId);
        const existsPropertyInDeal = await dealsModel.find({'property.propertyId': propertyId});

        // Check if the property already exists in the model
        const existingProperty = await updateCount.findById({ _id: propertyId });
        console.log(existingProperty, "existingProperty");

        if (existsPropertyInDeal) {
          console.log('propertyInterestedCount existing check');
          // If the property exists, increment the propertyInterestedCount by 1 using $inc
          await updateCount.findByIdAndUpdate(
            { _id: propertyObjectId },
            { $inc: { propertyInterestedCount: 1 } },
            { new: true }  // This will return the updated document
          );
          console.log(`Property ${property.propertyId} already exists, incremented propertyInterestedCount.`);
        } else {
          // If the property does not exist, initialize the propertyInterestedCount to 1
          await updateCount.create({
            _id: propertyObjectId,
            propertyType: property.propertyType,
            propertyInterestedCount: 1,
          });
          console.log(`Property ${property.propertyId} does not exist, initialized propertyInterestedCount.`);
          
          const message = {
            senderId: userId,
            receiverId: role === 3 ? agentId : customerId,
            message: `Deal has created`,
            details:`Deal for property ${propertyName} has created `,
            notifyType: "Deal",
          };
  
          const notify = new notifyModel(message);
          await notify.save();
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Deals created successfully.",
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};


const createDealInUse = async (req, res) => {
  // console.log("Reachde")
  try {
    console.log(req.body,'deal body')
    const userId = req.user.user.userId;
    const role = req.user.user.role;
    let csrId = 0;

    if (!req.body.properties || req.body.properties.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Properties are required.",
      });
    }

    if (typeof req.body.interestIn === 'undefined') {
      return res.status(400).json({
        status: "error",
        message: "Interest level is required.",
      });
    }

    // Determine customer ID
    let customerId = userId;
    if (role !== 3) {
      if (req.body.customerId) {
        customerId = req.body.customerId;
      } else if (!req.body.email) {
        return res.status(400).json({
          status: "error",
          message: "Email is required for non-customer roles.",
        });
      } else {
        const customer = await userModel.findOne({ email: req.body.email });
        if (!customer) {
          return res.status(409).json({
            status: "error",
            message: "Customer not found with the provided email.",
          });
        }
        customerId = customer._id.toString();
      }
    }

    // Process each property
    for (let property of req.body.properties) {
      const { propertyId, propertyName, propertyType, agentId } = property;

      if (!propertyId || !propertyName || !propertyType) {
        return res.status(400).json({
          status: "error",
          message: "Each property must include propertyId, propertyName, and propertyType.",
        });
      }

      const existingDeal = await dealsModel.findOne({
        propertyId,
        customerId,
      });

      if (existingDeal) {
        return res.status(400).json({
          status: "error",
          message: `Customer already made a deal for property ${propertyName}.`,
        });
      }

      if (role === 5) {
        csrId = userId;
      } else if ([1, 3, 6].includes(role)) {
        const agentData = await userModel.findById(agentId, { assignedCsr: 1 });
        if (!agentData) {
          return res.status(409).json({
            status: "error",
            message: "Agent not found.",
          });
        }
        csrId = agentData.assignedCsr;

        const message = {
          senderId: userId,
          receiverId: role === 3 ? agentId : customerId,
          message: `Deal has been created for ${propertyName}`,
          notifyType: "Deal",
        };

        const notify = new notifyModel(message);
        await notify.save();
      }

      // Prepare deal details
      const dealDetails = {
        propertyId,
        propertyName,
        propertyType,
        customerId,
        interestIn: req.body.interestIn,
        csrId,
        agentId: agentId || null,
        addedBy: userId,
        addedByRole: role,
        comments: req.body.comments || "",
      };

      // Save the deal
      const validatedDeal = await dealsSchema.validateAsync(dealDetails);
      const newDeal = new dealsModel(validatedDeal);
      await newDeal.save();

      // Increment propertyInterestedCount if interestIn is 1
      if (req.body.interestIn === 1 || req.body.interestIn === "1") {
        console.log('entered in updating propertyInterestedCount');
        let updateCount;
        switch (property.propertyType) {
          case "Residential":
            updateCount = residentialModel;
            break;

          case "Agricultural land":
          case "Agricultural":
            updateCount = fieldModel;
            break;

          case "Commercial":
            updateCount = commercialModel;
            break;

          case "Layout":
            updateCount = layoutModel;
            break;

          default:
            throw new Error(`Unknown propertyType: ${property.propertyType}`);
        }

        // Ensure propertyId is in ObjectId format for comparison (in case it's passed as a string)
        const propertyObjectId = new mongoose.Types.ObjectId(property.propertyId);
          const existsPropertyInDeal=await dealsModel.find({'property.propertyId':propertyId})
        // Check if the property already exists in the model
        const existingProperty = await updateCount.findById({ _id: propertyId });
        console.log(existingProperty,"existingProperty")
        if (existsPropertyInDeal) {
          console.log('propertyInterestedCount existing check');
          // If the property exists, increment the propertyInterestedCount by 1 using $inc
          await updateCount.findByIdAndUpdate(
            { _id: propertyObjectId },
            { $inc: { propertyInterestedCount: 1 } },
            { new: true }  // This will return the updated document
          );
          console.log(`Property ${property.propertyId} already exists, incremented propertyInterestedCount.`);
        } else {
          // If the property does not exist, initialize the propertyInterestedCount to 1
          await updateCount.create({
            _id: propertyObjectId,
            propertyType: property.propertyType,
            propertyInterestedCount: 1,
          });
          console.log(`Property ${property.propertyId} does not exist, initialized propertyInterestedCount.`);
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Deals created successfully.",
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};


const getExisitingCustomers = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    console.log(phoneNumber);
    if (!phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const getCustomerDetails = await customerModel.findOne({ phoneNumber });

    if (!getCustomerDetails) {
      return res
        .status(409)
        .json({ success: false, message: "Customer not found" });
    }

    return res.status(200).json({ success: true, data: getCustomerDetails });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// updated code as per changes in customer flow
const getExisitingCustomer = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    console.log(phoneNumber);

    if (!phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    // Query to match phoneNumber and role
    const getCustomerDetails = await userModel.findOne({
      phoneNumber: phoneNumber,
      role: 3,
    });

    if (!getCustomerDetails) {
      return res
        .status(409)
        .json({ success: false, message: "Customer not found" });
    }

    return res.status(200).json({ success: true, data: getCustomerDetails });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get deals based on the current logged in user and the deals assigned to that user
// fetching deals+customer+property details , based on deals-> customer and property details
const getDealsInUse = async (req, res) => {
  try {
    const role = req.user.user.role;
    let csrId = req.user.user.userId;
    let deals = [];

    // Define base query with isActive condition
    const baseQuery = { isActive: { $ne: "-1" } };
    console.log("role", role, csrId);

    // Fetch deals based on the user's role
    if (role === 5) {
      deals = await dealsModel.find({ ...baseQuery, csrId: csrId });
      console.log("deals", deals);
    }
    if (role === 6) {
      deals = await dealsModel.find({ ...baseQuery, addedBy: csrId });
      console.log("deals", deals);
    }
    if (role === 1) {
      deals = await dealsModel.find({ ...baseQuery, agentId: csrId });
    }

    if (role === 0) {
      deals = await dealsModel.find(baseQuery);
    }

    let dealsData = [];
    let customerIdsSeen = new Set(); // To track customer IDs that have already been processed

    for (let deal of deals) {
      let customerId = deal.customerId;
      let propertyId = deal.propertyId;
      let propertyType = deal.propertyType;
      let agentId = deal.agentId;

      // Check if the customer ID has already been processed
      if (customerIdsSeen.has(customerId)) {
        continue;
      }
      // Add the current customerId to the seen set
      customerIdsSeen.add(customerId);

      const customerData = await userModel.find({ _id: customerId });
      const agentData = await userModel.find({ _id: agentId }, { password: 0 });

      let propertyData;
      if (propertyType === "Commercial") {
        propertyData = await commercialModel.find({ _id: propertyId });
      } else if (propertyType === "Layout") {
        propertyData = await layoutModel.find({ _id: propertyId });
      } else if (
        propertyType === "Residential" ||
        propertyType === "Flat" ||
        propertyType === "House"
      ) {
        propertyData = await residentialModel.find({ _id: propertyId });
      } else {
        propertyData = await fieldModel.find({ _id: propertyId });
      }

      const custDeals = await dealsModel.distinct("propertyId", {
        customerId: customerData[0]._id,
      });
      // Prepare response data
      let data = {
        deal: deal,
        customer: customerData[0],
        property: propertyData[0],
        agent: agentData[0],
        totalDeals: custDeals.length,
      };

      dealsData.push(data);
    }

    console.log("dealsData", dealsData);
    res.status(200).json(dealsData);
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};
//check this text for district or customerName or customerId(accountId)
const getDealss = async (req, res) => {
  try {

    const role = req.user.user.role;
    let csrId = req.user.user.userId;
    let deals = [];

    // Extract filter parameters from request query
    const { text } = req.query;
    // check this text for district or customerName or customerId(accountId)
    const { accountId, customerName, district } = req.query;
    let baseQuery = { isActive: { $ne: "-1" } };

    // Adding filters to the base query
    if (text) {
      baseQuery["customerName"] = { $regex: text, $options: "i" };
    }
    if (text) {
      baseQuery["accountId"] = text;  // Changed from customerId to accountId
    }
    if (text) {
      baseQuery["district"] = text;
    }

    console.log("role", role, csrId);

    // Fetch deals based on the user's role
    if (role === 5) {
      deals = await dealsModel.find({ ...baseQuery, csrId: csrId });
      console.log("deals", deals);
    }
    if (role === 6) {
      deals = await dealsModel.find({ ...baseQuery, addedBy: csrId });
      console.log("deals", deals);
    }
    if (role === 1) {
      deals = await dealsModel.find({ ...baseQuery, agentId: csrId });
    }
    if (role === 0) {
      deals = await dealsModel.find(baseQuery);
    }

    let dealsData = [];
    let customerIdsSeen = new Set(); // To track customer IDs that have already been processed

    for (let deal of deals) {
      let customerId = deal.customerId;
      let propertyId = deal.propertyId;
      let propertyType = deal.propertyType;
      let agentId = deal.agentId;

      // Check if the customer ID has already been processed
      if (customerIdsSeen.has(customerId)) {
        continue;
      }
      // Add the current customerId to the seen set
      customerIdsSeen.add(customerId);

      const customerData = await userModel.find({ _id: customerId },{ password: 0 });
      const agentData = await userModel.find({ _id: agentId }, { password: 0 });

      let propertyData;
      if (propertyType === "Commercial") {
        propertyData = await commercialModel.find({ _id: propertyId });
      } else if (propertyType === "Layout") {
        propertyData = await layoutModel.find({ _id: propertyId });
      } else if (
        propertyType === "Residential" ||
        propertyType === "Flat" ||
        propertyType === "House"
      ) {
        propertyData = await residentialModel.find({ _id: propertyId });
      } else {
        propertyData = await fieldModel.find({ _id: propertyId });
      }

      const custDeals = await dealsModel.distinct("propertyId", {
        customerId: customerData[0]._id,
      });
      // Prepare response data
      let data = {
        deal: deal,
        customer: customerData[0],
        property: propertyData[0],
        agent: agentData[0],
        totalDeals: custDeals.length,
      };

      dealsData.push(data);
    }

    console.log("dealsData", dealsData);
    res.status(200).json(dealsData);
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};
// these conditions should be checked in usersModel basing the customerId in dealsModel

const getDeals = async (req, res) => {
  try {
    const role = req.user.user.role;
    let csrId = req.user.user.userId;
    let deals = [];

    // Extract filter parameters from request query
    const { text } = req.query;
    let baseQuery = { isActive: { $ne: "-1" } };

    console.log("role", role, csrId);

    let page=req.query.page
    let limit=req.query.limit

    // Fetch deals based on the user's role
    if (role === 5) {
      if(page)
      {
        let offset=(page-1)*limit;
        deals = await dealsModel.find({ ...baseQuery, csrId: csrId }).skip(offset).limit(limit);
      }
      else
      {
      deals = await dealsModel.find({ ...baseQuery, csrId: csrId });
    }
  }
    if (role === 6) {
      if(page)
      {
        let offset=(page-1)*limit;
        deals = await dealsModel.find({ ...baseQuery, addedBy: csrId }).skip(offset).limit(limit);

      }
      else
      {
        deals = await dealsModel.find({ ...baseQuery, addedBy: csrId });

      }
     }
    if (role === 1) {

      if(page)
      {
        let offset=(page-1)*limit;
        deals = await dealsModel.find({ ...baseQuery, agentId: csrId }).skip(offset).limit(limit);

      }
      else
      {
        deals = await dealsModel.find({ ...baseQuery, agentId: csrId });

      }
     }
    if (role === 0) {
      if(page)
      {
        let offset=(page-1)*limit
        deals = await dealsModel.find(baseQuery).skip(offset).limit(limit);

      }
      else
      {
        deals = await dealsModel.find(baseQuery);

      }

     }
     
    

    let dealsData = [];
    let customerIdsSeen = new Set(); // To track customer IDs that have already been processed

    for (let deal of deals) {
      let customerId = deal.customerId;
      let propertyId = deal.propertyId;
      let propertyType = deal.propertyType;
      let agentId = deal.agentId;

      // Check if the customer ID has already been processed
      if (customerIdsSeen.has(customerId)) {
        continue;
      }

      // Add the current customerId to the seen set
      customerIdsSeen.add(customerId);

      // Fetch customer data and apply filters if text is provided
      const customerData = await userModel.findOne(
        {
          _id: customerId,
          ...(text && {
            $or: [
              { firstName: { $regex: text, $options: "i" } },
              {lastName:{ $regex: text, $options: "i" }},
              { accountId: { $regex: text, $options: "i" } },
              { district: { $regex: text, $options: "i" } },
             
            ],
          }),
        },
        { password: 0 }
      );

      // Skip if customerData doesn't match the filters
      if (!customerData) {
        continue;
      }

      const agentData = await userModel.findOne({ _id: agentId }, { password: 0 });

      let propertyData;
      if (propertyType === "Commercial") {
        propertyData = await commercialModel.findOne({ _id: propertyId });
      } else if (propertyType === "Layout") {
        propertyData = await layoutModel.findOne({ _id: propertyId });
      } else if (
        propertyType === "Residential" ||
        propertyType === "Flat" ||
        propertyType === "House"
      ) {
        propertyData = await residentialModel.findOne({ _id: propertyId });
      } else {
        propertyData = await fieldModel.findOne({ _id: propertyId });
      }

      const custDeals = await dealsModel.distinct("propertyId", {
        customerId: customerData._id,
      });

      // Prepare response data
      let data = {
        deal: deal,
        customer: customerData,
        property: propertyData,
        agent: agentData,
        totalDeals: custDeals.length,
      };

      dealsData.push(data);
    }

    console.log("dealsData", dealsData);
    res.status(200).json(dealsData);
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};


// get customer deals fro dealsmodel based on role if role is 3 and check the userId as customerId in deals 
// then get properties data from deals get propertyId and propertyType from properties in deals 
// based on propertyType get property details from corrsponding propertyMdel, and get agentId from deal and get agent data from userModel and mathcing coondtion is _id (object id )
const customerDeals = async (req, res) => {
  const role = req.user.user.role;
  const userId = req.user.user.userId;

  if (role === 3 || role === '3') {
    try {
      // Find all deals for the customer
      const deals = await dealsModel.find({ customerId: userId });
      if (deals && deals.length > 0) {
        const dealDataList = [];

        // Process each deal
        for (let deal of deals) {
          const agentId = deal.agentId;
          const agentData = await userModel.findById(agentId);

          const propertyType = deal.properties.propertyType; // Assuming propertyType is directly on the deal
          const propertyId = deal.properties.propertyId;   // Assuming propertyId is directly on the deal

          let propertyData;

          // Get property data based on propertyType
          if (propertyType === 'Agricultural Land') {
            propertyData = await fieldModel.findById(new ObjectId(propertyId));
          } else if (propertyType === 'Commercial') {
            propertyData = await commercialModel.findById(new ObjectId(propertyId));
          } else if (propertyType === 'Residential') {
            propertyData = await residentialModel.findById(new ObjectId(propertyId));
          } else {
            propertyData = await layoutModel.findById(new ObjectId(propertyId));
          }

          // Prepare the deal data
          const dealData = {
            ...propertyData.toObject(), // Spread the property data
            agentData: agentData.toObject(), // Spread the agent data
            dealDetails: deal.toObject(), // Include deal details
          };

          // Push the processed deal into the result list
          dealDataList.push(dealData);
        }

        // Send the response with all processed deal data
        return res.status(200).json({ success: true, data: dealDataList });
      } else {
        return res.status(404).json({ success: false, message: 'No deals found for this customer' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'An error occurred while fetching customer deals' });
    }
  } else {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
};




const mongoose = require("mongoose"); // Ensure mongoose is required at the top of your file
const { custom } = require("joi");


const getCustomerDeals = async (req, res) => {
  try {
    const { role, userId: currentUserId } = req.user.user;
    const customerId = req.params.customerId;

    let page = req.query.page;
    let limit = req.query.limit;

    // Build base query based on user role
    const query = { customerId };
    if (role === 6 || role === "6") query.addedBy = currentUserId;

    let deals = [];
    // Fetch deals for the customer
    if (page) {
      let offset = (page - 1) * limit;
      deals = await dealsModel.find(query).skip(offset).limit(limit).sort({ createdAt: -1 });
    } else {
      deals = await dealsModel.find(query).sort({ createdAt: -1 });
    }

    if (!deals || deals.length === 0) {
      return res.status(409).json({ message: "No deals found for this customer." });
    }

    // Process deals in parallel using Promise.all
    const seenDeals = new Set();
    const dealsData = await Promise.all(
      deals.map(async (deal) => {
        const { customerId, propertyId, propertyType, agentId } = deal;
        const dealKey = `${customerId}_${propertyId}`;

        // Skip duplicate deals
        if (seenDeals.has(dealKey)) {
          console.log(`Skipping duplicate deal for ${dealKey}`);
          return null;
        }
        seenDeals.add(dealKey);

        try {
          // Fetch related data in parallel
          const [customerData, agentData, propertyData] = await Promise.all([
            customerModel.findById(customerId, { password: 0 }).lean(), // Fetch customer data
            userModel.findById(agentId, { password: 0 }).lean(), // Fetch agent data
            fetchPropertyData(propertyType, propertyId), // Fetch property data
          ]);

          // Skip if property data is not found
          if (!propertyData) {
            console.log(`Property not found for propertyId: ${propertyId}`);
            return null;
          }

          // Structure the final data
          return {
            deal,
            customer: customerData,
            property: propertyData,
            agent: agentData,
            agentName: `${agentData?.firstName || "Unknown"} ${agentData?.lastName || ""}`,
          };
        } catch (err) {
          console.error(`Error processing deal ${deal._id}:`, err);
          return null;
        }
      })
    );

    // Filter out null or invalid deals
    const filteredDealsData = dealsData.filter((data) => data);

    if (filteredDealsData.length === 0) {
      return res.status(404).json({ message: "No valid deals found." });
    }

    res.status(200).json(filteredDealsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Helper function to fetch property data
const fetchPropertyData = async (propertyType, propertyId) => {
  try {
    let property;
    switch (propertyType) {
      case "Layout":
        property = await layoutModel.findById(propertyId).lean();
        break;
      case "Commercial":
        property = await commercialModel.findById(propertyId).lean();
        break;
      case "Residential":
        property = await residentialModel.findById(propertyId).lean();
        break;
      default:
        property = await fieldModel.findById(propertyId).lean();
    }
    return property || null; // Return null if property not found
  } catch (error) {
    console.error(`Error fetching property (ID: ${propertyId}):`, error);
    return null; // Return null if there's an error
  }
};



const getCustomerDealsFiltered = async (req, res) => {
  try {
    const { role, userId: currentUserId } = req.user.user;
    const customerId = req.params.customerId;
    const { text } = req.query;


    let page=req.query.page
    let limit=req.query.limit
    // Build base query based on user role
    const query = { customerId };
    if (role === 6 || role === "6") query.addedBy = currentUserId;

    // Fetch deals for the customer
    let deals=[]
    if(page)
    {
      let offset=(page-1)*limit
        deals = await dealsModel.find(query).skip(offset).limit(limit).sort({ createdAt: -1 });

    }
    else
    {
        deals = await dealsModel.find(query).sort({ createdAt: -1 });

    }
 
    if (!deals || deals.length === 0) {
      return res.status(409).json({ message: "No deals found for this customer." });
    }

    // Process deals in parallel using Promise.all
    const seenDeals = new Set();
    const dealsData = await Promise.all(
      deals.map(async (deal) => {
        const { customerId, propertyId, propertyType, agentId } = deal;
        const dealKey = `${customerId}_${propertyId}`;

        // Skip duplicate deals
        if (seenDeals.has(dealKey)) {
          console.log(`Skipping duplicate deal for ${dealKey}`);
          return null;
        }
        seenDeals.add(dealKey);

        // Fetch related data in parallel
        const [customerData, agentData, propertyData] = await Promise.all([
          customerModel.findById(customerId, { password: 0 }).lean(),
          userModel.findById(agentId, { password: 0 }).lean(),
          fetchPropertyData(propertyType, propertyId),
        ]);
        
        // if (!customerData || !agentData || !propertyData) {
        //   console.log(`Incomplete data for deal ${deal._id}`);
        //   return null;
        // }

        // Apply filters if `text` is provided
        if (text) {
          const textRegex = new RegExp(text, "i");
          const matchesFilters = (() => {
            console.log("Applying filter for text:", text);
            switch (propertyType) {
              case "Residential":
                console.log("Residential property data:", propertyData);
                return [
                  textRegex.test(propertyType),
                  textRegex.test(propertyData?.propertyDetails?.apartmentName),
                  textRegex.test(propertyData?.address?.district),
                  textRegex.test(propertyData?.propertyId),
                ].some(Boolean);
              case "Agricultural land":
                console.log("Agricultural land property data:", propertyData);
                return [
                  textRegex.test(propertyType),
                  textRegex.test(propertyData?.landDetails?.title),
                  textRegex.test(propertyData?.address?.district),
                  textRegex.test(propertyData?.propertyId),
                ].some(Boolean);
              case "Commercial":
                console.log("Commercial property data:", propertyData);
                return [
                  textRegex.test(propertyType),
                  textRegex.test(propertyData?.propertyTitle),
                  textRegex.test(propertyData?.propertyDetails?.address?.district),
                  textRegex.test(propertyData?.propertyId),
                ].some(Boolean);
              case "Layout":
                console.log("Layout property data:", propertyData);
                return [
                  textRegex.test(propertyType),
                  textRegex.test(propertyData?.layoutDetails?.layoutTitle),
                  textRegex.test(propertyData?.layoutDetails?.address?.district),
                  textRegex.test(propertyData?.propertyId),
                ].some(Boolean);
              default:
                console.error(`Unknown propertyType: ${propertyType}`);
                return false;
            }
          })();
        
          if (!matchesFilters) {
            console.log(`Skipping deal ${deal._id} as it does not match filters.`);
            return null;
          }
        }
        

        // Structure the final data
        return {
          deal,
          customer: customerData,
          property: propertyData,
          agent: agentData,
          agentName: `${agentData.firstName} ${agentData.lastName}`,
        };
      })
    );

    // Filter out null or invalid deals
    const filteredDealsData = dealsData.filter((data) => data);

    if (filteredDealsData.length === 0) {
      return res.status(404).json({ message: "No valid deals found." });
    }

    res.status(200).json(filteredDealsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
// FUZZY SEARCH
const getCustomerDealsFilteredD = async (req, res) => {
  try {
    const { role, userId: currentUserId } = req.user.user;
    const customerId = req.params.customerId;
    const { text } = req.query;

    // Build base query based on user role
    const query = { customerId };
    if (role === 6 || role === "6") query.addedBy = currentUserId;

    // Fetch deals for the customer
    const deals = await dealsModel.find(query).sort({ createdAt: -1 });

    if (!deals || deals.length === 0) {
      return res.status(409).json({ message: "No deals found for this customer." });
    }

    // Process deals in parallel using Promise.all
    const seenDeals = new Set();
    const dealsData = await Promise.all(
      deals.map(async (deal) => {
        const { customerId, propertyId, propertyType, agentId } = deal;
        const dealKey = `${customerId}_${propertyId}`;

        // Skip duplicate deals
        if (seenDeals.has(dealKey)) {
          console.log(`Skipping duplicate deal for ${dealKey}`);
          return null;
        }
        seenDeals.add(dealKey);

        // Fetch related data in parallel
        const [customerData, agentData, propertyData] = await Promise.all([
          customerModel.findById(customerId, { password: 0 }).lean(),
          userModel.findById(agentId, { password: 0 }).lean(),
          fetchPropertyData(propertyType, propertyId),
        ]);

        if (!customerData || !agentData || !propertyData) {
          console.log(`Incomplete data for deal ${deal._id}`);
          return null;
        }

        // Structure the final data for fuzzy search
        return {
          deal,
          customer: customerData,
          property: propertyData,
          agent: agentData,
          agentName: `${agentData.firstName} ${agentData.lastName}`,
        };
      })
    );

    // Filter out null or invalid deals
    const validDealsData = dealsData.filter((data) => data);

    // If text is provided, apply fuzzy search
    let filteredDealsData = validDealsData;
    if (text) {
      const fuse = new Fuse(validDealsData, {
        keys: [
          "deal.propertyType",
          "property.propertyDetails.apartmentName",
          "property.address.district",
          "property.propertyId",
          "property.landDetails.title",
          "property.propertyTitle",
          "property.layoutDetails.layoutTitle",
          "property.layoutDetails.address.district",
          "agentName",
        ],
        threshold: 0.4, // Adjust to control match fuzziness
      });

      filteredDealsData = fuse.search(text).map((result) => result.item);
    }

    if (filteredDealsData.length === 0) {
      return res.status(404).json({ message: "No valid deals found." });
    }

    res.status(200).json(filteredDealsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const getCustomerDealsInUse = async (req, res) => {
  try {
    let cId = req.params.customerId;

    const deals = await dealsModel
      .find({ customerId: cId })
      .sort({ createdAt: -1 });

    let dealsData = [];
    let seenDeals = new Set();
    for (let deal of deals) {
      let customerId = deal.customerId;
      let propertyId = deal.propertyId;
      let propertyType = deal.propertyType;
      let agentId = deal.agentId;

      let dealKey = `${customerId}_${propertyId}`;

      // Check if this combination of customerId and propertyId has already been processed
      if (seenDeals.has(dealKey)) {
        console.log(
          `Combination of Customer ID ${customerId} and Property ID ${propertyId} already processed. Skipping deal.`
        );
        continue; // Skip this deal if the combination is already processed
      }

      seenDeals.add(dealKey);

      const customerData = await customerModel.find({ _id: customerId });

      const agentData = await userModel.find({ _id: agentId }, { password: 0 });

      let propertyData;
      if (propertyType === "Commercial") {
        propertyData = await commercialModel.find({ _id: propertyId });
      } else if (propertyType === "Layout") {
        propertyData = await layoutModel.find({ _id: propertyId });
      } else if (
        propertyType === "Residential" ||
        propertyType === "Flat" ||
        propertyType === "House"
      ) {
        propertyData = await residentialModel.find({ _id: propertyId });
      } else {
        propertyData = await fieldModel.find({ _id: propertyId });
      }

      let data = {
        deal: deal,
        customer: customerData[0],
        property: propertyData[0],
        agent: agentData[0],
        agentName: agentData[0].firstName + " " + agentData[0].lastName,
      };

      dealsData.push(data);
    }
    res.status(200).json(dealsData);
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};


// if role is not 3 then send this data 
// if role is 3 then modify this as I will suggest currently hold this 

const getAgentDealings = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    const { page, limit } = req.query;

    if (role === 3 || role === '3') {
      // Role 3: Fetch and return customer deals
      try {
        const deals = await dealsModel.find({ customerId: userId });

        if (!deals || deals.length === 0) {
          return res.status(409).json({ success: false, message: 'No deals found for this customer' });
        }

        const dealDataList = await Promise.all(
          deals.map(async (deal) => {
            const agentData = await userModel.findById(deal.agentId);
            const { propertyType, propertyId } = deal;

            let propertyData = null;
            switch (propertyType?.toLowerCase()) {
              case 'agricultural land':
              case 'agricultural':
                propertyData = await fieldModel.findById(propertyId);
                break;
              case 'commercial':
                propertyData = await commercialModel.findById(propertyId);
                break;
              case 'residential':
                propertyData = await residentialModel.findById(propertyId);
                break;
              default:
                propertyData = await layoutModel.findById(propertyId);
                break;
            }

            if (!agentData || !propertyData) return null; // Skip if no agent or property data

            return {
              property: propertyData?.toObject(),
              agentData: agentData?.toObject(),
              dealDetails: deal.toObject(),
            };
          })
        );

        const filteredDealData = dealDataList.filter((deal) => deal); // Remove null entries
        return res.status(200).json({ success: true, data: filteredDealData });
      } catch (error) {
        console.error('Error fetching customer deals:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while fetching customer deals' });
      }
    } else {
      // Non-role 3: Existing agent dealings functionality
      const offset = page ? (page - 1) * limit : 0;
      const query = { agentId: userId, interestIn: '1' };

      const agentDealings = page
        ? await dealsModel.find(query).skip(offset).limit(limit)
        : await dealsModel.find(query);

      if (!agentDealings || agentDealings.length === 0) {
        return res.status(409).json({ message: 'No dealings found' });
      }

      const seenDealings = new Set();
      const enrichedDealings = await Promise.all(
        agentDealings.map(async (deal) => {
          const customerData = await userModel.findById(deal.customerId).select('-password');
          const propertyType = deal.propertyType?.toLowerCase();

          let propertyData = null;
          switch (propertyType) {
            case 'commercial':
              propertyData = await commercialModel.findById(deal.propertyId);
              break;
            case 'layout':
              propertyData = await layoutModel.findById(deal.propertyId);
              break;
            case 'agricultural land':
              propertyData = await fieldModel.findById(deal.propertyId);
              break;
            case 'residential':
            case 'flat':
            case 'house':
              propertyData = await residentialModel.findById(deal.propertyId);
              break;
          }

          if (!customerData || !propertyData) return null; // Skip if no customer or property data

          const uniqueKey = `${deal.propertyId}-${deal.customerId}`;
          if (seenDealings.has(uniqueKey)) return null;
          seenDealings.add(uniqueKey);

          return {
            ...deal.toObject(),
            customer: customerData,
            property: propertyData,
          };
        })
      );

      const uniqueDealings = enrichedDealings.filter((deal) => deal); // Remove null entries
      const sortedDealings = uniqueDealings.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return res.status(200).json({ data: sortedDealings });
    }
  } catch (error) {
    console.error('Error fetching agent dealings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAgentDealingsInUse = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    const { page, limit } = req.query;

    if (role === 3 || role === '3') {
      // Role 3: Fetch and return customer deals
      try {
        const deals = await dealsModel.find({ customerId: userId });

        if (!deals || deals.length === 0) {
          return res.status(409).json({ success: false, message: 'No deals found for this customer' });
        }

        const dealDataList = await Promise.all(
          deals.map(async (deal) => {
            const agentData = await userModel.findById(deal.agentId);

            const { propertyType, propertyId } = deal; // Assuming properties exist on the deal
            let propertyData = null;
            
            switch (propertyType?.toLowerCase()) {
              case 'agricultural land':
              case 'agricultural':
                propertyData = await fieldModel.findById(propertyId);
                break;
              case 'commercial':
                propertyData = await commercialModel.findById(propertyId);
                break;
              case 'residential':
                propertyData = await residentialModel.findById(propertyId);
                break;
              default:
                propertyData = await layoutModel.findById(propertyId);
                break;
            }
            return {
              property: propertyData?.toObject(),
              // propertyData?.toObject(),
              agentData: agentData?.toObject(),
              dealDetails: deal.toObject(),
            };
          })
        );

        return res.status(200).json({ success: true, data: dealDataList });
      } catch (error) {
        console.error('Error fetching customer deals:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while fetching customer deals' });
      }
    } else {
      // Non-role 3: Existing agent dealings functionality
      const offset = page ? (page - 1) * limit : 0;
      const query = { agentId: userId, interestIn: '1' };

      const agentDealings = page
        ? await dealsModel.find(query).skip(offset).limit(limit)
        : await dealsModel.find(query);

      if (!agentDealings || agentDealings.length === 0) {
        return res.status(409).json({ message: 'No dealings found' });
      }

      const seenDealings = new Set();
      const enrichedDealings = await Promise.all(
        agentDealings.map(async (deal) => {
          const customerData = await userModel.findById(deal.customerId);
          const propertyType = deal.propertyType?.toLowerCase();
          let propertyData = null;

          switch (propertyType) {
            case 'commercial':
              propertyData = await commercialModel.findById(deal.propertyId);
              break;
            case 'layout':
              propertyData = await layoutModel.findById(deal.propertyId);
              break;
            case 'agricultural land':
              propertyData = await fieldModel.findById(deal.propertyId);
              break;
            case 'residential':
            case 'flat':
            case 'house':
              propertyData = await residentialModel.findById(deal.propertyId);
              break;
          }

          const uniqueKey = `${deal.propertyId}-${deal.customerId}`;
          if (seenDealings.has(uniqueKey)) return null;
          seenDealings.add(uniqueKey);

          return {
            ...deal.toObject(),
            customer: customerData,
            property: propertyData,
          };
        })
      );

      const uniqueDealings = enrichedDealings.filter((deal) => deal);
      const sortedDealings = uniqueDealings.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return res.status(200).json({ data: sortedDealings });
    }
  } catch (error) {
    console.error('Error fetching agent dealings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAgentDealingsInUsed = async (req, res) => {
  try {
    const agentId = req.user.user.userId;
    const role =req.user.user.role;  
    let page=req.query.page
    let limit=req.query.limit
  
    let agentDealings=[]
if(page)
{
let offset=(page-1)*limit
  agentDealings = await dealsModel.find({
  agentId: agentId,
  interestIn: "1",
}).skip(offset).limit(limit);
}
else
{
    agentDealings = await dealsModel.find({
    agentId: agentId,
    interestIn: "1",
  });
}
 

    if (!agentDealings || agentDealings.length === 0) {
      return res.status(409).json({ message: "No dealings found" });
    }

    const seenDealings = new Set();
    const enrichedDealings = await Promise.all(
      agentDealings.map(async (deal) => {
        const customerData = await userModel.findOne({
          _id: deal.customerId,
        });
        const propertyType = deal.propertyType;
        let propertyData = null;

        if (propertyType === "Commercial" || propertyType === "commercial") {
          propertyData = await commercialModel.findOne({
            _id: deal.propertyId,
          });
        } else if (propertyType === "Layout") {
          propertyData = await layoutModel.findOne({ _id: deal.propertyId });
        } else if (propertyType === "Agricultural land") {
          propertyData = await fieldModel.findOne({ _id: deal.propertyId });
        } else if (["Residential", "Flat", "House"].includes(propertyType)) {
          propertyData = await residentialModel.findOne({
            _id: deal.propertyId,
          });
        }

        const uniqueKey = `${deal.propertyId}-${deal.customerId}`;

        if (seenDealings.has(uniqueKey)) {
          // Skip the duplicate
          return null;
        }

        seenDealings.add(uniqueKey);

        return {
          ...deal.toObject(),
          customer: customerData,
          property: propertyData,
        };
      })
    );

    // Filter out any null values (duplicates)
    const uniqueDealings = enrichedDealings.filter((deal) => deal !== null);

    // Sort by latest dealings first
    const sortedDealings = uniqueDealings.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({ data: sortedDealings });
  } catch (error) {
    console.error("Error fetching agent dealings:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




const changeInterest = async (req, res) => {
  try {
    const status = await dealsModel.findByIdAndUpdate(
      { _id: req.body.dealingId },
      {
        interestIn: req.body.interestedIn,
      }
    );
    res.status(200).json("Updated Successfully");
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const startDeal = async (req, res) => {
  try {
    console.log('In start deal');
    const {dealId,dealStatus} = req.body;
   
    const deals = await dealsModel.findByIdAndUpdate(dealId,{
      dealStatus:'inProgress'||dealStatus,
    });
    
  
    let message = {
      senderId: deals.agentId,
      receiverId: deals.csrId,
      message: `Deal Has Been Started`,
      details:`Deal for the property ${deals.propertyName} has been started.`,
      notifyType: "Deal",
    };
    
    const notify = new notifyModel(message);
    await notify.save();
    console.log('exiting start deal')
    res.status(200).json("Deal Started Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};
const closeDeal = async (req, res) => {
  try {
    console.log(req.body,' close deal')
    const dealId = req.body.dealId;
    console.log(dealId,'dealId')
    const deals = await dealsModel.findById(dealId);
    let csrId = deals.csrId||'5';

    let agentId = deals.agentId;
    if (
      req.body.sellingStatus === "sold" ||
      req.body.sellingStatus === "Sold"
    ) {
      if (
        deals.propertyType === "Commercial" ||
        deals.propertyType === "commercial"
      ) {
        await commercialModel.findByIdAndUpdate(deals.propertyId, {
          status: 1,
        });
      } else if (
        deals.propertyType === "Layout" ||
        deals.propertyType === "layout"
      ) {
        await layoutModel.findByIdAndUpdate(deals.propertyId, {
          $set: {
            status: 1,
            "layoutDetails.availablePlots": 0,
          },
        });
      } else if (
        deals.propertyType === "Residential" ||
        deals.propertyType === "residential"
      ) {
        await residentialModel.findByIdAndUpdate(deals.propertyId, {
          status: 1,
        });
      } else {
        await fieldModel.findByIdAndUpdate(deals.propertyId, { status: 1 });
      }
    }
    await dealsModel.findByIdAndUpdate(dealId, {
      dealStatus: "closed",
      amount: req.body.amount,
      sellingStatus: req.body.sellingStatus,
      // comments: deals.comments
      //   ? deals.comments + ", " + req.body.comments
      //   : req.body.comments,
      comments:req.body.comments,
    });

    let message = {
      senderId: agentId,
      receiverId: csrId,
      message: `Deal Has Been Closed.`,
      details:`Deal for the property ${deals.propertyName} has been closed.`,
      notifyType: "Deal",
    };

    const notify = new notifyModel(message);
    await notify.save();
    res.status(200).json("Deal Closed Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};
const getClosedDeals = async (req, res) => {
  try {
    const role = req.user.user.role;
    const id = req.user.user.userId;
    let dealsData = [];
    let deals = [];
    if (role === "1") {
      dealsData = await dealsModel.find({ dealStatus: "closed", agentId: id });
      deals.push(dealsData);
    } else if (role === "5") {
      dealsData = await dealsModel.find({ dealStatus: "closed", csrId: id });
      deals.push(dealsData);
    } else {
      dealsData = await dealsModel.find({ dealStatus: "closed" });

      for (let deal of dealsData) {
        let customerId = deal.customerId;
        let propertyId = deal.propertyId;
        let propertyType = deal.propertyType;
        let agentId = deal.agentId;
        const customerData = await customerModel.find({ _id: customerId });

        const agentData = await userModel.find(
          { _id: agentId },
          { password: 0 }
        );
        let propertyData;
        if (propertyType === "Commercial") {
          propertyData = await commercialModel.find({ _id: deal.propertyId });
        } else if (propertyType === "Layout") {
          propertyData = await layoutModel.find({ _id: deal.propertyId });
        } else if (
          propertyType === "Residential" ||
          propertyType === "Flat" ||
          propertyType === "House"
        ) {
          propertyData = await residentialModel.find({ _id: deal.propertyId });
        } else {
          propertyData = await fieldModel.find({ _id: deal.propertyId });
        }
        let data = {
          deal: deal,
          customer: customerData[0],
          property: propertyData[0],
          agent: agentData[0],
        };
        deals.push(data);
      }
    }
    if (dealsData.length > 0) {
      return res.status(200).json(deals);
    } else {
      return res.status(404).json("No Closed Deals");
    }
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
};


const getIntresetedCustomers = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    let page = req.query.page;
    let limit = req.query.limit;

    let customerDeals = [];

    if (page) {
      let offset = (page - 1) * limit;
      customerDeals = await dealsModel.distinct("customerId", {
        agentId: userId,
      }).skip(offset).limit(limit);
    } else {
      customerDeals = await dealsModel.distinct("customerId", {
        agentId: userId,
      });
    }

    let customerData = [];

    for (let customer of customerDeals) {
      const userData = await userModel.find({ _id: customer });

      if (userData.length > 0) {
        customerData.push({
          customerId: customer,
          customerName:
            (userData[0].firstName || '') + " " + (userData[0].lastName || 'NA'),
          phoneNumber: userData[0].phoneNumber || 'NA',
          profilePicture: userData[0].profilePicture || 'NA',
          email: userData[0].email || 'NA',
          district: userData[0].district || 'NA',
          mandal: userData[0].mandal || 'NA',
          village: userData[0].village || 'NA',
          state: userData[0].state || 'NA',
          country: userData[0].country || 'NA',
          pincode: userData[0].pinCode || 'NA',
          userId: userData[0].accountId || 'NA',
        });
      } else {
        console.warn(`No user found for customerId: ${customer}`);
      }
    }

    return res.status(200).json(customerData);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal Server Error");
  }
};


const getDistinctProperties = async (req, res) => {
  try {
    const userId = req.user?.user?.userId;
    let page = req.query.page;
    let limit = req.query.limit;

    if (!userId) {
      return res.status(400).json("Invalid user ID.");
    }

    let distinctProperties = [];
    if (page) {
      let offset = (page - 1) * limit;
      distinctProperties = await dealsModel.aggregate([
        { $match: { agentId: userId } },
        {
          $group: {
            _id: "$propertyId",
            propertyName: { $first: "$propertyName" },
            propertyType: { $first: "$propertyType" },
          },
        },
        {
          $project: {
            _id: 0,
            propertyId: "$_id",
            propertyName: 1,
            propertyType: 1,
          },
        },
        { $limit: Number(limit) },
      ]).skip(offset);
    } else {
      distinctProperties = await dealsModel.aggregate([
        { $match: { agentId: userId } },
        {
          $group: {
            _id: "$propertyId",
            propertyName: { $first: "$propertyName" },
            propertyType: { $first: "$propertyType" },
          },
        },
        {
          $project: {
            _id: 0,
            propertyId: "$_id",
            propertyName: 1,
            propertyType: 1,
          },
        },
      ]);
    }

    let properties = [];
    for (let props of distinctProperties) {
      let property;

      // Fetch distinct customers
      const distinctCustomers = await dealsModel.aggregate([
        { $match: { propertyId: props.propertyId } },
        {
          $group: {
            _id: "$customerId",
          },
        },
        {
          $project: {
            _id: 0,
            customerId: "$_id",
          },
        },
      ]);

      switch (props.propertyType) {
        case "Layout":
          property = await layoutModel.find({ _id: props.propertyId });
          if (property?.length > 0) {
            properties.push({
              ...props,
              accountId: property[0].propertyId,
              country: property[0]?.layoutDetails?.address?.country || "",
              district: property[0]?.layoutDetails?.address?.district || "",
              pincode: property[0]?.layoutDetails?.address?.pincode || "",
              village: property[0]?.layoutDetails?.address?.village || "",
              mandal: property[0]?.layoutDetails?.address?.mandal || "",
              state: property[0]?.layoutDetails?.address?.state || "",
              customerCount: distinctCustomers.length,
              images: property[0]?.uploadPics || [],
            });
          }
          break;

        case "Commercial":
          property = await commercialModel.find({ _id: props.propertyId });
          if (property?.length > 0) {
            properties.push({
              ...props,
              accountId: property[0].propertyId,
              country: property[0]?.propertyDetails?.landDetails?.address?.country || "",
              district: property[0]?.propertyDetails?.landDetails?.address?.district || "",
              pincode: property[0]?.propertyDetails?.landDetails?.address?.pincode || "",
              village: property[0]?.propertyDetails?.landDetails?.address?.village || "",
              mandal: property[0]?.propertyDetails?.landDetails?.address?.mandal || "",
              state: property[0]?.propertyDetails?.landDetails?.address?.state || "",
              customerCount: distinctCustomers.length,
              images: property[0]?.propertyDetails?.uploadPics || [],
            });
          }
          break;

        case "Residential":
          property = await residentialModel.find({ _id: props.propertyId });
          if (property?.length > 0) {
            properties.push({
              ...props,
              accountId: property[0].propertyId,
              country: property[0]?.address?.country || "",
              district: property[0]?.address?.district || "",
              pincode: property[0]?.address?.pincode || "",
              village: property[0]?.address?.village || "",
              mandal: property[0]?.address?.mandal || "",
              state: property[0]?.address?.state || "",
              customerCount: distinctCustomers.length,
              images: property[0]?.propPhotos || [],
            });
          }
          break;

        default:
          property = await fieldModel.find({ _id: props.propertyId });
          if (property?.length > 0) {
            properties.push({
              ...props,
              accountId: property[0].propertyId,
              country: property[0]?.address?.country || "",
              district: property[0]?.address?.district || "",
              pincode: property[0]?.address?.pincode || "",
              village: property[0]?.address?.village || "",
              mandal: property[0]?.address?.mandal || "",
              state: property[0]?.address?.state || "",
              customerCount: distinctCustomers.length,
              images: property[0]?.landDetails?.images || [],
            });
          }
          break;
      }
    }

    if (properties.length === 0) {
      return res.status(409).json("No Properties With Deals");
    }
    return res.status(200).json(properties);
  } catch (error) {
    console.error("Error in getDistinctProperties:", error);
    return res.status(500).json("Internal Server Error");
  }
};



const getPropertyDeals = async (req, res) => {
  try {
    const propId = req.params.propertyId;

  let page=req.query.page
  let limit=req.query.limit

  let dealsData=[]
if(page)
{

  let offset=(page-1)*limit
  dealsData = await dealsModel
  .find({ propertyId: propId }).skip(offset).limit(limit)
  .sort({ createdAt: -1 });
}
else
{
  dealsData = await dealsModel
  .find({ propertyId: propId })
  .sort({ createdAt: -1 });
}
     

    let propDeals = [];

    for (let prop of dealsData) {
      const users = await userModel.find(
        { _id: prop.customerId },
        { password: 0 }
      );
      const user1 = await userModel.find(
        { _id: prop.agentId },
        { password: 0 }
      );
      propDeals.push({
        dealId: prop._id,
        dealStatus:prop.dealStatus,
        customerId: prop.customerId,
        propertyId: prop.propertyId,
        propertyName: prop.propertyName,
        propertyType: prop.propertyType,
        intresetIn: prop.interestIn,
        comments: prop.comments,
        sellingStatus: prop.sellingStatus,
        customer: users[0],
        agent: user1[0],
      });
    }

    if (dealsData.length === 0) {
      return res.status(409).json("No Deals Related to Property");
    }

    return res.status(200).json(propDeals);
  } catch (error) {
    return res.status(500).json("Internal Server Error");
  }
};

const getDealsRelatedAgents = async (req, res) => {
  try {
    const userId = req.user.user.userId;



   let page=req.query.page
   let limit=req.query.limit

    // const deals=await dealsModel.distinct("agentId",{customerId:userId});

    let distinctDeals=[]

    if(page)
    {

      let offset=(page-1)*limit
        distinctDeals = await dealsModel.aggregate([
        { $match: { customerId: userId } },
        {
          $group: {
            _id: "$agentId",
            propertyId: { $first: "$propertyId" },
            createdAt: { $first: "$createdAt" },
            interestIn: { $first: "$interestIn" },
          },
        },
        {
          $project: {
            _id: 0,
            agentId: "$_id",
            propertyId: 1,
            createdAt: 1,
            interestIn: 1,
          },
        },
        {
          $limit:Number(limit)
        }
      ]).skip(offset);
    }
    else
    {
        distinctDeals = await dealsModel.aggregate([
        { $match: { customerId: userId } },
        {
          $group: {
            _id: "$agentId",
            propertyId: { $first: "$propertyId" },
            createdAt: { $first: "$createdAt" },
            interestIn: { $first: "$interestIn" },
          },
        },
        {
          $project: {
            _id: 0,
            agentId: "$_id",
            propertyId: 1,
            createdAt: 1,
            interestIn: 1,
          },
        },
      ]);
    }
 
    let agentData = [];
    for (let deal of distinctDeals) {
      const users = await userModel.find(
        { _id: deal.agentId },
        { password: 0 }
      );

      agentData.push({
        ...deal,
        agentName: users[0].firstName + " " + users[0].lastName,
        phoneNumber: users[0].phoneNumber,
        email: users[0].email,
        country: users[0].country,
        state: users[0].state,
        district: users[0].district,
        mandal: users[0].mandal,
        village: users[0].village,
        pincode: users[0].pinCode,
      });
    }
    return res.status(200).json(agentData);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
};


const getIntrestedProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 if not provided
    const offset = (page - 1) * limit;

    console.log("Fetching interested properties...");
    const userId = req.user.user.userId;

    const pipeline = [
      { $match: { customerId: userId } },
      {
        $group: {
          _id: "$propertyId",
          propertyName: { $first: "$propertyName" },
          propertyType: { $first: "$propertyType" },
          createdAt: { $first: "$createdAt" },
          interestIn: { $first: "$interestIn" },
          dealId: { $first: "$_id" },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 0,
          propertyId: "$_id",
          propertyName: 1,
          propertyType: 1,
          createdAt: 1,
          interestIn: 1,
          dealId: 1,
        },
      },
    ];

    if (page && limit) {
      pipeline.push({ $skip: offset }, { $limit: limit });
    }

    const properties = await dealsModel.aggregate(pipeline);

    console.log("Properties fetched:", properties);

    const propertiesData = [];

    for (let props of properties) {
      let data = [];

      if (props.propertyType === "Layout") {
        data = await layoutModel.find({ _id: props.propertyId });
      } else if (props.propertyType === "Residential") {
        data = await residentialModel.find({ _id: props.propertyId });
      } else if (props.propertyType === "Commercial") {
        data = await commercialModel.find({ _id: props.propertyId });
      } else {
        data = await fieldModel.find({ _id: props.propertyId });
      }

      if (data.length > 0) {
        propertiesData.push({
          ...props,
          property: data[0],
        });
      } else {
        console.log(`No data found for propertyId: ${props.propertyId}`);
      }
    }

    return res.status(200).json(propertiesData);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// const getIntrestedProperties = async (req, res) => {
//   try {
//      let page=req.query.page
//      let limit=req.query.limit
// console.log("in interested properties")
//     const userId = req.user.user.userId;
//      let properties=[]
//     if(page)
//     {
// let offset=(page-1)*limit
//         properties = await dealsModel.aggregate([
//         { $match: { customerId: userId } },
//         {
//           $group: {
//             _id: "$propertyId",
//             propertyName: { $first: "$propertyName" },
//             propertyType: { $first: "$propertyType" },
//             createdAt: { $first: "$createdAt" },
//             interestIn: { $first: "$interestIn" },
//             dealId: { $first: "$_id" },
//           },
//         },
//         {
//           $sort: { createdAt: -1 }  // Sort by createdAt in descending order
//         },
//         {
//           $project: {
//             _id: 0,
//             propertyId: "$_id",
//             propertyName: 1,
//             propertyType: 1,
//             createdAt: 1,
//             interestIn: 1,
//             dealId: 1,
//           },
//         },
//         {
//           $limit:Number(limit)
//         }
//       ]).skip(offset);
  
//     }
//     else
//     {
// console.log("in interested properties without pagination")
//         properties = await dealsModel.aggregate([
//         { $match: { customerId: userId } },
//         {
//           $group: {
//             _id: "$propertyId",
//             propertyName: { $first: "$propertyName" },
//             propertyType: { $first: "$propertyType" },
//             createdAt: { $first: "$createdAt" },
//             interestIn: { $first: "$interestIn" },
//             dealId: { $first: "$_id" },
//           },
//         },
//         {
//           $sort: { createdAt: -1 }  // Sort by createdAt in descending order
//         },
//         {
//           $project: {
//             _id: 0,
//             propertyId: "$_id",
//             propertyName: 1,
//             propertyType: 1,
//             createdAt: 1,
//             interestIn: 1,
//             dealId: 1,
//           },
//         },
//       ]);
//   console.log(properties)
//     }
 
//     let propertiesData = [];

//     for (let props of properties) {
//       let data=[];
//       if (props.propertyType === "Layout") {
//         data = await layoutModel.find({ _id: props._id });
//       } else if (props.propertyType === "Residential") {
//         data = await residentialModel.find({ _id: props._id });
//       } else if (props.propertyType === "Commercial") {
//         data = await commercialModel.find({ _id: props._id });
//       } else {
//         data = await fieldModel.find({ _id: props._id });
//       }

//       console.log(data)
//        propertiesData.push({
//         ...props,
//         property: data[0],
//       });
//     }

//     return res.status(200).json(propertiesData);
//   } catch (error) {
//     return res.status(500).json("Internal Server Error");
//   }
// };


const dealSearchOnCustomer = async (req, res) => {
  try {
    let text = req.params.text;

    let regex = new RegExp(text, "i");

    let requestQuery = {};
    if (text) {
      requestQuery.$or = [
        { firstName: { $regex: regex } },
        { lastname: { $regex: regex } },
        { accountId: { $regex: regex } },
        { district: { $regex: regex } },
      ];
    }
    const customerDetails = await userModel.find({ ...requestQuery });

    let customers = [];
    for (let customer of customerDetails) {
      const dealsData = await dealsModel.find({
        customerId: customer._id.toString(),
      });
      if (dealsData.length > 0) {
        customers.push({
          customerId: customer._id,
          customerName: customer.firstName + " " + customer.lastName,
          phoneNumber: customer.phoneNumber,
          profilePicture: customer.profilePicture,
          email: customer.email,
          district: customer.district,
          mandal: customer.mandal,
          village: customer.village,
          state: customer.state,
          country: customer.country,
          pincode: customer.pinCode,
          userId: customer.accountId,
        });
      }
    }

    if (customers.length === 0) {
      return res
        .status(409)
        .json({ messsage: "No customers found", status: "false" });
    } else {
      return res.status(200).json({ data: customers, status: "true" });
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const dealsSearchOnProps = async (req, res) => {
  try {
    let text = req.params.text;

    let regex = new RegExp(text, "i");

    let requestQuery = {};

    if (text) {
      requestQuery.$or = [
        { propertyType: { $regex: regex } },
        { "landDetails.title": { $regex: regex } },
        { "propertyDetails.apartmentName": { $regex: regex } },
        { "layoutDetails.layoutTitle": { $regex: regex } },
        { propertyTitle: { $regex: regex } },
        { propertyType: { $regex: regex } },
        { "address.district": { $regex: regex } },
        {
          "layoutDetails.address.district": { $regex: regex },
        },
        { "landDetails.address.district": { $regex: regex } },
        {
          propertyId: { $regex: regex },
        },
      ];
    }

    const [fieldData, commercialData, residentialData, layoutData] =
      await Promise.all([
        fieldModel.find({ ...requestQuery }),
        commercialModel.find({ ...requestQuery }),
        residentialModel.find({ ...requestQuery }),
        layoutModel.find({ ...requestQuery }),
      ]);

    const properties = [
      ...fieldData,
      ...commercialData,
      ...residentialData,
      ...layoutData,
    ];
    let propData = [];
    let distinctProperties = [];
    let dealsData
    for (let props of properties) {
      console.log(props.userId);

       dealsData = await dealsModel.distinct("propertyId", {
        propertyId: props._id,
      });
console.log("delasdee",dealsData,dealsData.length)
      if (dealsData.length>0) {
        console.log("delasdee1",dealsData,dealsData.length)

        const distinctCustomers = await dealsModel.aggregate([
          { $match: { propertyId: dealsData } },
          {
            $group: {
              _id: "$customerId",
            },
          },
          {
            $project: {
              _id: 0,
              customerId: "$_id",
            },
          },
        ]);

        if (props.propertyType === "Layout") {
          propData.push({
            // ...props._doc,
            accountId: props.propertyId,
            country: props.layoutDetails.address.country,
            district: props.layoutDetails.address.district,
            pincode: props.layoutDetails.address.pincode,
            village: props.layoutDetails.address.village,
            mandal: props.layoutDetails.address.mandal,
            state: props.layoutDetails.address.state,
            propertyName: props.layoutDetails.layoutTitle,
            propertyType: props.propertyType,
            propertyId: props._id,
            customerCount: distinctCustomers.length,
            images: props.uploadPics,
          });
        } else if (props.propertyType === "Commercial") {
          console.log("propabcdCom", props.propertyId);

          propData.push({
            // ...props._doc,
            accountId: props.propertyId,
            country: props.propertyDetails.landDetails.address.country,
            district: props.propertyDetails.landDetails.address.district,
            pincode: props.propertyDetails.landDetails.address.pincode,
            village: props.propertyDetails.landDetails.address.village,
            mandal: props.propertyDetails.landDetails.address.mandal,
            state: props.propertyDetails.landDetails.address.state,
            customerCount: distinctCustomers.length,
            images: props.propertyDetails.uploadPics,

            propertyName: props.propertyTitle,
            propertyType: props.propertyType,
            propertyId: props._id,
          });
        } else if (props.propertyType === "Residential") {
          // property=await residentialModel.find({_id:props.propertyId})

          if (property.length > 0) {
            propData.push({
              // ...props._doc,
              accountId: props.propertyId,
              country: props.address.country,
              district: props.address.district,
              pincode: props.address.pincode,
              village: props.address.village,
              mandal: props.address.mandal,
              state: props.address.state,
              customerCount: distinctCustomers.length,
              images: props.propPhotos,

              propertyName: props.propertyDetails.apartmentName,
              propertyType: props.propertyType,
              propertyId: props._id,
            });
          }
        } else {
          propData.push({
            //  ... props._doc,
            accountId: props.propertyId,
            country: props.address.country,
            district: props.address.district,
            pincode: props.address.pincode,
            village: props.address.village,
            mandal: props.address.mandal,
            state: props.address.state,
            customerCount: distinctCustomers.length,
            images: props.landDetails.images,

            propertyName: props.landDetails.title,
            propertyType: props.propertyType,
            propertyId: props._id,
          });
        }
      }
    }
    if (propData.length > 0) {
      res.status(200).json({ data: propData, status: true });
    } else {
      res.status(409).json({ message: "No Data Found", status: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const searchPropertyDeals = async (req, res) => {
  try {

    let page=req.query.page
    let limit=req.query.limit

    let text=req.params.text;
    let propertyId=req.params.propertyId;

    let regex = new RegExp(text, "i");
     
    let requestQuery = {};
       if(text)
       {
        requestQuery.$or = [
          { firstName: { $regex: regex } },
          { lastname: { $regex: regex } },
          { accountId: { $regex: regex } },
          { district: { $regex: regex } },
        ];
       }

let customerDetails=[]
       if(page)
       {
        let offset=(page-1)*limit
          customerDetails = await userModel.find({ ...requestQuery }).skip(offset).limit(limit);

       }
       else
       {
          customerDetails = await userModel.find({ ...requestQuery });

       }
 let propDeals=[]
       for(let customer of customerDetails)
       {
        const dealsData=await dealsModel.find({customerId:customer._id,propertyId:propertyId})
            const users=await userModel.find({_id:customer._id})
            const user1=await userModel.find({_id:customer._id}) 
          console.log("dealsData",dealsData)
if(dealsData.length>0)
{
        propDeals.push({
          dealId: dealsData[0]._id,
          dealStatus:dealsData[0].dealStatus,
          customerId: dealsData[0].customerId,
          propertyId: dealsData[0].propertyId,
          propertyName: dealsData[0].propertyName,
          propertyType: dealsData[0].propertyType,
          intresetIn: dealsData[0].interestIn,
          comments: dealsData[0].comments,
          sellingStatus: dealsData[0].sellingStatus,
          customer: users[0],
          agent: user1[0],

        });
      }
       }
 
       if(propDeals.length>0)
       {
        res.status(200).json({data:propDeals,status:true})

        }
       else
       {
        res.status(409).json({message:"No data found",status:false})
       }

   } catch (error) {
    console.log(error)
    res.status(500).json("Internal Server Error")
   }
};


const getCustomerDealsFilters = async (req, res) => {
  try {
    const { text, userId } = req.params;
    let page=req.query.page
    let limit=req.query.limit

    let deals=[]
    // Fetch deals for the given userId
    if(page)
    {
      let offset=(page-1)*limit
        deals = await dealsModel.find({ userId }).skip(offset).limit(limit).sort({ createdAt: -1 });

    }
     else
     {
        deals = await dealsModel.find({ userId }).sort({ createdAt: -1 });

     }
 
    if (!deals.length) {
      return res.status(200).json([]);
    }

    let dealsData = [];
    let seenDeals = new Set();

    for (let deal of deals) {
      const { propertyId, propertyType, agentId } = deal;
      const dealKey = `${userId}_${propertyId}`;

      // Skip duplicate deals
      if (seenDeals.has(dealKey)) continue;
      seenDeals.add(dealKey);

      // Fetch property data dynamically based on propertyType
      let propertyData;
      switch (propertyType) {
        case "Commercial":
          propertyData = await commercialModel.findOne({ _id: propertyId });

          break;
        case "Layout":
          propertyData = await layoutModel.findOne({ _id: propertyId });
          break;
        case "Residential":
          propertyData = await residentialModel.findOne({ _id: propertyId });
          break;
        case "Agricultural land":
          propertyData = await fieldModel.findOne({ _id: propertyId });
          break;
        default:
          propertyData = await fieldModel.findOne({ _id: propertyId });
          break;
      }

      // Skip if property doesn't exist
      if (!propertyData) continue;

      // Check if the text matches any relevant field
      const addressFields = [
        propertyData.address?.state,
                propertyData.address?.district,
                propertyData.address?.mandal,
                propertyData.address?.village,
                propertyData.landDetails?.title,
                propertyData.layoutDetails?.layoutTitle ,
                propertyData?.propertyId,
                propertyData?.propertyTitle ,
              
        propertyData?.propertyTitle || propertyData.landDetails?.title || propertyData.layoutDetails?.layoutTitle,

      ];
      const isMatch = addressFields.some((field) =>
        field?.toLowerCase().includes(text.toLowerCase())
      );

      if (!isMatch) continue; // Skip if no match found

      // Fetch related agent data
      const agentData = await userModel.findOne({ _id: agentId }, { password: 0 });

      // Prepare response structure
      const data = {
        deal,
        property: propertyData,
        agent: agentData,
        agentName: `${agentData?.firstName || ""} ${agentData?.lastName || ""}`.trim(),
      };

      dealsData.push(data);
    }

    res.status(200).json(dealsData);
  } catch (error) {
    console.error("Error in getCustomerDealsFilters:", error);
    res.status(500).json("Internal Server Error");
  }
};



// 
const adminDeals = async (req, res) => {
  try {
    const role = req.user.user.role;
    const roleId=req.query;
    let deals = [];

    // Extract filter parameters from request query
    const { text } = req.query;
    let baseQuery = { isActive: { $ne: "-1" } };

    let page = req.query.page;
    let limit = req.query.limit;
    if(role===0){

     deals=await dealsModel.find();
    let dealsData = [];
    let customerIdsSeen = new Set(); // To track customer IDs that have already been processed

    for (let deal of deals) {
      let customerId = deal.customerId;
      let propertyId = deal.propertyId;
      let propertyType = deal.propertyType;
      let agentId = deal.agentId;
      let csrId=deal.csrId;
      

      // Check if the customer ID has already been processed
      if (customerIdsSeen.has(customerId)) {
        continue;
      }

      // Add the current customerId to the seen set
      customerIdsSeen.add(customerId);

      // Fetch customer data and apply filters if text is provided
      const customerData = await userModel.findOne(
        {
          _id: customerId,
          ...(text && {
            $or: [
              { firstName: { $regex: text, $options: "i" } },
              { lastName: { $regex: text, $options: "i" } },
              { accountId: { $regex: text, $options: "i" } },
              { district: { $regex: text, $options: "i" } },
            ],
          }),
        },
        { password: 0 }
      );

      // Skip if customerData doesn't match the filters
      if (!customerData) {
        continue;
      }

      const agentData = await userModel.findOne({ _id: agentId }, { password: 0 });

      let propertyData;
      if (propertyType === "Commercial") {
        propertyData = await commercialModel.findOne({ _id: propertyId });
      } else if (propertyType === "Layout") {
        propertyData = await layoutModel.findOne({ _id: propertyId });
      } else if (
        propertyType === "Residential" ||
        propertyType === "Flat" ||
        propertyType === "House"
      ) {
        propertyData = await residentialModel.findOne({ _id: propertyId });
      } else {
        propertyData = await fieldModel.findOne({ _id: propertyId });
      }

      const custDeals = await dealsModel.distinct("propertyId", {
        customerId: customerData._id,
      });

      // Prepare response data
      let data = {
        deal: deal,
        customer: customerData,
        property: propertyData,
        agent: agentData,
        totalDeals: custDeals.length,
      };

      dealsData.push(data);
    }

    }
    console.log("dealsData", dealsData);
    res.status(200).json(dealsData);
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};




module.exports = {
  getAllProperties,
  createDeal,
  getExisitingCustomer,
  getDeals,
  getAgentDealings,
  changeInterest,
  closeDeal,
  getClosedDeals,
  getCustomerDeals,
  getCustomerDealsFilters,
  getIntresetedCustomers,
  getDistinctProperties,
  getPropertyDeals,
  getDealsRelatedAgents,
  getIntrestedProperties,
  dealSearchOnCustomer,
  dealsSearchOnProps,
  searchPropertyDeals,
  getCustomerDealsFiltered,
  startDeal,
};
