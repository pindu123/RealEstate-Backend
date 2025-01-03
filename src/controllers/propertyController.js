const propertyRatingModel = require("../models/propertyRatingModel");
const residentialModel = require("../models/residentialModel");
const commercialModel = require("../models/commercialModel");
const fieldModel = require("../models/fieldModel");
const layoutModel = require("../models/layoutModel");
const usersModel = require("../models/userModel");
const { propertyRatingSchema } = require("../helpers/propertyRatingValidation");
const {
  validateType,
  validateIdAndType,
  validateIdTypeStatus,
  validateIdUserIdType,
  validateId,
  validateLocation,
  validateSlider,
} = require("../helpers/propertyValidation");
const { response } = require("express");
const locationModel = require("../models/locationModel");

const getPropertiesByLocation = async (req, res) => {
  try {
    const { type, district, mandal, village } = req.params;
    let query = {};

    if (!location) {
      return res
        .status(400)
        .json({ message: "Location parameter is required" });
    }

    // Create a query object

    // Check if the location input is a number (for pinCode)
    if (!isNaN(location)) {
      // Convert to a number if it is numeric
      const pinCode = Number(location);
      query["address.pinCode"] = pinCode;
    } else {
      // Otherwise, search in other fields
      query["$or"] = [
        { "address.village": location },
        { "address.mandal": location },
        { "address.district": location },
        { "address.state": location },
      ];
    }

    // Execute the query
    const properties = await fieldModel.find(query);

    if (properties.length === 0) {
      return res.status(404).json({ message: "No properties found" });
    }

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//getPropertyByUserId
const getPropertiesByUserId = async (req, res) => {
  try {
    const userId = req.params.agentId;  // The userId from the request URL

    // Query all models for properties related to the userId
    const fieldData = await fieldModel.find({ userId: userId });
    const commercialProperties = await commercialModel.find({ userId: userId });
    const layoutProperties = await layoutModel.find({ userId: userId });
    const residentialProperties = await residentialModel.find({ userId: userId });

    // Combine all the properties into one array
    const allProperties = [
      ...fieldData,
      ...commercialProperties,
      ...layoutProperties,
      ...residentialProperties
    ];
    // If no properties are found across all models
    if (allProperties.length === 0) {
      return res.status(404).json({ message: "No properties found" });
    }

    // Return all properties found
    res.status(200).json(allProperties);
  } catch (error) {
    // Handle errors and return a 500 status
    res.status(500).json({ message: error.message });
  }
};


//get all properties ----- for landing page
const getAllProperties = async (req, res) => {
  try {
    // Define arrays to store the different property types
    let fields = [];
    let residentials = [];
    let commercials = [];
    let layouts = [];
    //get count of documnets
    const fieldsCount = await fieldModel.countDocuments();
    const commercialCount = await commercialModel.countDocuments();
    const residentialCount = await residentialModel.countDocuments();
    const layoutCount = await layoutModel.countDocuments();
    let fieldProperties,
      residentialProperties,
      commercialProperties,
      layoutProperties;
    //fetch atmost 8 properties
    if (fieldsCount > 4) {
      fieldProperties = await fieldModel
        .find(
          {},
          {
            "landDetails.images": 1,
            "address.district": 1,
            "landDetails.title": 1,
            "landDetails.size": 1,
            "landDetails.totalPrice": 1,
            propertyType: 1,
          }
        ).sort({createdAt:-1})
        // .limit(4)
     } else {
      // Fetch data from Field properties collection
      fieldProperties = await fieldModel
        .find(
          {},
          {
            "landDetails.images": 1,
            "address.district": 1,
            "landDetails.title": 1,
            "landDetails.size": 1,
            "landDetails.totalPrice": 1,
            propertyType: 1,
          }
        )
        .sort({createdAt:-1});
    }
    // Iterate over field properties and push to the fields array
    fieldProperties.forEach((property) => {
      fields.push({
        propertyId: property.id,
        propertyType: property.propertyType,
        images: property.landDetails.images,
        price: property.landDetails.totalPrice,
        size: property.landDetails.size,
        title: property.landDetails.title,
        district: property.address.district,
      });
    });

    // Fetch data from Residential properties collection
    if (residentialCount > 4) {
      residentialProperties = await residentialModel
        .find(
          {},
          {
            propPhotos: 1,
            "propertyDetails.apartmentName": 1,
            "propertyDetails.flatCost": 1,
            "propertyDetails.flatSize": 1,
            "address.district": 1,
            propertyType: 1,
          }
        )
      .sort({createdAt:-1});
    } else {
      residentialProperties = await residentialModel
        .find(
          {},
          {
            propPhotos: 1,
            "propertyDetails.apartmentName": 1,
            "propertyDetails.flatCost": 1,
            "propertyDetails.flatSize": 1,
            "address.district": 1,
            propertyType: 1,
          }
        )
        .sort({createdAt:-1});
    }
    // Iterate over residential properties and push to the residentials array
    residentialProperties.forEach((property) => {
      residentials.push({
        propertyId: property.id,
        propertyType: property.propertyType,
        images: property.propPhotos,
        price: property.propertyDetails.flatCost,
        size: property.propertyDetails.flatSize,
        title: property.propertyDetails.apartmentName,
        district: property.address.district,
      });
    });

    // Fetch data from Commercial properties collection
    if (commercialCount > 4) {
      commercialProperties = await commercialModel
        .find(
          {},
          {
            "propertyDetails.landDetails": 1,
            "propertyDetails.uploadPics": 1,
            propertyTitle: 1,
            propertyType: 1,
          }
        )
        .sort({createdAt:-1});
    } else {
      commercialProperties = await commercialModel
        .find(
          {},
          {
            "propertyDetails.landDetails": 1,
            "propertyDetails.uploadPics": 1,
            propertyTitle: 1,
            propertyType: 1,
          }
        )
        .sort({createdAt:-1});
    }
    // Iterate over commercial properties and extract necessary fields
    commercialProperties.forEach((property) => {
      let price, size;
      const { landDetails } = property.propertyDetails;

      // Check if land is for sale, rent, or lease
      if (landDetails.sell?.landUsage?.length > 0) {
        price = landDetails.sell.totalAmount;
        size = landDetails.sell.plotSize;
      } else if (landDetails.rent?.landUsage?.length > 0) {
        price = landDetails.rent.totalAmount;
        size = landDetails.rent.plotSize;
      } else if (landDetails.lease?.landUsage?.length > 0) {
        price = landDetails.lease.totalAmount;
        size = landDetails.lease.plotSize;
      }

      commercials.push({
        propertyId: property.id,
        propertyType: property.propertyType,
        images: property.propertyDetails.uploadPics,
        price: price,
        size: size,
        title: property.propertyTitle,
        district: landDetails?.address?.district,
      });
    });

    // Fetch data from Layout properties collection
    if (layoutCount > 4) {
      layoutProperties = await layoutModel
        .find(
          {},
          {
            uploadPics: 1,
            "layoutDetails.layoutTitle": 1,
            "layoutDetails.plotSize": 1,
            "layoutDetails.totalAmount": 1,
            "layoutDetails.address.district": 1,
            propertyType: 1,
          }
        )
        .sort({createdAt:-1});
    } else {
      layoutProperties = await layoutModel
        .find(
          {},
          {
            uploadPics: 1,
            "layoutDetails.layoutTitle": 1,
            "layoutDetails.plotSize": 1,
            "layoutDetails.totalAmount": 1,
            "layoutDetails.address.district": 1,
            propertyType: 1,
          }
        )
        .sort({createdAt:-1});
    }
    // Iterate over layout properties and push to the layouts array
    layoutProperties.forEach((property) => {
      layouts.push({
        propertyId: property.id,
        propertyType: property.propertyType,
        images: property.uploadPics,
        price: property.layoutDetails.totalAmount,
        size: property.layoutDetails.plotSize,
        title: property.layoutDetails.layoutTitle,
        district: property.layoutDetails.address.district,
      });
    });

    // Combine all properties into one array
    const allProperties = [
      ...fields,
      ...residentials,
      ...commercials,
      ...layouts,
    ];

    // Check if any properties were found
    if (allProperties.length === 0) {
      return res.status(404).json({ message: "No properties found" });
    }

    // Send the combined result back to the client
    res.status(200).json(allProperties.sort());
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const getPropertiesByType = async (req, res) => {
  const result = await validateType.validateAsync(req.params);
  const { type } = result; // Get property type from path parameters

  try {
    let properties;

    // Fetch data based on property type
    switch (type.toLowerCase()) {
      case "agricultural":
        properties = await fieldModel.find().exec();
        break;
      case "residential":
        properties = await residentialModel.find().exec();
        break;
      case "commercial":
        properties = await commercialModel.find().exec();
        break;
      case "layout":
        properties = await layoutModel.find().exec();
        break;
      default:
        return res.status(400).json({ message: "Invalid property type" });
    }

    // Check if any properties were found
    if (properties.length === 0) {
      return res.status(404).json({ message: "No properties found" });
    }

    // Send the result back to the client
    res.status(200).json(properties);
  } catch (error) {
    // Handle any errors
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

//insertPropertyRatings
// const insertPropertyRatings = async (req, res) => {
//   try {
//     const userId = req.user.user.userId;
//     const status = 1;
//     if (!userId) {
//       return res
//         .status(400)
//         .json({ message: "User ID is missing in request", success: false });
//     }

//     const { propertyId, propertyType, rating } = req.body;

//     // Insert the new rating into the propertyRating collection
//     const ratingsData = {
//       userId,
//       status,
//       propertyId,
//       propertyType,
//       rating,
//     };
//     const result = await propertyRatingSchema.validateAsync(ratingsData);
//     console.log("result", result);
//     const newRating = new propertyRatingModel(result);
//     await newRating.save();

//     // Fetch all ratings for this propertyId to calculate the average rating
//     const ratings = await propertyRatingModel.find({
//       propertyId: result.propertyId,
//     });
//     const totalRatings = ratings.length;
//     const sumRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
//     const avgRating = (sumRatings / totalRatings).toFixed(2); // Calculate the average rating

//     // Determine which property type schema to update based on the propertyType field
//     let propertyModel;
//     if (result.propertyType === "Agricultural land") {
//       propertyModel = fieldModel;
//     } else if (result.propertyType === "Commercial") {
//       propertyModel = commercialModel;
//     } else if (result.propertyType === "Residential") {
//       propertyModel = residentialModel;
//     } else if (result.propertyType === "Layout") {
//       propertyModel = layoutModel;
//     } else {
//       return res
//         .status(400)
//         .json({ message: "Invalid property type", success: false });
//     }

//     // Update the property rating in the corresponding schema
//     if (propertyModel) {
//       const updatedProperty = await propertyModel.findOneAndUpdate(
//         { _id: result.propertyId }, // Ensure propertyId is the _id
//         { rating: avgRating, ratingCount: totalRatings }, // Update the rating with the new average
//         { new: true } // Return the updated document
//       );
//       if (!updatedProperty) {
//         return res.status(404).json({
//           message: `Property not found in ${result.propertyType} schema`,
//           success: false,
//         });
//       }
//     }

//     res.status(201).json({
//       message: "Rating details added successfully, and average rating updated",
//       success: true,
//       avgRating,
//     });
//   } catch (error) {
//     if (error.isJoi) {
//       console.log(error);
//       return res.status(422).json({
//         status: "error",
//         message: error.details.map((detail) => detail.message).join(", "),
//       });
//     }
//     console.error(
//       "Error inserting rating details or updating the property rating:",
//       error
//     ); // Log the error
//     res.status(500).json({
//       message: "Error inserting rating details or updating the property rating",
//       error,
//     });
//   }
// };

//insertPropertyRatings
const insertPropertyRatings = async (req, res) => {
  let five = 0,
    four = 0,
    three = 0,
    two = 0,
    one = 0;
  try {
    const userId = req.user.user.userId;
    // const firstName = req.user.user.firstName;
    // const lastName = req.user.user.lastName;
    // const role = req.user.user.role;
    const status = 1;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is missing in request", success: false });
    }

    const { propertyId, propertyType, rating } = req.body;

    // Insert the new rating into the propertyRating collection
    const ratingsData = {
      userId,
      // firstName,
      // lastName,
      // role,
      status,
      propertyId,
      propertyType,
      rating,
    };
    const result = await propertyRatingSchema.validateAsync(ratingsData);
    console.log("result", result);
    const newRating = new propertyRatingModel(result);
    await newRating.save();

    // Fetch all ratings for this propertyId to calculate the average rating
    const ratings = await propertyRatingModel
      .find({
        propertyId: result.propertyId,
      })
      .sort({ userId: 1, createdAt: -1 });
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = (sumRatings / totalRatings).toFixed(2); // Calculate the average rating

    // Filter to get only the latest rating per user
    const latestRatings = [];
    const seenUsers = new Set();

    for (const rating of ratings) {
      if (!seenUsers.has(rating.userId)) {
        latestRatings.push(rating);
        seenUsers.add(rating.userId);
      }
    }

    // Count ratings
    latestRatings.forEach((rating) => {
      if (rating.rating >= 4.5) {
        five++;
      } else if (rating.rating >= 3.5 && rating.rating < 4.5) {
        four++;
      } else if (rating.rating >= 2.5 && rating.rating < 3.5) {
        three++;
      } else if (rating.rating >= 1.5 && rating.rating < 2.5) {
        two++;
      } else if (rating.rating >= 0.5 && rating.rating < 1.5) {
        one++;
      }
    });

    const countOfRatings = {
      fiveStar: five,
      fourStar: four,
      threeStar: three,
      twoStar: two,
      oneStar: one,
    };

    // Determine which property type schema to update based on the propertyType field
    let propertyModel;
    if (result.propertyType === "Agricultural land") {
      propertyModel = fieldModel;
    } else if (result.propertyType === "Commercial") {
      propertyModel = commercialModel;
    } else if (result.propertyType === "Residential") {
      propertyModel = residentialModel;
    } else if (result.propertyType === "Layout") {
      propertyModel = layoutModel;
    } else {
      return res
        .status(400)
        .json({ message: "Invalid property type", success: false });
    }

    // Update the property rating in the corresponding schema
    if (propertyModel) {
      const updatedProperty = await propertyModel.findOneAndUpdate(
        { _id: result.propertyId }, // Ensure propertyId is the _id
        {
          rating: avgRating,
          ratingCount: totalRatings,
          countOfRatings: countOfRatings,
        }, // Update the rating with the new average
        { new: true } // Return the updated document
      );
      if (!updatedProperty) {
        return res.status(404).json({
          message: `Property not found in ${result.propertyType} schema`,
          success: false,
        });
      }
      console.log(updatedProperty);
    }

    res.status(201).json({
      message: "Rating details added successfully, and average rating updated",
      success: true,
      avgRating,
      countOfRatings,
    });
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.error(
      "Error inserting rating details or updating the property rating:",
      error
    ); // Log the error
    res.status(500).json({
      message: "Error inserting rating details or updating the property rating",
      error,
    });
  }
};

//get property ratings
//api for displaying ratings of a property, propertyId is sent through path params
const getPropertyRatings = async (req, res) => {
  try {
    const result = await validateId.validateAsync(req.params);
    const { propertyId } = result;
    console.log(propertyId);
    const ratings = await propertyRatingModel.find({ propertyId: propertyId });
    if (ratings.length === 0) {
      return res.status(404).json({ message: "No ratings found" });
    }
    const updatedRatings = await Promise.all(
      ratings.map(async (rating) => {
        // Fetch user details based on userId
        const user = await usersModel.findById(
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

// add filters based on location,propertySize,propertyType, maxPrice and minPrice, sizeUnit,
// const getPropertiesById = async (req, res) => {
//   try {
//     const result = await validateIdAndType.validateAsync(req.params);
//     const { propertyType, propertyId } = result;
//     let properties;

//     if (propertyType === "Agricultural" || propertyType==="Agricultural land") {
//       properties = await fieldModel.findOne({ _id: propertyId });
//     } else if (propertyType === "Residential") {
//       properties = await residentialModel.findOne({ _id: propertyId });
//     } else if (propertyType === "Layout") {
//       properties = await layoutModel.findOne({ _id: propertyId });
//     } else {
//       properties = await commercialModel.findOne({ _id: propertyId });
//     }

//     if (!properties) {
//       return res.status(404).json({ message: "No properties found" });
//     }

//     const agent = await usersModel.findById(properties.userId);
//     if (!agent) {
//       return res.status(404).json({ message: "Agent not found" });
//     }
//     properties = {
//       ...properties._doc,
//       agentName: agent.firstName + " " + agent.lastName,
//       agentNumber: agent.phoneNumber,
//       agentEmail: agent.email,
//       agentCity: agent.city,
//       agentProfilePicture: agent.profilePicture,
//     };
//     console.log(properties);
//     res.status(200).json(properties);
//   } catch (error) {
//     if (error.isJoi) {
//       console.log(error);
//       return res.status(422).json({
//         status: "error",
//         message: error.details.map((detail) => detail.message).join(", "),
//       });
//     }
//     res.status(500).json({ message: error.message });
//   }
// };


const getPropertiesById = async (req, res) => {
  try {
    // Validate incoming request parameters
    const result = await validateIdAndType.validateAsync(req.params);
    const { propertyType, propertyId } = result;
    
    // Initial property search by propertyId and type
    let properties;
    if (propertyType === "Agricultural" || propertyType === "Agricultural land") {
      properties = await fieldModel.findOne({ _id: propertyId });
    } else if (propertyType === "Residential") {
      properties = await residentialModel.findOne({ _id: propertyId });
    } else if (propertyType === "Layout") {
      properties = await layoutModel.findOne({ _id: propertyId });
    } else {
      properties = await commercialModel.findOne({ _id: propertyId });
    }

    // If no properties found based on propertyId
    if (!properties) {
      return res.status(404).json({ message: "No properties found" });
    }

    // Agent details fetching
    const agent = await usersModel.findById(properties.userId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Prepare the property data with agent details
    properties = {
      ...properties._doc,
      agentName: agent.firstName + " " + agent.lastName,
      agentNumber: agent.phoneNumber,
      agentEmail: agent.email,
      agentCity: agent.city,
      agentProfilePicture: agent.profilePicture,
    };

    // Now we handle additional filtering based on query params like location, size, price
    const { location, propertySize, sizeUnit, maxPrice, minPrice } = req.query;
    let filterCriteria = { _id: propertyId, status: 0 }; // Only show available properties

    // Location-based filtering
    if (location) {
      filterCriteria.$or = [
        { 'propertyDetails.landDetails.address.district': location },
        { 'layoutDetails.address.district': location },
        { 'address.district': location }
      ];
    }

    // Property size filtering
    if (propertySize) {
      filterCriteria.$or = filterCriteria.$or || [];
      filterCriteria.$or.push(
        { 'propertyDetails.landDetails.sell.plotSize': propertySize },
        { 'propertyDetails.landDetails.rent.plotSize': propertySize },
        { 'propertyDetails.landDetails.lease.plotSize': propertySize },
        { 'layoutDetails.plotSize': propertySize },
        { 'propertyDetails.flatSize': propertySize },
        { 'landDetails.size': propertySize }
      );
    }

    // Size unit filtering
    if (sizeUnit) {
      filterCriteria.$or = filterCriteria.$or || [];
      filterCriteria.$or.push(
        { 'propertyDetails.landDetails.sell.sizeUnit': sizeUnit },
        { 'propertyDetails.landDetails.rent.sizeUnit': sizeUnit },
        { 'propertyDetails.landDetails.lease.sizeUnit': sizeUnit },
        { 'layoutDetails.sizeUnit': sizeUnit },
        { 'propertyDetails.sizeUnit': sizeUnit },
        { 'landDetails.sizeUnit': sizeUnit }
      );
    }

    // Price range filtering
    if (maxPrice && minPrice) {
      filterCriteria.$or = filterCriteria.$or || [];
      filterCriteria.$or.push(
        { 'landDetails.totalPrice': { $gte: minPrice, $lte: maxPrice } },
        { 'layoutDetails.totalAmount': { $gte: minPrice, $lte: maxPrice } },
        { 'propertyDetails.landDetails.sell.totalAmount': { $gte: minPrice, $lte: maxPrice } },
        { 'propertyDetails.landDetails.rent.totalAmount': { $gte: minPrice, $lte: maxPrice } },
        { 'propertyDetails.landDetails.lease.totalAmount': { $gte: minPrice, $lte: maxPrice } },
        { 'propertyDetails.totalCost': { $gte: minPrice, $lte: maxPrice } }
      );
    }

    // Applying additional filter criteria
    let filteredProperties;
    if (propertyType === "Agricultural" || propertyType === "Agricultural land") {
      filteredProperties = await fieldModel.findOne(filterCriteria);
    } else if (propertyType === "Residential") {
      filteredProperties = await residentialModel.findOne(filterCriteria);
    } else if (propertyType === "Layout") {
      filteredProperties = await layoutModel.findOne(filterCriteria);
    } else {
      filteredProperties = await commercialModel.findOne(filterCriteria);
    }

    // If no properties found after additional filtering
    if (!filteredProperties) {
      return res.status(409).json({ message: "No properties found with the applied filters" });
    }

    // Combine original and filtered data if necessary
    properties = {
      ...filteredProperties._doc,
      agentName: agent.firstName + " " + agent.lastName,
      agentNumber: agent.phoneNumber,
      agentEmail: agent.email,
      agentCity: agent.city,
      agentProfilePicture: agent.profilePicture,
    };

    // Sending final response
    res.status(200).json(properties);

  } catch (error) {
    // Error handling
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


// const getPropertiesById = async (req, res) => {
//   try {
//     // const result = await validateIdAndType.validateAsync(req.params);
//     const { propertyType, propertyId } = req.params;
//     const { location, propertySize, sizeUnit, maxPrice, minPrice } = req.query; 
//     let filterCriteria = { _id: propertyId, status: 0 };  
    
//     if (location) {
//       filterCriteria.$or = [
//         { 'propertyDetails.landDetails.address.district': location },
//         { 'layoutDetails.address.district': location },
//         { 'address.district': location }
//       ];
//     }
    
//     if (propertyType) {
//       filterCriteria.propertyType = propertyType;
//     }
    
//     if (propertySize) {
//       filterCriteria.$or = filterCriteria.$or || [];  
//       filterCriteria.$or.push(
//         { 'propertyDetails.landDetails.sell.plotSize': propertySize },
//         { 'propertyDetails.landDetails.rent.plotSize': propertySize },
//         { 'propertyDetails.landDetails.lease.plotSize': propertySize },
//         { 'layoutDetails.plotSize': propertySize },
//         { 'propertyDetails.flatSize': propertySize },
//         { 'landDetails.size': propertySize }
//       );
//     }

//     if (sizeUnit) {
//       filterCriteria.$or = filterCriteria.$or || [];
//       filterCriteria.$or.push(
//         { 'propertyDetails.landDetails.sell.sizeUnit': sizeUnit },
//         { 'propertyDetails.landDetails.rent.sizeUnit': sizeUnit },
//         { 'propertyDetails.landDetails.lease.sizeUnit': sizeUnit },
//         { 'layoutDetails.sizeUnit': sizeUnit },
//         { 'propertyDetails.sizeUnit': sizeUnit },
//         { 'landDetails.sizeUnit': sizeUnit }
//       );
//     }
    
//     if (maxPrice && minPrice) {
//       filterCriteria.$or = filterCriteria.$or || [];
//       filterCriteria.$or.push(
//         { 'landDetails.totalPrice': { $gte: minPrice, $lte: maxPrice } },
//         { 'layoutDetails.totalAmount': { $gte: minPrice, $lte: maxPrice } },
//         { 'propertyDetails.landDetails.sell.totalAmount': { $gte: minPrice, $lte: maxPrice } },
//         { 'propertyDetails.landDetails.rent.totalAmount': { $gte: minPrice, $lte: maxPrice } },
//         { 'propertyDetails.landDetails.lease.totalAmount': { $gte: minPrice, $lte: maxPrice } },
//         { 'propertyDetails.totalCost': { $gte: minPrice, $lte: maxPrice } }
//       );
//     }
    
//     let properties;
//     if (propertyType === "Agricultural" || propertyType === "Agricultural land") {
//       properties = await fieldModel.findOne(filterCriteria);
//     } else if (propertyType === "Residential") {
//       properties = await residentialModel.findOne(filterCriteria);
//     } else if (propertyType === "Layout") {
//       properties = await layoutModel.findOne(filterCriteria);
//     } else {
//       properties = await commercialModel.findOne(filterCriteria);
//     }
    
//     if (!properties) {
//       return res.status(409).json({ message: "No properties found" });
//     }
    
//     const agent = await usersModel.findById(properties.userId);
//     if (!agent) {
//       return res.status(409).json({ message: "Agent not found" });
//     }

//     properties = {
//       ...properties._doc,
//       agentName: agent.firstName + " " + agent.lastName,
//       agentNumber: agent.phoneNumber,
//       agentEmail: agent.email,
//       agentCity: agent.city,
//       agentProfilePicture: agent.profilePicture,
//     };
//     console.log(properties);
//     res.status(200).json(properties);
    
//   } catch (error) {
//     if (error.isJoi) {
//       console.log(error);
//       return res.status(422).json({
//         status: "error",
//         message: error.details.map((detail) => detail.message).join(", "),
//       });
//     }
//     res.status(500).json({ message: error.message });
//   }
// };

//mark a property as sold(1)
// Controller method to update status to 1 based on propertyId and type


const updatePropertyStatus = async (req, res) => {
  const result = await validateIdTypeStatus.validateAsync(req.body);
  const { propertyId, propertyType, status } = result;
  let model;
  // Determine the model based on type
  switch (propertyType.toLowerCase()) {
    case "residential":
      model = residentialModel;
      break;
    case "commercial":
      model = commercialModel;
      break;
    case "agricultural land":
      model = fieldModel;
      break;
    case "layout":
      model = layoutModel;
      break;
    default:
      return res.status(400).json({ error: "Invalid property type specified" });
  }

  try {
    let updateData = { status: status };

    // If propertyType is layout and status is 1, set availablePlots to 0
    if (propertyType.toLowerCase() === "layout" && status === 1) {
      updateData["layoutDetails.availablePlots"] = 0;
    }
    // Update the document with the specified propertyId
    const updatedResult = await model.findByIdAndUpdate(
      propertyId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedResult) {
      return res.status(404).json({ message: "Property not found" });
    }

    res
      .status(200)
      .json({ message: "Status updated successfully", updatedResult });
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};

//reset the ratings--- for my use
const resetRatings = async (req, res) => {
  try {
    await fieldModel.updateMany(
      {}, // No filter, so all documents are selected
      {
        $set: {
          rating: 0,
          ratingCount: 0,
        },
      }
    );
    await commercialModel.updateMany(
      {}, // No filter, so all documents are selected
      {
        $set: {
          rating: 0,
          ratingCount: 0,
          //status: 0,
        },
      }
    );
    await residentialModel.updateMany(
      {}, // No filter, so all documents are selected
      {
        $set: {
          rating: 0,
          ratingCount: 0,
        },
      }
    );
    await layoutModel.updateMany(
      {}, // No filter, so all documents are selected
      {
        $set: {
          rating: 0,
          ratingCount: 0,
          //status: 0,
        },
      }
    );
    res.send("updated");
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

//get latest props
const getLatestProps = async (req, res) => {
  try {
    const properties = [];
    const field = await fieldModel.find().sort({ _id: -1 }).limit(2);
    const residential = await residentialModel
      .find()
      .sort({ _id: -1 })
      .limit(2);
    const commercial = await commercialModel.find().sort({ _id: -1 }).limit(2);
    const layout = await layoutModel.find().sort({ _id: -1 }).limit(2);
    field[0].propertyType = "Agricultural land";
    residential[0].propertyType = "Residential";
    commercial[0].propertyType = "Commercial";
    layout[0].propertyType = "Layout";
    console.log(field);
    properties.push(field[0]);
    properties.push(field[1]);
    properties.push(commercial[0]);
    properties.push(commercial[1]);
    properties.push(layout[0]);
    properties.push(layout[1]);
    properties.push(residential[0]);
    properties.push(residential[1]);
    if (properties.length === 0) {
      res.status(404).json("Properties not found");
    }
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json("Error fetching properties");
  }
};

//get properties
const getProperty = async (req, res) => {
  try {
    const result = await validateIdUserIdType.validateAsync(req, params);
    const { propertyType, userId, propertyId } = result;
    if (!propertyType) {
      return res.status(404).json("Property type is required");
    }
    const query = {};

    if (userId !== "@") {
      query.userId = req.user.user.userId;
    } else if (propertyId !== "@") {
      query._id = propertyId;
    }
    console.log("query", query);
    let propertyModel;
    if (propertyType === "Agricultural") {
      propertyModel = fieldModel;
    } else if (propertyType === "Commercial") {
      propertyModel = commercialModel;
    } else if (propertyType === "Residential") {
      propertyModel = residentialModel;
    } else if (propertyType === "Layout") {
      propertyModel = layoutModel;
    } else {
      return res
        .status(400)
        .json({ message: "Invalid property type", success: false });
    }

    const properties = await propertyModel
      .find(query)
      .sort({ status: 1, updatedAt: -1 })
      .exec();

    // Check if any properties were found
    if (properties.length === 0) {
      return res.status(404).json({ message: "No properties found" });
    }

    // Send the result back to the client
    res.status(200).json(properties);
  } catch (error) {
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

//api to get the highest price among all the properties
// const maxPrice = async (req, res) => {
//   console.log(req.params);
//   const { type, sell, rent, lease, flat, house } = req.params;

//   try {
//     let result = 0,
//       response;
//     if (type === "agricultural") {
//       const fields = await fieldModel.find();
//       fields.forEach((field) => {
//         let price = field.landDetails.totalPrice;
//         result = Math.max(result, price);
//       });

//       response = result;
//     } else if (type === "residential") {
//       let maxFlat = 0,
//         maxHouse = 0;
//       let maxPrice = 0;

//       result = await residentialModel.find().exec();
//       result.forEach((property) => {
//         let price = 0;
//         const propType = property.propertyDetails.type;
//         price = property.propertyDetails.totalCost;
//         console.log(propType, " ", price);
//         if (!price) {
//           price = 0;
//         }
//         if (propType === "Flat") {
//           maxFlat = Math.max(price, maxFlat);
//         } else if (propType === "House") {
//           maxHouse = Math.max(price, maxHouse);
//         }
//       });
//       if (flat === "flat") {
//         maxPrice = Math.max(maxPrice, maxFlat);
//       }
//       if (house === "house") {
//         maxPrice = Math.max(maxPrice, maxHouse);
//       }
//       if (flat === "@" && house === "@") {
//         maxPrice = Math.max(maxPrice, maxFlat);
//         maxPrice = Math.max(maxPrice, maxHouse);
//       }
//       response = maxPrice > 0 ? maxPrice : 0;
//     } else if (type === "layout") {
//       const plots = await layoutModel.find();
//       plots.forEach((plot) => {
//         result = Math.max(result, plot.layoutDetails.totalAmount);
//       });
//       response = result;
//     } else if (type === "commercial") {
//       let maxSell = 0,
//         maxRent = 0,
//         maxLease = 0;
//       let maxPrice = 0;

//       commercialProperties = await commercialModel
//         .find(
//           {},
//           {
//             "propertyDetails.landDetails": 1,
//           }
//         )
//         .exec();
//       // Iterate over commercial properties and extract necessary fields
//       commercialProperties.forEach((property) => {
//         let price = 0;
//         const { landDetails } = property.propertyDetails;

//         // Check if land is for sale, rent, or lease
//         if (landDetails.sell?.landUsage?.length > 0) {
//           price = landDetails.sell.totalAmount;
//           maxSell = Math.max(maxSell, price);
//         } else if (landDetails.rent?.landUsage?.length > 0) {
//           price = landDetails.rent.totalAmount;
//           maxRent = Math.max(maxRent, price);
//         } else if (landDetails.lease?.landUsage?.length > 0) {
//           price = landDetails.lease.totalAmount;
//           maxLease = Math.max(maxLease, price);
//         }
//       });
//       if (sell === "sell") {
//         maxPrice = Math.max(maxPrice, maxSell);
//       }
//       if (rent === "rent") {
//         maxPrice = Math.max(maxPrice, maxRent);
//       }
//       if (lease === "lease") {
//         maxPrice = Math.max(maxPrice, maxLease);
//       }
//       if (sell === "@" && rent === "@" && lease === "@") {
//         maxPrice = Math.max(maxPrice, maxSell);
//         maxPrice = Math.max(maxPrice, maxRent);
//         maxPrice = Math.max(maxPrice, maxLease);
//       }
//       response = maxPrice > 0 ? maxPrice : 0;
//     } else {
//       return res.status(400).json("Invalid");
//     }

//     console.log(response);
//     return res.status(200).json({ maxPrice: response });
//   } catch (error) {
//     return res.status(500).json("Internal server error");
//   }
// };
const maxPrice = async (req, res) => {
  console.log(req.params);
  const { type, sell, rent, lease, flat, house } = req.params;
  const userId = req.user.user.userId;
  try {
    let result = 0,
      response;
    if (type === "agricultural") {
      const fields = await fieldModel.find({ userId: userId });
      fields.forEach((field) => {
        let price = field.landDetails.totalPrice;
        result = Math.max(result, price);
      });

      response = result;
    } else if (type === "residential") {
      let maxFlat = 0,
        maxHouse = 0;
      let maxPrice = 0;

      result = await residentialModel.find({ userId: userId }).exec();
      result.forEach((property) => {
        let price = 0;
        const propType = property.propertyDetails.type;
        price = property.propertyDetails.totalCost;
        console.log(propType, " ", price);
        if (!price) {
          price = 0;
        }
        if (propType === "Flat") {
          maxFlat = Math.max(price, maxFlat);
        } else if (propType === "House") {
          maxHouse = Math.max(price, maxHouse);
        }
      });
      if (flat === "flat") {
        maxPrice = Math.max(maxPrice, maxFlat);
      }
      if (house === "house") {
        maxPrice = Math.max(maxPrice, maxHouse);
      }
      if (flat === "@" && house === "@") {
        maxPrice = Math.max(maxPrice, maxFlat);
        maxPrice = Math.max(maxPrice, maxHouse);
      }
      response = maxPrice > 0 ? maxPrice : 0;
    } else if (type === "layout") {
      const plots = await layoutModel.find({ userId: userId });
      plots.forEach((plot) => {
        result = Math.max(result, plot.layoutDetails.totalAmount);
      });
      response = result;
    } else if (type === "commercial") {
      let maxSell = 0,
        maxRent = 0,
        maxLease = 0;
      let maxPrice = 0;

      commercialProperties = await commercialModel
        .find(
          { userId: userId },
          {
            "propertyDetails.landDetails": 1,
          }
        )
        .exec();
      // Iterate over commercial properties and extract necessary fields
      commercialProperties.forEach((property) => {
        let price = 0;
        const { landDetails } = property.propertyDetails;

        // Check if land is for sale, rent, or lease
        if (landDetails.sell?.landUsage?.length > 0) {
          price = landDetails.sell.totalAmount;
          maxSell = Math.max(maxSell, price);
        } else if (landDetails.rent?.landUsage?.length > 0) {
          price = landDetails.rent.totalAmount;
          maxRent = Math.max(maxRent, price);
        } else if (landDetails.lease?.landUsage?.length > 0) {
          price = landDetails.lease.totalAmount;
          maxLease = Math.max(maxLease, price);
        }
      });
      if (sell === "sell") {
        maxPrice = Math.max(maxPrice, maxSell);
      }
      if (rent === "rent") {
        maxPrice = Math.max(maxPrice, maxRent);
      }
      if (lease === "lease") {
        maxPrice = Math.max(maxPrice, maxLease);
      }
      if (sell === "@" && rent === "@" && lease === "@") {
        maxPrice = Math.max(maxPrice, maxSell);
        maxPrice = Math.max(maxPrice, maxRent);
        maxPrice = Math.max(maxPrice, maxLease);
      }
      response = maxPrice > 0 ? maxPrice : 0;
    } else {
      return res.status(400).json("Invalid");
    }

    console.log(response);
    return res.status(200).json({ maxPrice: response });
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

// const maxPrice = async (req, res) => {
//   const result = await validateSlider.validateAsync(req.params);
//     const { type, sell, rent, lease, flat, house,sold,unsold } = result;

//     try {
//        let result = 0, unsoldResult = 0, soldResult = 0,
//         response, unsoldResponse, soldResponse;
//       if (type === "agricultural") {
//         const fields = await fieldModel.find();
//         fields.forEach((field) => {
//           let price = field.landDetails.totalPrice;
//           result = Math.max(result, price);

//             if(field.status == 0){
//           unsoldResult = Math.max(unsoldResult,price);
//           }
//           else if(field.status == 1){
//             soldResult = Math.max(soldResult,price);
//           }
//         });

//     unsoldResponse = unsoldResult;
//   soldResponse = soldResult;
//         response = result;
//       } else if (type === "residential") {
//        let maxFlat = 0,
//           maxHouse = 0,maxUnsoldFlat = 0, maxUnsoldHouse = 0, maxsoldFlat = 0, maxsoldHouse = 0;
//         let maxPrice = 0,maxUnsoldPrice = 0, maxsoldPrice = 0;

//         result = await residentialModel.find().exec();
//         result.forEach((property) => {
//           let price = 0;
//           const propType = property.propertyDetails.type;
//           price = property.propertyDetails.totalCost;
//           console.log(propType, " ", price);
//           if (!price) {
//             price = 0;
//           }
//           if (propType === "Flat") {
//             maxFlat = Math.max(price, maxFlat);
//              if(property.status == 0){
//             maxUnsoldFlat = Math.max(price, maxUnsoldFlat);
//             }
//             else{
//               maxsoldFlat = Math.max(price, maxsoldFlat);
//             }
//           } else if (propType === "House") {
//             maxHouse = Math.max(price, maxHouse);
//             if(property.status == 0){
//             maxUnsoldHouse = Math.max(price, maxUnsoldHouse);
//             }
//             else{
//               maxsoldHouse = Math.max(price, maxsoldHouse);
//             }
//           }
//         });
//         if (flat === "flat") {
//           maxPrice = Math.max(maxPrice, maxFlat);
//            maxUnsoldPrice = Math.max(maxUnsoldPrice,maxUnsoldFlat);
//           maxsoldPrice = Math.max(maxsoldPrice,maxsoldFlat);
//         }
//         if (house === "house") {
//           maxPrice = Math.max(maxPrice, maxHouse);
//             maxUnsoldPrice = Math.max(maxUnsoldPrice, maxUnsoldHouse);
//            maxsoldPrice = Math.max(maxsoldPrice, maxsoldHouse);
//         }
//         if (flat === "@" && house === "@") {
//           maxPrice = Math.max(maxPrice, maxFlat);
//           maxPrice = Math.max(maxPrice, maxHouse);
//             maxUnsoldPrice = Math.max(maxUnsoldPrice,maxUnsoldFlat);
//           maxUnsoldPrice = Math.max(maxUnsoldPrice, maxUnsoldHouse);
//           maxsoldPrice = Math.max(maxsoldPrice,maxsoldFlat);
//           maxsoldPrice = Math.max(maxsoldPrice, maxsoldHouse);
//         }
//         response = maxPrice > 0 ? maxPrice : 0;
//           unsoldResponse = maxUnsoldPrice > 0 ? maxUnsoldPrice : 0;
//         soldResponse = maxsoldPrice > 0 ? maxsoldPrice : 0;
//       } else if (type === "layout") {
//         const plots = await layoutModel.find();
//         plots.forEach((plot) => {
//           result = Math.max(result, plot.layoutDetails.totalAmount);
//            if(plot.status == 0){
//           unsoldResult = Math.max(unsoldResult,plot.layoutDetails.totalAmount);
//           }
//           else{
//             soldResult = Math.max(soldResult,plot.layoutDetails.totalAmount)
//           }
//         });
//          unsoldResponse = unsoldResult;
//         soldResponse = soldResult;
//         response = result;
//       } else if (type === "commercial") {
//         let maxSell = 0,
//           maxRent = 0,
//           maxLease = 0, maxUnsoldSell = 0,maxUnsoldRent = 0, maxUnsoldLease = 0,maxsoldSell = 0,maxsoldRent = 0, maxsoldLease = 0;
//         let maxPrice = 0, maxUnsoldPrice =0, maxsoldPrice =0;

//         commercialProperties = await commercialModel
//           .find()
//           .exec();
//         // Iterate over commercial properties and extract necessary fields
//         commercialProperties.forEach((property) => {
//           let price = 0;
//           const { landDetails } = property.propertyDetails;

//           // Check if land is for sale, rent, or lease
//           if (landDetails.sell?.landUsage?.length > 0) {
//             price = landDetails.sell.totalAmount;
//             maxSell = Math.max(maxSell, price);
//             if(property.status == 0){
//             maxUnsoldSell = Math.max(maxUnsoldSell, price);
//             }
//             else{
//               maxsoldSell = Math.max(maxsoldSell, price);
//             }
//           } else if (landDetails.rent?.landUsage?.length > 0) {
//             price = landDetails.rent.totalAmount;
//             maxRent = Math.max(maxRent, price);
//             if(property.status == 0){
//             maxUnsoldRent = Math.max(maxUnsoldRent, price);
//             }
//             else{
//               maxsoldRent = Math.max(maxsoldRent, price);
//             }
//           } else if (landDetails.lease?.landUsage?.length > 0) {
//             price = landDetails.lease.totalAmount;
//             maxLease = Math.max(maxLease, price);
//             if(property.status == 0){
//             maxUnsoldLease = Math.max(maxUnsoldLease, price);
//             }else{
//               maxsoldLease = Math.max(maxsoldLease, price);
//             }
//           }
//         });
//         if (sell === "sell") {
//           maxPrice = Math.max(maxPrice, maxSell);
//            maxUnsoldPrice = Math.max(maxUnsoldPrice,maxUnsoldSell);
//           maxsoldPrice = Math.max(maxsoldPrice,maxsoldSell);
//         }
//         if (rent === "rent") {
//           maxPrice = Math.max(maxPrice, maxRent);
//            maxUnsoldPrice = Math.max(maxUnsoldPrice,maxUnsoldRent);
//            maxsoldPrice = Math.max(maxsoldPrice,maxsoldRent);
//         }
//         if (lease === "lease") {
//           maxPrice = Math.max(maxPrice, maxLease);
//            maxUnsoldPrice = Math.max(maxUnsoldPrice,maxUnsoldLease);
//            maxsoldPrice = Math.max(maxsoldPrice,maxsoldLease);
//         }
//         if (sell === "@" && rent === "@" && lease === "@") {
//           maxPrice = Math.max(maxPrice, maxSell);
//           maxPrice = Math.max(maxPrice, maxRent);
//           maxPrice = Math.max(maxPrice, maxLease);
//            maxUnsoldPrice = Math.max(maxUnsoldPrice,maxUnsoldSell);
//             maxUnsoldPrice = Math.max(maxUnsoldPrice,maxUnsoldRent);
//             maxUnsoldPrice = Math.max(maxUnsoldPrice,maxUnsoldLease);
//             maxsoldPrice = Math.max(maxsoldPrice,maxsoldSell);
//             maxsoldPrice = Math.max(maxsoldPrice,maxsoldRent);
//             maxsoldPrice = Math.max(maxsoldPrice,maxsoldLease);
//         }
//         response = maxPrice > 0 ? maxPrice : 0;
//          unsoldResponse = maxUnsoldPrice > 0 ? maxUnsoldPrice : 0;
//         soldResponse = maxsoldPrice > 0 ? maxsoldPrice : 0;
//       } else {
//         return res.status(400).json("Invalid");
//       }

//       console.log(response);
//       if(unsold === "unsold" && sold === "@"){
//        return res.status(200).json({ maxPrice: unsoldResponse });
//       }
//       else if(sold === "sold" && unsold === "@"){
//         return res.status(200).json({ maxPrice: soldResponse });
//       }
//       return res.status(200).json({ maxPrice: response });
//     } catch (error) {
//      if (error.isJoi) {
//         console.log(error);
//         return res.status(422).json({
//           status: "error",
//           message: error.details.map((detail) => detail.message).join(", "),
//         });
//       }
//       return res.status(500).json("Internal server error");
//     }
//   };
//location filter
// const getPropsByLocation = async (req, res) => {
//   const result = await validateLocation.validateAsync(req.params);
//   const { type, district, mandal, village } = result;
//   try {
//     let query = {},
//       model;
//     if (type === "agriculture") {
//       model = fieldModel;
//       if (district !== "@") {
//         query = {
//           ...query,
//           "address.district": district,
//         };
//       }
//       if (mandal !== "@") {
//         query = {
//           ...query,
//           "address.mandal": mandal,
//         };
//       }
//       if (village !== "@") {
//         query = {
//           ...query,
//           "address.village": village,
//         };
//       }
//     } else if (type === "layout") {
//       model = layoutModel;
//       if (district !== "@") {
//         query = {
//           ...query,
//           "layoutDetails.address.district": district,
//         };
//       }
//       if (mandal !== "@") {
//         query = {
//           ...query,
//           "layoutDetails.address.mandal": mandal,
//         };
//       }
//       if (village !== "@") {
//         query = {
//           ...query,
//           "layoutDetails.address.village": village,
//         };
//       }
//     } else if (type === "residential") {
//       model = residentialModel;
//       if (district !== "@") {
//         query = {
//           ...query,
//           "address.district": district,
//         };
//       }
//       if (mandal !== "@") {
//         query = {
//           ...query,
//           "address.mandal": mandal,
//         };
//       }
//       if (village !== "@") {
//         query = {
//           ...query,
//           "address.village": village,
//         };
//       }
//     } else if (type === "commercial") {
//       model = commercialModel;
//       if (district !== "@") {
//         query = {
//           ...query,
//           "propertyDetails.landDetails.address.district": district,
//         };
//       }
//       if (mandal !== "@") {
//         query = {
//           ...query,
//           "propertyDetails.landDetails.address.mandal": mandal,
//         };
//       }
//       if (village !== "@") {
//         query = {
//           ...query,
//           "propertyDetails.landDetails.address.village": village,
//         };
//       }
//     } else {
//       return res.status(404).json("Invalid property type");
//     }

//     const properties = await model.find(query);
//     if (properties.length === 0) {
//       return res.status(404).json("No properties found");
//     }
//     return res.status(200).json(properties);
//   } catch (error) {
//     if (error.isJoi) {
//       console.log(error);
//       return res.status(422).json({
//         status: "error",
//         message: error.details.map((detail) => detail.message).join(", "),
//       });
//     }
//     res
//       .status(500)
//       .json({ error: error, message: "Error fetching properties" });
//   }
// };

//function to get villages
const getVillages = async () => {
  const villagesData = await locationModel.find({}, { villages: 1 }); // Fetch the entire 'villages' array
  if (villagesData.length === 0) {
    res.status(400).json("Villages not found");
  }
  let villages = [];
  for (let element of villagesData) {
    villages.push(Object.keys(element.villages[0]));
  }
  let villageNames = [];
  for (let village of villages) {
    for (let v of village) {
      villageNames.push(v);
    }
  }
  return villageNames;
};



// for all props
const getPropsByLocation = async (req, res) => {
  const result = await validateLocation.validateAsync(req.params);
  const { type, location } = result;
  console.log(location);
  try {
    if (location === "All") {
      if (type === "agriculture") {
        const props = await fieldModel
          .find()
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "residential") {
        const props = await residentialModel
          .find()
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "layout") {
        const props = await layoutModel
          .find()
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "commercial") {
        const props = await commercialModel
          .find()
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      }
    }

    let isDistrict, isMandal, isVillage;
    isDistrict = await locationModel.find({ district: location });
    isMandal = await locationModel.find({ mandal: location });
    const villages = await getVillages();
    if (villages.includes(location)) {
      isVillage = true;
    }
    if (isDistrict.length === 0 && isMandal.length === 0 && !isVillage) {
      return res.status(404).json("Location not found");
    }

    let query = {},
      model;
    if (type === "agriculture") {
      model = fieldModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "address.village": location,
        };
      }
    } else if (type === "layout") {
      model = layoutModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "layoutDetails.address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "layoutDetails.address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "layoutDetails.address.village": location,
        };
      }
    } else if (type === "residential") {
      model = residentialModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "address.village": location,
        };
      }
    } else if (type === "commercial") {
      model = commercialModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.village": location,
        };
      }
    } else {
      return res.status(404).json("Invalid property type");
    }

    const properties = await model.find(query);
    if (properties.length === 0) {
      return res.status(404).json("No properties found");
    }
    return res.status(200).json(properties);
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res
      .status(500)
      .json({ error: error, message: "Error fetching properties" });
  }
};

// get props by location
const getMyPropsByLocation = async (req, res) => {
  const result = await validateLocation.validateAsync(req.params);
  let { userId } = req.user.user;
  console.log(userId);
  const { type, location } = result;
  console.log(location);
  try {
    if (location === "All") {
      if (type === "agriculture") {
        const props = await fieldModel
          .find({ userId: userId })
          .sort({ status: 1, updatedAt: -1 });
        console.log(props);
        return res.status(200).json(props);
      } else if (type === "residential") {
        const props = await residentialModel
          .find({ userId: userId })
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "layout") {
        const props = await layoutModel
          .find({ userId: userId })
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "commercial") {
        const props = await commercialModel
          .find({ userId: userId })
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      }
    }

    let isDistrict, isMandal, isVillage;
    isDistrict = await locationModel.find({ district: location });
    isMandal = await locationModel.find({ mandal: location });
    const villages = await getVillages();
    if (villages.includes(location)) {
      isVillage = true;
    }
    if (isDistrict.length === 0 && isMandal.length === 0 && !isVillage) {
      return res.status(404).json("Location not found");
    }

    let query = { userId: userId },
      model;
    if (type === "agriculture") {
      model = fieldModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "address.village": location,
        };
      }
    } else if (type === "layout") {
      model = layoutModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "layoutDetails.address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "layoutDetails.address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "layoutDetails.address.village": location,
        };
      }
    } else if (type === "residential") {
      model = residentialModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "address.village": location,
        };
      }
    } else if (type === "commercial") {
      model = commercialModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.village": location,
        };
      }
    } else {
      return res.status(404).json("Invalid property type");
    }

    const properties = await model.find(query);
    if (properties.length === 0) {
      return res.status(404).json("No properties found");
    }
    return res.status(200).json(properties);
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res
      .status(500)
      .json({ error: error, message: "Error fetching properties" });
  }
};

// get maximum sixe among all properties
const maximumSizeForAllProps = async (req, res) => {
  console.log(req.params);
  const result = await validateSlider.validateAsync(req.params);
  const { type, sell, rent, lease, flat, house, sold, unsold } = result;

  try {
    let result = 0,
      unsoldResult = 0,
      soldResult = 0,
      response,
      unsoldResponse,
      soldResponse;
    if (type === "agricultural") {
      const fields = await fieldModel.find();
      fields.forEach((field) => {
        let size = field.landDetails.size;
        console.log(size);
        result = Math.max(result, size);

        if (field.status == 0) {
          unsoldResult = Math.max(unsoldResult, size);
        } else if (field.status == 1) {
          soldResult = Math.max(soldResult, size);
        }
      });
      unsoldResponse = unsoldResult;
      soldResponse = soldResult;
      response = result;
    } else if (type === "residential") {
      let maxFlat = 0,
        maxHouse = 0,
        maxUnsoldFlat = 0,
        maxUnsoldHouse = 0,
        maxsoldFlat = 0,
        maxsoldHouse = 0;
      let maxSize = 0,
        maxUnsoldSize = 0,
        maxsoldSize = 0;

      result = await residentialModel.find().exec();
      result.forEach((property) => {
        let size = 0;
        const propType = property.propertyDetails.type;
        size = property.propertyDetails.flatSize;
        console.log(propType, " ", size);
        if (!size) {
          size = 0;
        }
        if (propType === "Flat") {
          maxFlat = Math.max(size, maxFlat);
          if (property.status == 0) {
            maxUnsoldFlat = Math.max(size, maxUnsoldFlat);
          } else {
            maxsoldFlat = Math.max(size, maxsoldFlat);
          }
        } else if (propType === "House") {
          maxHouse = Math.max(size, maxHouse);
          if (property.status == 0) {
            maxUnsoldHouse = Math.max(size, maxUnsoldHouse);
          } else {
            maxsoldHouse = Math.max(size, maxsoldHouse);
          }
        }
      });
      if (flat === "flat") {
        maxSize = Math.max(maxSize, maxFlat);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldFlat);
        maxsoldSize = Math.max(maxsoldSize, maxsoldFlat);
      }
      if (house === "house") {
        maxSize = Math.max(maxSize, maxHouse);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldHouse);
        maxsoldSize = Math.max(maxsoldSize, maxsoldHouse);
      }
      if (flat === "@" && house === "@") {
        maxSize = Math.max(maxSize, maxFlat);
        maxSize = Math.max(maxSize, maxHouse);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldFlat);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldHouse);
        maxsoldSize = Math.max(maxsoldSize, maxsoldFlat);
        maxsoldSize = Math.max(maxsoldSize, maxsoldHouse);
      }
      response = maxSize > 0 ? maxSize : 0;
      unsoldResponse = maxUnsoldSize > 0 ? maxUnsoldSize : 0;
      soldResponse = maxsoldSize > 0 ? maxsoldSize : 0;
    } else if (type === "layout") {
      const plots = await layoutModel.find();
      plots.forEach((plot) => {
        result = Math.max(result, plot.layoutDetails.plotSize);
        if (plot.status == 0) {
          unsoldResult = Math.max(unsoldResult, plot.layoutDetails.plotSize);
        } else {
          soldResult = Math.max(soldResult, plot.layoutDetails.plotSize);
        }
      });
      unsoldResponse = unsoldResult;
      soldResponse = soldResult;
      response = result;
    } else if (type === "commercial") {
      let maxSell = 0,
        maxRent = 0,
        maxLease = 0,
        maxUnsoldSell = 0,
        maxUnsoldRent = 0,
        maxUnsoldLease = 0,
        maxsoldSell = 0,
        maxsoldRent = 0,
        maxsoldLease = 0;
      let maxSize = 0,
        maxUnsoldSize = 0,
        maxsoldSize = 0;

      commercialProperties = await commercialModel.find().exec();
      // Iterate over commercial properties and extract necessary fields
      commercialProperties.forEach((property) => {
        let size = 0;
        const { landDetails } = property.propertyDetails;

        // Check if land is for sale, rent, or lease
        if (landDetails.sell?.landUsage?.length > 0) {
          size = landDetails.sell.plotSize;
          maxSell = Math.max(maxSell, size);
          if (property.status == 0) {
            maxUnsoldSell = Math.max(maxUnsoldSell, size);
          } else {
            maxsoldSell = Math.max(maxsoldSell, size);
          }
        } else if (landDetails.rent?.landUsage?.length > 0) {
          size = landDetails.rent.plotSize;
          maxRent = Math.max(maxRent, size);
          if (property.status == 0) {
            maxUnsoldRent = Math.max(maxUnsoldRent, size);
          } else {
            maxsoldRent = Math.max(maxsoldRent, size);
          }
        } else if (landDetails.lease?.landUsage?.length > 0) {
          size = landDetails.lease.plotSize;
          maxLease = Math.max(maxLease, size);
          if (property.status == 0) {
            maxUnsoldLease = Math.max(maxUnsoldLease, size);
          } else {
            maxsoldLease = Math.max(maxsoldLease, size);
          }
        }
      });
      if (sell === "sell") {
        maxSize = Math.max(maxSize, maxSell);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldSell);
        maxsoldSize = Math.max(maxsoldSize, maxsoldSell);
      }
      if (rent === "rent") {
        maxSize = Math.max(maxSize, maxRent);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldRent);
        maxsoldSize = Math.max(maxsoldSize, maxsoldRent);
      }
      if (lease === "lease") {
        maxSize = Math.max(maxSize, maxLease);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldLease);
        maxsoldSize = Math.max(maxsoldSize, maxsoldLease);
      }
      if (sell === "@" && rent === "@" && lease === "@") {
        maxSize = Math.max(maxSize, maxSell);
        maxSize = Math.max(maxSize, maxRent);
        maxSize = Math.max(maxSize, maxLease);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldSell);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldRent);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldLease);
        maxsoldSize = Math.max(maxsoldSize, maxsoldSell);
        maxsoldSize = Math.max(maxsoldSize, maxsoldRent);
        maxsoldSize = Math.max(maxsoldSize, maxsoldLease);
      }
      response = maxSize > 0 ? maxSize : 0;
      unsoldResponse = maxUnsoldSize > 0 ? maxUnsoldSize : 0;
      soldResponse = maxsoldSize > 0 ? maxsoldSize : 0;
    } else {
      return res.status(400).json("Invalid");
    }
    console.log(response);
    if (unsold === "unsold" && sold === "@") {
      return res.status(200).json({ maxSize: unsoldResponse });
    } else if (sold === "sold" && unsold === "@") {
      return res.status(200).json({ maxSize: soldResponse });
    }
    return res.status(200).json({ maxSize: response });
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    return res.status(500).json("Internal server error");
  }
};

// max Price among all props
const maxPriceForAllProps = async (req, res) => {
  const { type, sell, rent, lease, flat, house } = req.params;
  try {
    let result = 0,
      response;
    if (type === "agricultural") {
      const fields = await fieldModel.find();
      fields.forEach((field) => {
        let price = field.landDetails.totalPrice;
        result = Math.max(result, price);
      });

      response = result;
    } else if (type === "residential") {
      let maxFlat = 0,
        maxHouse = 0;
      let maxPrice = 0;

      result = await residentialModel.find().exec();
      result.forEach((property) => {
        let price = 0;
        const propType = property.propertyDetails.type;
        price = property.propertyDetails.totalCost;
        if (!price) {
          price = 0;
        }
        if (propType === "Flat") {
          maxFlat = Math.max(price, maxFlat);
        } else if (propType === "House") {
          maxHouse = Math.max(price, maxHouse);
        }
      });
      if (flat === "flat") {
        maxPrice = Math.max(maxPrice, maxFlat);
      }
      if (house === "house") {
        maxPrice = Math.max(maxPrice, maxHouse);
      }
      if (flat === "@" && house === "@") {
        maxPrice = Math.max(maxPrice, maxFlat);
        maxPrice = Math.max(maxPrice, maxHouse);
      }
      response = maxPrice > 0 ? maxPrice : 0;
    } else if (type === "layout") {
      const plots = await layoutModel.find();
      plots.forEach((plot) => {
        result = Math.max(result, plot.layoutDetails.totalAmount);
      });
      response = result;
    } else if (type === "commercial") {
      let maxSell = 0,
        maxRent = 0,
        maxLease = 0;
      let maxPrice = 0;

      commercialProperties = await commercialModel
        .find(
          {},
          {
            "propertyDetails.landDetails": 1,
          }
        )
        .exec();
      // Iterate over commercial properties and extract necessary fields
      commercialProperties.forEach((property) => {
        let price = 0;
        const { landDetails } = property.propertyDetails;

        // Check if land is for sale, rent, or lease
        if (landDetails.sell?.landUsage?.length > 0) {
          price = landDetails.sell.totalAmount;
          maxSell = Math.max(maxSell, price);
        } else if (landDetails.rent?.landUsage?.length > 0) {
          price = landDetails.rent.totalAmount;
          maxRent = Math.max(maxRent, price);
        } else if (landDetails.lease?.landUsage?.length > 0) {
          price = landDetails.lease.totalAmount;
          maxLease = Math.max(maxLease, price);
        }
      });
      if (sell === "sell") {
        maxPrice = Math.max(maxPrice, maxSell);
      }
      if (rent === "rent") {
        maxPrice = Math.max(maxPrice, maxRent);
      }
      if (lease === "lease") {
        maxPrice = Math.max(maxPrice, maxLease);
      }
      if (sell === "@" && rent === "@" && lease === "@") {
        maxPrice = Math.max(maxPrice, maxSell);
        maxPrice = Math.max(maxPrice, maxRent);
        maxPrice = Math.max(maxPrice, maxLease);
      }
      response = maxPrice > 0 ? maxPrice : 0;
    } else {
      return res.status(400).json("Invalid");
    }

    return res.status(200).json({ maxPrice: response });
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

// get maximum size for an agents prop
const maximumSize = async (req, res) => {
  console.log(req.params);
  const result = await validateSlider.validateAsync(req.params);
  const { type, sell, rent, lease, flat, house, sold, unsold } = result;
  const userId = req.user.user.userId;

  try {
    let result = 0,
      unsoldResult = 0,
      soldResult = 0,
      response,
      unsoldResponse,
      soldResponse;
    if (type === "agricultural") {
      const fields = await fieldModel.find({ userId: userId });
      fields.forEach((field) => {
        let size = field.landDetails.size;
        console.log(size);
        result = Math.max(result, size);

        if (field.status == 0) {
          unsoldResult = Math.max(unsoldResult, size);
        } else if (field.status == 1) {
          soldResult = Math.max(soldResult, size);
        }
      });
      unsoldResponse = unsoldResult;
      soldResponse = soldResult;
      response = result;
    } else if (type === "residential") {
      let maxFlat = 0,
        maxHouse = 0,
        maxUnsoldFlat = 0,
        maxUnsoldHouse = 0,
        maxsoldFlat = 0,
        maxsoldHouse = 0;
      let maxSize = 0,
        maxUnsoldSize = 0,
        maxsoldSize = 0;

      result = await residentialModel.find({ userId: userId }).exec();
      result.forEach((property) => {
        let size = 0;
        const propType = property.propertyDetails.type;
        size = property.propertyDetails.flatSize;
        console.log(propType, " ", size);
        if (!size) {
          size = 0;
        }
        if (propType === "Flat") {
          maxFlat = Math.max(size, maxFlat);
          if (property.status == 0) {
            maxUnsoldFlat = Math.max(size, maxUnsoldFlat);
          } else {
            maxsoldFlat = Math.max(size, maxsoldFlat);
          }
        } else if (propType === "House") {
          maxHouse = Math.max(size, maxHouse);
          if (property.status == 0) {
            maxUnsoldHouse = Math.max(size, maxUnsoldHouse);
          } else {
            maxsoldHouse = Math.max(size, maxsoldHouse);
          }
        }
      });
      if (flat === "flat") {
        maxSize = Math.max(maxSize, maxFlat);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldFlat);
        maxsoldSize = Math.max(maxsoldSize, maxsoldFlat);
      }
      if (house === "house") {
        maxSize = Math.max(maxSize, maxHouse);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldHouse);
        maxsoldSize = Math.max(maxsoldSize, maxsoldHouse);
      }
      if (flat === "@" && house === "@") {
        maxSize = Math.max(maxSize, maxFlat);
        maxSize = Math.max(maxSize, maxHouse);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldFlat);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldHouse);
        maxsoldSize = Math.max(maxsoldSize, maxsoldFlat);
        maxsoldSize = Math.max(maxsoldSize, maxsoldHouse);
      }
      response = maxSize > 0 ? maxSize : 0;
      unsoldResponse = maxUnsoldSize > 0 ? maxUnsoldSize : 0;
      soldResponse = maxsoldSize > 0 ? maxsoldSize : 0;
    } else if (type === "layout") {
      const plots = await layoutModel.find({ userId: userId });
      plots.forEach((plot) => {
        result = Math.max(result, plot.layoutDetails.plotSize);
        if (plot.status == 0) {
          unsoldResult = Math.max(unsoldResult, plot.layoutDetails.plotSize);
        } else {
          soldResult = Math.max(soldResult, plot.layoutDetails.plotSize);
        }
      });
      unsoldResponse = unsoldResult;
      soldResponse = soldResult;
      response = result;
    } else if (type === "commercial") {
      let maxSell = 0,
        maxRent = 0,
        maxLease = 0,
        maxUnsoldSell = 0,
        maxUnsoldRent = 0,
        maxUnsoldLease = 0,
        maxsoldSell = 0,
        maxsoldRent = 0,
        maxsoldLease = 0;
      let maxSize = 0,
        maxUnsoldSize = 0,
        maxsoldSize = 0;

      commercialProperties = await commercialModel
        .find({ userId: userId })
        .exec();
      // Iterate over commercial properties and extract necessary fields
      commercialProperties.forEach((property) => {
        let size = 0;
        const { landDetails } = property.propertyDetails;

        // Check if land is for sale, rent, or lease
        if (landDetails.sell?.landUsage?.length > 0) {
          size = landDetails.sell.plotSize;
          maxSell = Math.max(maxSell, size);
          if (property.status == 0) {
            maxUnsoldSell = Math.max(maxUnsoldSell, size);
          } else {
            maxsoldSell = Math.max(maxsoldSell, size);
          }
        } else if (landDetails.rent?.landUsage?.length > 0) {
          size = landDetails.rent.plotSize;
          maxRent = Math.max(maxRent, size);
          if (property.status == 0) {
            maxUnsoldRent = Math.max(maxUnsoldRent, size);
          } else {
            maxsoldRent = Math.max(maxsoldRent, size);
          }
        } else if (landDetails.lease?.landUsage?.length > 0) {
          size = landDetails.lease.plotSize;
          maxLease = Math.max(maxLease, size);
          if (property.status == 0) {
            maxUnsoldLease = Math.max(maxUnsoldLease, size);
          } else {
            maxsoldLease = Math.max(maxsoldLease, size);
          }
        }
      });
      if (sell === "sell") {
        maxSize = Math.max(maxSize, maxSell);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldSell);
        maxsoldSize = Math.max(maxsoldSize, maxsoldSell);
      }
      if (rent === "rent") {
        maxSize = Math.max(maxSize, maxRent);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldRent);
        maxsoldSize = Math.max(maxsoldSize, maxsoldRent);
      }
      if (lease === "lease") {
        maxSize = Math.max(maxSize, maxLease);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldLease);
        maxsoldSize = Math.max(maxsoldSize, maxsoldLease);
      }
      if (sell === "@" && rent === "@" && lease === "@") {
        maxSize = Math.max(maxSize, maxSell);
        maxSize = Math.max(maxSize, maxRent);
        maxSize = Math.max(maxSize, maxLease);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldSell);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldRent);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldLease);
        maxsoldSize = Math.max(maxsoldSize, maxsoldSell);
        maxsoldSize = Math.max(maxsoldSize, maxsoldRent);
        maxsoldSize = Math.max(maxsoldSize, maxsoldLease);
      }
      response = maxSize > 0 ? maxSize : 0;
      unsoldResponse = maxUnsoldSize > 0 ? maxUnsoldSize : 0;
      soldResponse = maxsoldSize > 0 ? maxsoldSize : 0;
    } else {
      return res.status(400).json("Invalid");
    }

    if (unsold === "unsold" && sold === "@") {
      return res.status(200).json({ maxSize: unsoldResponse });
    } else if (sold === "sold" && unsold === "@") {
      return res.status(200).json({ maxSize: soldResponse });
    }
    return res.status(200).json({ maxSize: response });
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    return res.status(500).json("Internal server error");
  }
};

//count of ratings
const getCountOfRatings = async (req, res) => {
  const { propertyId, propertyType } = req.params;
  let five = 0,
    four = 0,
    three = 0,
    two = 0,
    one = 0,
    zero = 0;

  try {
    const ratings = await propertyRatingModel
      .find({ propertyId, propertyType })
      .sort({ userId: 1, createdAt: -1 }); // Sort by userId and createdAt to get latest rating per user

    if (ratings.length === 0) {
      return res.status(404).json("NO RATING FOUND FOR THIS PROPERTY");
    }

    // Filter to get only the latest rating per user
    const latestRatings = [];
    const seenUsers = new Set();

    for (const rating of ratings) {
      if (!seenUsers.has(rating.userId)) {
        latestRatings.push(rating);
        seenUsers.add(rating.userId);
      }
    }

    // Count ratings
    latestRatings.forEach((rating) => {
      if (rating.rating >= 4.5) {
        five++;
      } else if (rating.rating >= 3.5 && rating.rating < 4.5) {
        four++;
      } else if (rating.rating >= 2.5 && rating.rating < 3.5) {
        three++;
      } else if (rating.rating >= 1.5 && rating.rating < 2.5) {
        two++;
      } else if (rating.rating >= 0.5 && rating.rating < 1.5) {
        one++;
      } else {
        zero++;
      }
    });

    const result = {
      fiveStar: five,
      fourStar: four,
      threeStar: three,
      twoStar: two,
      oneStar: one,
      zeroStar: zero,
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};



// const getPropertiesFilter=async(req,res)=>{
//  const location=req.query.location
// const propType=req.query.propertyType
// const size=req.query.propertySize
// const propName=req.query.propName
// let properties=[]
// if(location===null && propType===null && size===null&& propName===null)
// {
// const fields=await fieldModel.find()
// const commercial=await commercialModel.find()
// const layout=await layoutModel.find()
// const residential=await residentialModel.find()

// properties=[...fields,...commercial,...layout,...residential]
// }
// else if(location===null && propType!==null&& propName===null && size===null ){
// if(propType ==="commercial")
// {
// const commercial= await commercialModel.find()
// properties=[...commercial]
// }
// else if(propType==="residential")
// {
//   const residential=await residentialModel.find()
//   properties=[...residential]
// }
// else if(propType==="layout")
// {
//   const layout=await layoutModel.find()
//   properties=[...layout]
// }
// else
// {
//   const fields=await fieldModel.find()
//   properties=[...fields]
// }

// }
// else if(location!==null && propType!==null && propName===null && size===null)
// {
//   if(propType ==="commercial")
//     {
//     const commercial= await commercialModel.find({"address.district":location})
//     properties=[...commercial]
//     }
//     else if(propType==="residential")
//     {
//       const residential=await residentialModel.find({"address.district":location})
//       properties=[...residential]
//     }
//     else if(propType==="layout")
//     {
//       const layout=await layoutModel.find({"layoutDetails.address.district":location})
//       properties=[...layout]
//     }
//     else
//     {
//       const fields=await fieldModel.find({"address.district":location})
//       properties=[...fields]
//     }
// }
// else if(location!==null && propType!==null && propName!==null && size===null)
// {
//   if(propType ==="commercial")
//     {
//     const commercial= await commercialModel.find({"address.district":location,"propertyTitle":propName})
//     properties=[...commercial]
//     }
//     else if(propType==="residential")
//     {
//       const residential=await residentialModel.find({"address.district":location,"propertyDetails.apartmentName":propName})
//       properties=[...residential]
//     }
//     else if(propType==="layout")
//     {
//       const layout=await layoutModel.find({"layoutDetails.address.district":location,"layoutDetails.layoutTitle":propName})
//       properties=[...layout]
//     }
//     else
//     {
//       const fields=await fieldModel.find({"address.district":location,"landDetails.title":propName})
//       properties=[...fields]
//     }
// }
// else if(location!==null && propType!==null && propName!==null && size!==null)
// {
//   if(propType ==="commercial")
//     {
//     const commercial= await commercialModel.find({"address.district":location,"propertyTitle":propName,"propertyDetails.landDetails.sell.plotSize"})
//     properties=[...commercial]
//     }
//     else if(propType==="residential")
//     {
//       const residential=await residentialModel.find({"address.district":location,"propertyDetails.apartmentName":propName})
//       properties=[...residential]
//     }
//     else if(propType==="layout")
//     {
//       const layout=await layoutModel.find({"layoutDetails.address.district":location,"layoutDetails.layoutTitle":propName})
//       properties=[...layout]
//     }
//     else
//     {
//       const fields=await fieldModel.find({"address.district":location,"landDetails.title":propName})
//       properties=[...fields]
//     }
// }

// }


// const propertyFilter=async(req,res)=>{
//   try{
//     const location=req.query.location
//     const propType=req.query.propertyType
//     const size=req.query.propertySize
//     const propName=req.query.propName
//     let properties=[] 
     
//     const fieldData=await fieldModel.find({status:0})
//     const commercialData=await commercialModel.find({status:0})
//     const residential=await residentialModel.find({status:0})
//     const layout=await layoutModel.find({status:0})

//     properties=[...fieldData,...commercialData,...residential,...layout]
//     if(location===null && propType===null && size===null && propName===null)
//     {
//       res.status(200).json(properties)
//     }
//     else if(location===null && propType!==null && size===null && propName===null)
//     {
//       proper=[]

//       for(let props of properties)
//       {
//         if(props.propertyType===propType)
//         {
//           proper.push(props)
//         }
//       }

//       res.status(200).json(proper)
//     }

//     else if(location!==null && propType!==null && size===null && propName===null)
//     {
//       proper=[]

//       for(let props of properties)
//       {
//         if(props.propertyType===propType && (props.propertyDetails.landDetails.address.district===location || props.layoutDetails.address.district===location || props.address.district===location ))
//         {
//           proper.push(props)
//         }
//       }

//       res.status(200).json(proper)
//     }
//   }
  
 
//   catch(error)
//   {
//     console.log(error)
// res.status(500).json("Internal Server Error")
//   }
// }


const propertyFilters = async (req, res) => {
  try {
    console.log(req.query)

    // const { location, propertyType, propertySize, propName } = req.query;
      // Start with empty properties array
    // let filterCriteria = { status: 0 };  // Default to only active properties

    // // Dynamically build query based on query parameters
    // if (location) {
    //   filterCriteria.$or = [
    //     { 'propertyDetails.landDetails.address.district': location },
    //     { 'layoutDetails.address.district': location },
    //     { 'address.district': location }
    //   ];
    // }

    // if (propertyType) {
    //   filterCriteria.propertyType = propertyType;
    // }

    // if (propertySize) {
    //   filterCriteria.propertySize = propertySize;
    // }

    // if (propName) {
    //   filterCriteria.propName = { $regex: propName, $options: 'i' };  // case insensitive search
    // }

    // // Fetch the data from all models with the filter criteria
    // const [fieldData, commercialData, residentialData, layoutData] = await Promise.all([
    //   fieldModel.find({ ...filterCriteria, status: 0 }),
    //   commercialModel.find({ ...filterCriteria, status: 0 }),
    //   residentialModel.find({ ...filterCriteria, status: 0 }),
    //   layoutModel.find({ ...filterCriteria, status: 0 })
    // ]);

    // // Combine the results
    // const properties = [
    //   ...fieldData,
    //   ...commercialData,
    //   ...residentialData,
    //   ...layoutData
    // ];

    res.status(200).json("Hello");
    
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};


 
module.exports = {
  getPropertiesByLocation, //unused
  getPropertiesByUserId, //only fields(unused)
  insertPropertyRatings,
  getPropertiesByType, //by type
  getPropertyRatings, //unused
  getPropertiesById, // by id and type
  getAllProperties, // for landing page
  updatePropertyStatus, // to mark a property as sold and unsold
  resetRatings, // my use
  getLatestProps, // banner
  getProperty, // get property by type or by userId or by propertyId
  maxPrice, //to get max price
  getPropsByLocation, // location filter,
  maximumSize,
  maximumSizeForAllProps,
  maxPriceForAllProps,
  getCountOfRatings,
  getMyPropsByLocation,

  propertyFilters
};
