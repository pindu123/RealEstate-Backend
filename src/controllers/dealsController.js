const dealsSchema = require("../helpers/dealsValidation");
const customerModel = require("../models/customerModel");
const dealsModel = require("../models/propertyDealsModel");
const fieldModel = require("../models/fieldModel");
const commercialModel = require("../models/commercialModel");
const residentialModel = require("../models/residentialModel");
const layoutModel = require("../models/layoutModel");

const userModel = require("../models/userModel");
const { customerSchema } = require("../helpers/customerValidation");
const notifyModel = require("../models/notificationModel");
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

const createDeal = async (req, res) => {
  try {

    const {userId,role}=req.user.user
     
    let csrId=0
     

  
    console.log(req.body)
    let result1 = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,

      village: req.body.village,
      state: req.body.state,
      country: req.body.country,

      district: req.body.district,
      mandal: req.body.mandal,
      occupation: req.body.occupation,
      pincode: req.params.pincode,
    };

    const customer = await customerModel.find({ email: req.body.email });
    let customerId;

    if (customer.length === 0) {
      result1 = await customerSchema.validateAsync(result1);
      const customers = new customerModel(result1);
      await customers.save();
      const c = await customerModel.find({ email: req.body.email });
      customerId = c[0]._id.toString();
    } else {
      console.log(customer);
      customerId = customer[0]._id.toString();
    }
    let properties = req.body.properties;

    let messages = [];
    for (let property of properties) {


      if(role===5)
        {
          csrId=userId
        }
    
      if(role===1)
      {
        const agentData=await userModel.find({_id:property.agentId})
        csrId=agentData[0].assignedCsr
      }
      let result = {
        propertyId: property.propertyId,
        propertyName: property.propertyName,
        propertyType: property.propertyType,
        customerId: customerId,
        comments: req.body.comments,
        interestIn: req.body.interestIn,
        csrId:csrId,
        agentId: property.agentId,
      };
      console.log("result",result);
      const result2 = await dealsSchema.validateAsync(result);
      console.log(result2);
      const deals = new dealsModel(result2);

      await deals.save();
    //   let message = {
    //     senderId: req.body.csrId,
    //     receiverId: property.agentId,
    //     message: ` A Deal Has Been Assigned For ${property.propertyName}`,
    //     notifyType: "Deal",
    //   };

    //   messages.push(message);
    // }
    // await notifyModel.insertMany(messages);
    }
    res.status(200).json("Deals Created Successfully");
  } catch (error) {
    if (error.isJoi === true) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getExisitingCustomer = async (req, res) => {
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
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    return res.status(200).json({ success: true, data: getCustomerDetails });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// const getDeals = async (req, res) => {
//   try {
//     const role = req.user.user.role;
//     let csrId = req.user.user.userId;
//     let deals = [];
//     if (role === "5") {
//       deals = await dealsModel.find({ csrId: csrId });
//     } else if(role === "1") {
//       deals = await dealsModel.find({agentId:csrId}); 
//     }else
//     {
//       deals=await dealsModel.find();
//     }

//     let dealsData = [];
//     for (let deal of deals) {
//       let customerId = deal.customerId;
//       let propertyId = deal.propertyId;
//       let propertyType = deal.propertyType;
//       let agentId = deal.agentId;
//       const customerData = await customerModel.find({ _id: customerId });

//       const agentData = await userModel.find({ _id: agentId }, { password: 0 });
//       let propertyData;
//       if (propertyType === "Commercial") {
//         propertyData = await commercialModel.find({ _id: propertyId });
//       } else if (propertyType === "Layout") {
//         propertyData = await layoutModel.find({ _id: propertyId });
//       } else if (
//         propertyType === "Residential" ||
//         propertyType === "Flat" ||
//         propertyType === "House"
//       ) {
//         propertyData = await residentialModel.find({ _id: propertyId });
//       } else {
//         propertyData = await fieldModel.find({ _id: propertyId });
//       }

//       let data = {
//         deal: deal,
//         customer: customerData[0],
//         property: propertyData[0],
//         agent: agentData[0],
//       };

//       dealsData.push(data);
//     }
//     res.status(200).json(dealsData);
//   } catch (error) {
//     res.status(500).json("Internal Server Error");
//   }
// };


const getDeals = async (req, res) => {
  try {
  const role = req.user.user.role;
  let csrId = req.user.user.userId;
  let deals = [];
  
  // Define base query with isActive condition
  const baseQuery = { isActive: { $ne: "-1" } };
  console.log("role",role,csrId)
  if (role === 5) {
  deals = await dealsModel.find({ ...baseQuery, csrId: csrId });
  console.log("deals",deals)
  } 
  
  if (role === 1) {
  deals = await dealsModel.find({ ...baseQuery, agentId: csrId });
  } 
  if(role ===0)
  {
  deals = await dealsModel.find(baseQuery);
  }
  
  let dealsData = [];
  for (let deal of deals) {
  let customerId = deal.customerId;
  let propertyId = deal.propertyId;
  let propertyType = deal.propertyType;
  let agentId = deal.agentId;
  
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
  // response data
  let data = {
  deal: deal,
  customer: customerData[0],
  property: propertyData[0],
  agent: agentData[0]
  };
  
  dealsData.push(data);
  }
  console.log("dealsData",dealsData)
  res.status(200).json(dealsData);
  } catch (error) {
  res.status(500).json("Internal Server Error");
  }
  };
  

const getCustomerDeals= async (req, res) => {
  try {
     let cId = req.params.customerId;
    
    const  deals = await dealsModel.find({ customerId: cId });
   
    let dealsData = [];
    for (let deal of deals) {
      let customerId = deal.customerId;
      let propertyId = deal.propertyId;
      let propertyType = deal.propertyType;
      let agentId = deal.agentId;
      console.log(deal,deal.agentId)
      const customerData = await customerModel.find({ _id: customerId });

      const agentData = await userModel.find({ _id: agentId }, { password: 0 });

      console.log("agentData",agentData)
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
      };

      dealsData.push(data);
    }
    res.status(200).json(dealsData);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};



const getAgentDealings = async (req, res) => {
  try {
    const agentId = req.user.user.userId;
    console.log("Agent ID:", agentId);

    const agentDealings = await dealsModel.find({
      agentId: agentId,
      interestIn: "1",
    });

    if (!agentDealings || agentDealings.length === 0) {
      return res.status(404).json({ message: "No dealings found" });
    }

    const enrichedDealings = await Promise.all(
      agentDealings.map(async (deal) => {
        const customerData = await customerModel.findOne({
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

        return {
          ...deal.toObject(),
          customer: customerData,
          property: propertyData,
        };
      })
    );

    return res.status(200).json({ data: enrichedDealings });
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

const closeDeal = async (req, res) => {
  try {
    const dealId = req.body.dealId;
    const deals = await dealsModel.findById(dealId);
let csrId=deals.csrId
let agentId=deals.agentId
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
    await dealsModel
      .findByIdAndUpdate(dealId, {
        dealStatus: "closed",
        amount: req.body.amount,
        sellingStatus: req.body.sellingStatus,
        comments: deals.comments
          ? deals.comments + ", " + req.body.comments
          : req.body.comments,
      })
   
let message={
  "senderId":agentId,
  "receiverId":csrId,
  "message":`Deal Has Been Closed For ${deals.propertyName}`,
  "notifyType":"Deal"
}

const notify=new notifyModel(message)
await notify.save()
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
      res.status(200).json(deals);
    } else {
      res.status(404).json("No Closed Deals");
    }
  } catch (error) {
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
  getCustomerDeals
};
