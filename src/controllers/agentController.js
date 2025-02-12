const agentRatingModel = require("../models/agentRatingModel");
const userModel = require("../models/userModel");
const bookingModel = require("../models/bookingModel");
const { validateId } = require("../helpers/bookingValidation");
const {
  agentRatingValidation,
  validateLocation,
} = require("../helpers/agentRatingValidation");
const fieldModel = require("../models/fieldModel");
const commercialModel = require("../models/commercialModel");
const residentialModel = require("../models/residentialModel");
const layoutModel = require("../models/layoutModel");

//insertAgentRatings
const insertAgentRatings = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    // const firstName = req.user.user.firstName;
    // const lastName = req.user.user.lastName;
    const status = 1;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is missing in request", success: false });
    }

    const ratingsData = {
      userId,
      // firstName,
      // lastName,
      status,
      ...req.body, // Spread the rest of the fields from the request body
    };

    const result = await agentRatingValidation.validateAsync(ratingsData);
   
    const ratings = new agentRatingModel(result);
    await ratings.save();
    res
      .status(201)
      .json({ message: "rating details added successfully", success: true });
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: "Error inserting rating details", error });
  }
};

//api for agent to view his own ratings
const getAgentRatingsByAgentId = async (req, res) => {
  try {
    const agentId = req.user.user.userId;
    const ratings = await agentRatingModel.find({ agentId: agentId });

    if (ratings.length === 0) {
      return res.status(404).json({ message: "No ratings found" });
    }
    const updatedRatings = await Promise.all(
      ratings.map(async (rating) => {
        // Fetch user details based on userId
        const user = await userModel.findById(
          rating.userId,
          "firstName lastName role"
        );

        // Add the user details to the rating result
        return {
          ...rating.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
      })
    );
    res.status(200).json(updatedRatings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//api for displaying ratings of an agent, agentId is sent through path params
const getAgentRatings = async (req, res) => {
  try {
    const result = await validateId.validateAsync(req.params);
    const agentId = result.agentId;
    const ratings = await agentRatingModel.find({ agentId: agentId });
    if (ratings.length === 0) {
      return res.status(404).json({ message: "No ratings found" });
    }
    const updatedRatings = await Promise.all(
      ratings.map(async (rating) => {
        // Fetch user details based on userId
        const user = await userModel.findById(
          rating.userId,
          "firstName lastName role"
        );

        // Add the user details to the rating result
        return {
          ...rating.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
      })
    );
    res.status(200).json(updatedRatings);
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: error.message });
  }
};

//get agents by location(village)

const getAgentsbyloc = async (req, res) => {
  try {
    const result = await validateLocation.validateAsync(req.params);
    let location = result.location;
    const agent = result.userId;
    const userId = req.user.user.userId; // Get userId from the token
    const buyerRole = 3; // Define buyer role
    const role = 1; // Role 1 is for agents

    // Format the location string (capitalize first letter)
    location =
      location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

    if (!location) {
      return res.status(400).json({ message: "Location not found " });
    }

    const fields =
      "profilePicture firstName lastName pinCode city email phoneNumber";

    // Find agents with the specified role and location
    // const users = await userModel.find({ role, city: location }, fields);
    const users = await userModel.find(
      { role, city: location, _id: { $ne: agent } },
      fields
    );
    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No agents found for this location" });
    }

    // Iterate over users and check the booking status for each agent
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // Check if the current agent has any bookings by the user with the given buyerRole and userId
        const booking = await bookingModel
          .findOne({
            userId: userId,
            agentId: user._id, // The current agent's user ID
            role: buyerRole, // Buyer role
          })
          .sort({ createdAt: -1 }); // Sort by createdAt in descending order to get the latest record

        // Add booking status to the user object
        const status = booking ? booking.status : 9; // If booking exists, use its status; otherwise, default to 0

        const ratings = await agentRatingModel.find({ agentId: user._id });
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = (sumRatings / totalRatings).toFixed(2); // Calculate the average rating
        const rating = ratings ? avgRating : null;

        //get the rating status of an user for a particular agent
        const isRating = await agentRatingModel.findOne({
          agentId: user._id,
          userId: userId,
        });
        const ratingStatus = isRating ? isRating.status : 0;

        // Return the user object with the added status field
        return {
          ...user.toObject(), // Convert the Mongoose document to a plain object
          status, // Add the status field
          rating,
          ratingStatus,
        };
      })
    );
    const sortedUsers = usersWithStatus.sort((a, b) => {
      return parseFloat(b.rating) - parseFloat(a.rating);
    });
    // Return the modified users with their booking status
    res.status(200).json(sortedUsers);
  } catch (error) {
    if (error.isJoi === true)
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    console.error("Error fetching agents:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// get agents by mandal
const getAgentsbyMandal = async (req, res) => {
  try {
    const result = await validateLocation.validateAsync(req.params);
    let location = result.location;
    const agent = result.userId;
    const userId = req.user.user.userId; // Get userId from the token
    const buyerRole = 3; // Define buyer role
    const role = 1; // Role 1 is for agents

    // Format the location string (capitalize first letter)
    location =
      location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

    if (!location) {
      return res.status(400).json({ message: "Location not found in token" });
    }

    const fields =
      "profilePicture firstName lastName pinCode city mandal email phoneNumber";

    // Find agents with the specified role and location
    // const users = await userModel.find({ role, mandal: location }, fields);
    const users = await userModel.find(
      { role, mandal: location, _id: { $ne: agent } },
      fields
    );
    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No agents found for this location" });
    }

    // Iterate over users and check the booking status for each agent
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // Check if the current agent has any bookings by the user with the given buyerRole and userId
        const booking = await bookingModel
          .findOne({
            userId: userId,
            agentId: user._id, // The current agent's user ID
            role: buyerRole, // Buyer role
          })
          .sort({ createdAt: -1 }); // Sort by createdAt in descending order to get the latest record

        // Add booking status to the user object
        const status = booking ? booking.status : 9; // If booking exists, use its status; otherwise, default to 0

        const ratings = await agentRatingModel.find({ agentId: user._id });
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = (sumRatings / totalRatings).toFixed(2); // Calculate the average rating
        const rating = ratings ? avgRating : null;

        //get the rating status of an user for a particular agent
        const isRating = await agentRatingModel.findOne({
          agentId: user._id,
          userId: userId,
        });
        const ratingStatus = isRating ? isRating.status : 0;

        // Return the user object with the added status field
        return {
          ...user.toObject(), // Convert the Mongoose document to a plain object
          status, // Add the status field
          rating,
          ratingStatus,
        };
      })
    );
    const sortedUsers = usersWithStatus.sort((a, b) => {
      return parseFloat(b.rating) - parseFloat(a.rating);
    });
    // Return the modified users with their booking status
    res.status(200).json(sortedUsers);
  } catch (error) {
    if (error.isJoi === true)
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    console.error("Error fetching agents:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// get agents by district
const getAgentsbyDistrict = async (req, res) => {
  try {
    const result = await validateLocation.validateAsync(req.params);
    let location = result.location;
    const agent = result.userId;
    const userId = req.user.user.userId; // Get userId from the token
    const buyerRole = 3; // Define buyer role
    const role = 1; // Role 1 is for agents

    // Format the location string (capitalize first letter)
    location =
      location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

    if (!location) {
      return res.status(400).json({ message: "Location not found in token" });
    }

    const fields =
      "profilePicture firstName lastName pinCode city mandal district email phoneNumber";

    // Find agents with the specified role and location
    //const users = await userModel.find({ role, district: location }, fields);
    const users = await userModel.find(
      { role, district: location, _id: { $ne: agent } },
      fields
    );
    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No agents found for this location" });
    }

    // Iterate over users and check the booking status for each agent
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // Check if the current agent has any bookings by the user with the given buyerRole and userId
        const booking = await bookingModel
          .findOne({
            userId: userId,
            agentId: user._id, // The current agent's user ID
            role: buyerRole, // Buyer role
          })
          .sort({ createdAt: -1 }); // Sort by createdAt in descending order to get the latest record

        // Add booking status to the user object
        const status = booking ? booking.status : 9; // If booking exists, use its status; otherwise, default to 0

        const ratings = await agentRatingModel.find({ agentId: user._id });
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = (sumRatings / totalRatings).toFixed(2); // Calculate the average rating
        const rating = ratings ? avgRating : null;

        //get the rating status of an user for a particular agent
        const isRating = await agentRatingModel.findOne({
          agentId: user._id,
          userId: userId,
        });
        const ratingStatus = isRating ? isRating.status : 0;

        // Return the user object with the added status field
        return {
          ...user.toObject(), // Convert the Mongoose document to a plain object
          status, // Add the status field
          rating,
          ratingStatus,
        };
      })
    );
    const sortedUsers = usersWithStatus.sort((a, b) => {
      return parseFloat(b.rating) - parseFloat(a.rating);
    });
    // Return the modified users with their booking status
    res.status(200).json(sortedUsers);
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.error("Error fetching agents:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// const getAgentSales = async (req, res) => {
//   try {
//     const agentData = await userModel.find({ role: 1 });
//     let stats = [];

//     for (const agent of agentData) {
//       const bookings = await bookingModel.find({ agentId: agent.id });

//        let totalPrice = 0;
//        let totalSales = 0;
//       let propertyData = [];
//       bookings.forEach(async (prop) => {
//         let propertyId = prop.propertyId;
//          if (prop.propertyType === "Agricultural land") {
//           propertyData = await fieldModel.findById({ _id: propertyId });

//         } else if (prop.propertyType === "Commercial") {
//           propertyData = await commercialModel.findById({ _id: propertyId });

//         } else if (prop.propertyType === "Residential") {
//           propertyData = await residentialModel.findById({
//             _id: propertyId,
//           });

//         } else {
//           propertyData = await layoutModel.findById({
//             _id: propertyId,
//           });

//         }
//         if (propertyData.status === 1) {
//           totalSales += 1;

//           if (propertyData.propertyType === "Agricultural land") {

//             totalPrice += propertyData.landDetails.totalPrice;
//             console.log(totalPrice)
//           } else if (propertyData.propertyType === "Commercial") {
//             if (
//               propertyData.propertyDetails.landDetails.rent.landUsage.length > 0
//             ) {
//               totalPrice +=
//                 propertyData.propertyDetails.landDetails.rent.totalAmount;
//                           console.log(totalPrice);

//             }
//             if (
//               propertyData.propertyDetails.landDetails.sell.landUsage.length > 0
//             ) {
//               totalPrice +=
//                 propertyData.propertyDetails.landDetails.sell.totalAmount;
//                           console.log(totalPrice);

//             }
//           } else if (propertyData.propertyType === "Residential") {
//             totalPrice += propertyData.propertyDetails.totalCost;
//                         console.log(totalPrice);

//           } else {
//             totalPrice += propertyData.layoutDetails.totalAmount;
//                         console.log(totalPrice);

//           }
//         }
//       });
// console.log(totalPrice)
//       let userdata = {
//         agentName: agent.firstName,
//         agentId: agent.id,
//         totalSales: totalSales,
//         totalPrice: totalPrice,
//       };
//       stats.push(userdata);
//     }

//     res.status(200).json(stats);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json("Internal Server Error");
//   }
// };

const getAgentSales = async (req, res) => {
  try {
    const agentData = await userModel.find({ role: 1 }, { password: 0 });
    let stats = [];

    for (const agent of agentData) {
      const bookings = await bookingModel.find({ agentId: agent.id });

      let totalPrice = 0;
      let totalSales = 0;
      let propertyDataPromises = [];

      for (const prop of bookings) {
        const propertyId = prop.propertyId;
        let propertyData;

        // Use a promise to fetch property data based on type
        if (prop.propertyType === "Agricultural land") {
          propertyDataPromises.push(fieldModel.findById({ _id: propertyId }));
        } else if (prop.propertyType === "Commercial") {
          propertyDataPromises.push(
            commercialModel.findById({ _id: propertyId })
          );
        } else if (prop.propertyType === "Residential") {
          propertyDataPromises.push(
            residentialModel.findById({ _id: propertyId })
          );
        } else {
          propertyDataPromises.push(layoutModel.findById({ _id: propertyId }));
        }
      }

      // Wait for all property data to resolve
      const propertyDataList = await Promise.all(propertyDataPromises);

      // Process each property
      for (const propertyData of propertyDataList) {
        if (propertyData.status === 1) {
          totalSales += 1;

          if (propertyData.propertyType === "Agricultural land") {
            totalPrice += propertyData.landDetails.totalPrice;
          } else if (propertyData.propertyType === "Commercial") {
            if (
              propertyData.propertyDetails.landDetails.rent.landUsage.length > 0
            ) {
              totalPrice +=
                propertyData.propertyDetails.landDetails.rent.totalAmount;
            }
            if (
              propertyData.propertyDetails.landDetails.sell.landUsage.length > 0
            ) {
              totalPrice +=
                propertyData.propertyDetails.landDetails.sell.totalAmount;
            }
          } else if (propertyData.propertyType === "Residential") {
            totalPrice += propertyData.propertyDetails.totalCost;
          } else {
            totalPrice += propertyData.layoutDetails.totalAmount;
          }
        }
      }

      // Store agent's statistics
      let userdata = {
        agentName: agent.firstName + " " + agent.lastName,
        agentId: agent.id,
        agentProfile: agent.profilePicture,
        agentLocation: agent.district,
        totalSales: totalSales,
        totalPrice: totalPrice,
      };

      stats.sort((a, b) => b.totalSales - a.totalSales);
      stats.push(userdata);
    }

    // Return the results
    res.status(200).json(stats);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getAgentByDistrict = async (req, res) => {
  try {
    let district = req.params.district;

    const data = await userModel.find({ district, role: 1 }, { password: 0 });

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json("No Agent Found");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const getCsrByDistrict = async (req, res) => {
  try {
    const data = await userModel.find({
      district: req.params.district,
      role: 5,
    }, { password: 0 });
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json("No CSR Found");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const getAllCsr = async (req, res) => {
  try {
    const data = await userModel.find(
      {
        role: 5,
      },
      { password: 0 }
    );
    let result = [];
    for (let csr of data) {
      const agentsData = await userModel.find({ assignedCsr: csr._id }, { password: 0 });

      csr.totalAgents = agentsData.length;
      result.push({ csr, totalAgents: agentsData.length });
    }

    if (data) {
      res.status(200).json(result);
    } else {
      res.status(404).json("No CSR Found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getAllAgents = async (req, res) => {
  try {
    let district = req.params.district;

    const data = await userModel.find({ role: 1 }, { password: 0 });
    let result = [];
    for (let agent of data) {
      let csrData = [];
      if (agent.assignedCsr !== "0") {
        csrData = await userModel.find({
          _id: agent.assignedCsr,
        }, { password: 0 });
      }
      if (csrData.length > 0) {
        agent.assignedCsr = csrData[0].email; // Replace assignedCsr with the CSR's email
      } else {
        console.log(
          `No CSR found for agent with assignedCsr: ${agent.assignedCsr}`
        );
      }

      result.push(agent);
    }
    if (data) {
      res.status(200).json(result);
    } else {
      res.status(404).json("No Agent Found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getCSRAssignedToAgent = async (req, res) => {
  try {
    const agentId = req.user.user.userId;
    const agent = await userModel.findOne({ _id: agentId }, { password: 0 });
   
    if (!agent) {
      return res
        .status(404)
        .json("Agent not found or not assigned to the correct role.");
    }

    const assignedCsrId = agent.assignedCsr;

    if (!assignedCsrId) {
      return res.status(404).json("No CSR assigned to this agent.");
    }
    const csr = await userModel.findOne({ _id: assignedCsrId, role: 5 }, { password: 0 });

    if (!csr) {
      return res
        .status(404)
        .json("CSR not found or not assigned to the correct role.");
    }
    res.status(200).json(csr);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const getAllMarketingAgents = async (req, res) => {
  try {
    let district = req.params.district;

    const data = await userModel.find({ role: 6 }, { password: 0 });

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json("No Agent Found");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

module.exports = {
  insertAgentRatings,
  getAgentRatingsByAgentId, //unused
  getAgentRatings, //unused
  getAgentsbyloc,
  getAgentsbyMandal,
  getAgentsbyDistrict,
  getAgentSales,
  getAgentByDistrict,
  getCsrByDistrict,
  getAllCsr,
  getAllAgents,
  getCSRAssignedToAgent,
  getAllMarketingAgents,
};
