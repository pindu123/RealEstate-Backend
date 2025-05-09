const bookingModel = require("../models/bookingModel");
const userModel = require("../models/userModel");
const residentialModel = require("../models/residentialModel");
const commercialModel = require("../models/commercialModel");
const fieldModel = require("../models/fieldModel");
const layoutModel = require("../models/layoutModel");

const mongoose = require("mongoose");
const {
  userBookingSchema,
  agentBookingSchema,
  validateRoleAndStatus,
  validateBookingIdStatus,
  validateIds,
  validateFilterData,
  validateId,
} = require("../helpers/bookingValidation");
const { AgentpushNotification1 } = require("./pushNotifyController");

 const createBooking = async (req, res) => {
  try {
    const {
      userId,
      role,
 
    } = req.user.user;
    const details = {
      userId,
      role,
      ...req.body,
    };
    const result = await userBookingSchema.validateAsync(details);
    const booking = new bookingModel(result);
    await booking.save();
let agentId=req.body.agentId
 
console.log("user",details)

let userData=await userModel.find({_id:userId})

let propType=req.body.propertyType

let propertyId=req.body.propertyId
 
 let prop=[]

   if(propType==="Agricultural land")
   {
    prop=await fieldModel.find({_id:propertyId})
   }
   else if(propType ==="")
   {
    prop=await fieldModel.find({_id:propertyId})

   }

    AgentpushNotification1(
      "Update on Agent Contact",
       `${userData[0].firstName}  has consulted for property`,
      1,
      agentId);
 

    res.status(200).send({ message: "Booked Successfully", success: true });
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.error("Error Details:", error);
    res
      .status(400)
      .send({ message: "Error in booking", error: error.message || error });
  }
};


 const createAgentBooking = async (req, res) => {
  try {
    const { role } = req.user.user; //, firstName, lastName, email, phoneNumber, profilePicture } =
    const agentId = req.user.user.userId;
    console.log(agentId);
    const details = {
      agentId,
      role,
      // firstName,
      // lastName,
      // email,
      // phoneNumber,
      // profilePicture,
      ...req.body,
    };
    const result = await agentBookingSchema.validateAsync(details);
    const booking = new bookingModel(result);
    await booking.save();
    res.status(200).send({ message: "Booked Successfully", success: true });
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.error("Error Details:", error);
    res
      .status(400)
      .send({ message: "Error in booking", error: error.message || error });
  }
};

 const getUserBookings = async (req, res) => {
  try {
    const agentId = req.user.user.userId;  
    const { role } = req.params; 
     console.log(role);
    if (role !== "2" && role !== "3") {
      return res.status(400).json("Incorrect role");
    }
    const bookings = await bookingModel
      .find({ role: role, agentId: agentId })
      .sort({ _id: -1 });
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    const updatedbookings = await Promise.all(
      bookings.map(async (booking) => {
        // Fetch user details based on userId
        const user = await userModel.findById(
          booking.userId,
          "firstName lastName email phoneNumber profilePicture"
        );

        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;

        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { propertyTitle: 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res
            .status(400)
            .json({ message: "Invalid property type", success: false });
        }

        const property = await propertyModel
          .findById(propertyId, projection)
          .exec();

        let title;
        if (
          propertyType === "Agricultural land" &&
          property?.landDetails?.title
        ) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (
          propertyType === "Residential" &&
          property?.propertyDetails?.apartmentName
        ) {
          title = property.propertyDetails.apartmentName;
        } else if (
          propertyType === "Layout" &&
          property?.layoutDetails?.layoutTitle
        ) {
          title = property.layoutDetails.layoutTitle;
        }
        // Add the user details to the rating result
        return {
          ...booking.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          propertyName: title,
          propertyId: propertyId,
        };
      })
    );

    res.status(200).json(updatedbookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 
const getUserBookingsByStatus = async (req, res) => {
  try {
    const agentId = req.user.user.userId;  
    const result = await validateRoleAndStatus.validateAsync(req.params);
    const { role, status } = result;  

    const { page, limit } = req.query;

    let bookings;
    if (parseInt(status) === 3) {
      if (page && limit) {
        let offset = (page - 1) * limit;

        bookings = await bookingModel
          .find({ role: role, agentId: agentId })
          .sort({ _id: -1 })
          .skip(offset)
          .limit(limit);
      } else {
        bookings = await bookingModel
          .find({ role: role, agentId: agentId })
          .sort({ _id: -1 });
      }
    } else {
      if (page && limit) {
        let offset = (page - 1) * limit;

        bookings = await bookingModel
          .find({
            role: role,
            agentId: agentId,
            status: status,
          })
          .sort({ _id: -1 }).skip(offset).limit(limit)
      } else {
        bookings = await bookingModel
          .find({
            role: role,
            agentId: agentId,
            status: status,
          })
          .sort({ _id: -1 });
      }
    }
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    console.log(bookings);
    const updatedbookings = await Promise.all(
      bookings.map(async (booking) => {
        // Fetch user details based on userId
        const user = await userModel.findById(
          booking.userId,
          "firstName lastName email phoneNumber profilePicture"
        );
        console.log(booking.propertyType);
        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;

        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { propertyTitle: 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res
            .status(400)
            .json({ message: "Invalid property type", success: false });
        }

        const property = await propertyModel
          .findById(propertyId, projection)
          .exec();
        let title;
        if (
          propertyType === "Agricultural land" &&
          property?.landDetails?.title
        ) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (
          propertyType === "Residential" &&
          property?.propertyDetails?.apartmentName
        ) {
          title = property.propertyDetails.apartmentName;
        } else if (
          propertyType === "Layout" &&
          property?.layoutDetails?.layoutTitle
        ) {
          title = property.layoutDetails.layoutTitle;
        }
        // Add the user details to the rating result
        return {
          ...booking.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          propertyName: title,
          propertyId: propertyId,
        };
      })
    );
    res.status(200).json(updatedbookings);
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

 
const getBookingByName = async (req, res) => {
  try {
    const agentId = req.user.user.userId; 
    const { role, name } = req.params;  
    const words = name.split(" ");
    const firstName = words[0];
    const lastName = words[1];
    console.log(firstName);
    console.log(lastName);
    const bookings = await bookingModel.find({
      role: role,
      agentId: agentId,
      firstName,
      lastName,
    });
    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "This user did not book any appointment" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 const getAgentBookings = async (req, res) => {
  try {
    const userId = req.user.user.userId; // Extract userId from the token
    const role = 1; //role 1
    const bookings = await bookingModel
      .find({ role: role, userId: userId })
      .sort({ _id: -1 });
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    const updatedbookings = await Promise.all(
      bookings.map(async (booking) => {
        // Fetch user details based on userId
        const user = await userModel.findById(
          booking.agentId,
          "firstName lastName email phoneNumber profilePicture"
        );

        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;

        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { propertyTitle: 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res
            .status(400)
            .json({ message: "Invalid property type", success: false });
        }

        const property = await propertyModel
          .findById(propertyId, projection)
          .exec();

        let title;
        if (
          propertyType === "Agricultural land" &&
          property?.landDetails?.title
        ) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (
          propertyType === "Residential" &&
          property?.propertyDetails?.apartmentName
        ) {
          title = property.propertyDetails.apartmentName;
        } else if (
          propertyType === "Layout" &&
          property?.layoutDetails?.layoutTitle
        ) {
          title = property.layoutDetails.layoutTitle;
        }
        // Add the user details to the rating result
        return {
          ...booking.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          propertyName: title,
          propertyId: propertyId,
        };
      })
    );
    res.status(200).json(updatedbookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 const updateBookingStatus = async (req, res) => {
  try {
    const result = await validateBookingIdStatus.validateAsync(req.params);
    const bookingId = result.bookingId;  
    const status = result.status;  
 
    const updatedBooking = await bookingModel.findByIdAndUpdate(
      bookingId,
      { status: status },
      { new: true }
    );
     if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const resultData = {
      _id: updatedBooking._id,
      status: updatedBooking.status,
    };
    console.log(resultData);


     const bookingData=await  bookingModel.find({_id:bookingId})
     
      const agentData=await userModel.find({_id:bookingData[0].agentId})
       
     let message=""

     if(status===1 || status==="1")
     {
          message=`${agentData[0].firstName} has accepted your request`
     }
     else
     {
      message=`${agentData[0].firstName} has Rejected your request`

     }
     
  AgentpushNotification1(
    "Update on Agent Contact",
     message,
    3,
    bookingData[0].userId
  );


     res
      .status(200)
      .json({ message: "Booking status updated successfully", resultData });
  } catch (error) {
    // Handle any errors
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: "Error updating booking status", error });
  }
};

 const updateStatus = async (req, res) => {
  try {
    // Update all bookings where the status is 2 to 0
    const updatedBookings = await bookingModel.updateMany(
      { status: 1 }, // Condition to find bookings with status 2
      { $set: { status: 0 } } // Update status to 0
    );

    // If no bookings found with the given status
    if (updatedBookings.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "No bookings with status 2 found" });
    }

    // Return the result of the update operation
    res.status(200).json({
      message: "Booking statuses updated successfully",
      updatedCount: updatedBookings.modifiedCount,
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Error updating booking statuses", error });
  }
};

 const getBookingByUserAndAgent = async (req, res) => {
  try {
    const result = await validateIds.validateAsync(req.params);
    console.log("result", result);
    const { userId, agentId } = result; // Extract userId and agentId from path parameters
    // Query to find booking where userId, agentId match and role = 1
    const booking = await bookingModel
      .findOne({
        userId: userId,
        agentId: agentId,
        role: 1, // Ensure role is 1
      })
      .sort({ _id: -1 });
    // If no booking found, return 404
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    console.log(booking);
    // Return the found booking
    res.status(200).json({ message: "Booking found", booking });
  } catch (error) {
    // Handle errors
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: "Error fetching booking", error });
  }
};
 
const rebookingWithAgent = async (req, res) => {
  try {
    const result = await validateIds.validateAsync(req, params);
    const { userId, agentId } = result; // Extract userId and agentId from path parameters

    // Query to find booking where userId, agentId match and role = 1
    const booking = await bookingModel.findOne({
      userId: userId,
      agentId: agentId,
      role: 3, // Ensure role is 3
    });

    // If no booking found, return 404
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    // Fetch user details based on userId
    const user = await userModel.findById(
      booking.userId,
      "firstName lastName email phoneNumber profilePicture"
    );
    // Add the user details to the rating result
    booking = {
      ...booking.toObject(), // Convert Mongoose document to plain object
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
    };
    // Return the found booking
    res.status(200).json({ message: "Booking found", booking });
  } catch (error) {
    // Handle errors
    console.log(error);
    if (error.isJoi === true) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: "Error fetching booking", error });
  }
};

 
const deleteappointment = async (req, res) => {
  try {
    const id = req.params.id;  
    console.log(id);
    const deleted = await bookingModel.findByIdAndDelete(id); 
     if (!deleted) {
      return res.status(404).json({ message: "Booking not found" });
    }

     res.status(200).json({
      message: "Booking deleted",
    });
  } catch (error) {
     res.status(500).json({ message: "Error deleting booking", error });
  }
};
 
const getByFilters = async (req, res) => {
  try {
    const agentId = req.user.user.userId; 
    const result = await validateFilterData.validateAsync(req.params);
    const { role, location, status } = result;  

    let query = {
      role: role,
      agentId: agentId,
    };

    if (parseInt(status) !== 3) {
      query.status = status;
    }

    if (location !== "@") {
      query.location = new RegExp(location, "i");  
    }

    const bookings = await bookingModel.find(query).sort({ _id: -1 });

    if (bookings.length === 0) {
      return res.status(200).json(bookings);
    }
    const updatedbookings = await Promise.all(
      bookings.map(async (booking) => {
        // Fetch user details based on userId
        const user = await userModel.findById(
          booking.userId,
          "firstName lastName email phoneNumber profilePicture"
        );

        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;

        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { propertyTitle: 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res
            .status(400)
            .json({ message: "Invalid property type", success: false });
        }

        const property = await propertyModel
          .findById(propertyId, projection)
          .exec();

        let title;
        if (
          propertyType === "Agricultural land" &&
          property?.landDetails?.title
        ) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (
          propertyType === "Residential" &&
          property?.propertyDetails?.apartmentName
        ) {
          title = property.propertyDetails.apartmentName;
        } else if (
          propertyType === "Layout" &&
          property?.layoutDetails?.layoutTitle
        ) {
          title = property.layoutDetails.layoutTitle;
        }
        // Add the user details to the rating result
        return {
          ...booking.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          propertyName: title,
          propertyId: propertyId,
        };
      })
    );

    res.status(200).json(updatedbookings);
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

 const getBookingByFilters = async (req, res) => {
  try {
    const userId = req.user.user.userId; // Extract userId from the token
    const { name, status } = req.params;
     let bookings;
    if (name === "@") {
      if (parseInt(status) === 3) {
        bookings = await bookingModel
          .find({ role: 1, userId: userId })
          .sort({ _id: -1 });
      } else {
        bookings = await bookingModel
          .find({
            role: 1,
            userId: userId,
            status: status,
          })
          .sort({ _id: -1 });
      }
    } else {
      const words = name.split(" ");
      let firstName = words[0];
      let lastName = words[1];
      console.log(firstName);
      console.log(lastName);
      if (parseInt(status) === 3) {
        bookings = await bookingModel
          .find({
            role: 1,
            userId: userId,
            firstName,
            lastName,
          })
          .sort({ _id: -1 });
      } else {
        bookings = await bookingModel
          .find({
            role: 1,
            userId: userId,
            status: status,
            firstName,
            lastName,
          })
          .sort({ _id: -1 });
      }
    }
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 const getBuyerBookings = async (req, res) => {
  try {
    const userId = req.user.user.userId; // Extract userId from the token
    const role = 3; // Role for buyer
    const fields =
      "agentId date timing location status createdAt updatedAt propertyId propertyType";

    // Fetch the bookings for the given user and role
    const bookings = await bookingModel
      .find({ role: role, userId: userId })
      .select(fields)
      .sort({ _id: -1 });
    console.log("bookings", bookings);
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    const fields2 = "firstName lastName phoneNumber email profilePicture role";

    // Use Promise.all to process each booking
    const updatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const agentId = booking.agentId;

        // Check if agentId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
          // If invalid, return booking without agentDetails
          return {
            ...booking._doc, // Spread the original booking data
            agentDetails: null, // Set agentDetails to null for invalid agentId
          };
        }

        // Fetch agent details using valid ObjectId
        const agentDetails = await userModel
          .findOne({ _id: agentId })
          .select(fields2);

        // const status = booking.status;
        // if (status === 2) {
        //   // Find the record created around the time of the current booking's updatedAt
        //   const timeMargin = 5 * 60 * 1000; // 5 minutes in milliseconds
        //   const createdAtNearUpdatedAt = await bookingModel
        //     .findOne({
        //       userId: userId,
        //       role: 1,
        //       agentId: agentId,
        //       createdAt: {
        //         $gte: new Date(booking.updatedAt.getTime() - timeMargin),
        //         $lte: new Date(booking.updatedAt.getTime() + timeMargin),
        //       },
        //     })
        //     .select("date timing location createdAt updatedAt");

        //   if (createdAtNearUpdatedAt) {
        //     return {
        //       ...booking._doc, // Handle Mongoose document format
        //       firstName: agentDetails.firstName,
        //       lastName: agentDetails.lastName,
        //       phoneNumber: agentDetails.phoneNumber,
        //       email: agentDetails.email,
        //       profilePicture: agentDetails.profilePicture,
        //       newDate: createdAtNearUpdatedAt.date,
        //       newTime: createdAtNearUpdatedAt.timing,
        //       newLocation: createdAtNearUpdatedAt.location,
        //       newCreatedAt: createdAtNearUpdatedAt.createdAt,
        //       newUpdatedAt: createdAtNearUpdatedAt.updatedAt,
        //     };
        //   }
        // }

        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;

        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { propertyTitle: 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res
            .status(400)
            .json({ message: "Invalid property type", success: false });
        }

        const property = await propertyModel
          .findById(propertyId, projection)
          .exec();

        let title;
        if (
          propertyType === "Agricultural land" &&
          property?.landDetails?.title
        ) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (
          propertyType === "Residential" &&
          property?.propertyDetails?.apartmentName
        ) {
          title = property.propertyDetails.apartmentName;
        } else if (
          propertyType === "Layout" &&
          property?.layoutDetails?.layoutTitle
        ) {
          title = property.layoutDetails.layoutTitle;
        }

        // Attach the agent details to the booking
        return {
          ...booking._doc, // Handle Mongoose document format
          firstName: agentDetails.firstName,
          lastName: agentDetails.lastName,
          phoneNumber: agentDetails.phoneNumber,
          email: agentDetails.email,
          profilePicture: agentDetails.profilePicture,
          propertyName: title,
        };
      })
    );
    console.log("bookings.................", updatedBookings);
    // Send the updated bookings with agent details attached
    res.status(200).json(updatedBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

 const getBuyerReqForAgent = async (req, res) => {
  const userId = req.user.user.userId;
  const role = 3;
  try {
    const result = await validateId.validateAsync(req.params);
    const { agentId } = result;
    const fields =
      "date timing location status createdAt updatedAt propertyId propertyType";
    const requests = await bookingModel
      .find({ userId: userId, role: role, agentId: agentId }, fields)
      .sort({ _id: -1 });
    if (requests.length === 0) {
      return res.status(404).json("No bookings found");
    }

    const newBookings = await Promise.all(
      requests.map(async (booking) => {
        // if (booking.status === 2) {
        //   const timeMargin = 5 * 60 * 1000; // 5 minutes in milliseconds
        //   const createdAtNearUpdatedAt = await bookingModel
        //     .findOne({
        //       userId: userId,
        //       role: 1,
        //       agentId: agentId,
        //       createdAt: {
        //         $gte: new Date(booking.updatedAt.getTime() - timeMargin),
        //         $lte: new Date(booking.updatedAt.getTime() + timeMargin),
        //       },
        //     })
        //     .select("date timing location createdAt updatedAt");

        //   if (createdAtNearUpdatedAt) {
        //     return {
        //       ...booking._doc, // Handle Mongoose document format
        //       newDate: createdAtNearUpdatedAt.date,
        //       newTime: createdAtNearUpdatedAt.timing,
        //       newLocation: createdAtNearUpdatedAt.location,
        //       newCreatedAt: createdAtNearUpdatedAt.createdAt,
        //       newUpdatedAt: createdAtNearUpdatedAt.updatedAt,
        //       propertyName: title
        //     };
        //   }
        // }

        let propertyModel;
        let projection = {};
        let propertyType = booking.propertyType;
        let propertyId = booking.propertyId;

        if (propertyType === "Agricultural land") {
          propertyModel = fieldModel;
          projection = { "landDetails.title": 1 }; // Include the field
        } else if (propertyType === "Commercial") {
          propertyModel = commercialModel;
          projection = { propertyTitle: 1 }; // Include the field
        } else if (propertyType === "Residential") {
          propertyModel = residentialModel;
          projection = { "propertyDetails.apartmentName": 1 }; // Include the field
        } else if (propertyType === "Layout") {
          propertyModel = layoutModel;
          projection = { "layoutDetails.layoutTitle": 1 }; // Include the field
        } else {
          return res
            .status(400)
            .json({ message: "Invalid property type", success: false });
        }

        const property = await propertyModel
          .findById(propertyId, projection)
          .exec();

        let title;
        if (
          propertyType === "Agricultural land" &&
          property?.landDetails?.title
        ) {
          title = property.landDetails.title;
        } else if (propertyType === "Commercial" && property?.propertyTitle) {
          title = property.propertyTitle;
        } else if (
          propertyType === "Residential" &&
          property?.propertyDetails?.apartmentName
        ) {
          title = property.propertyDetails.apartmentName;
        } else if (
          propertyType === "Layout" &&
          property?.layoutDetails?.layoutTitle
        ) {
          title = property.layoutDetails.layoutTitle;
        }

        return {
          ...booking._doc,
          propertyName: title,
        };
      })
    );

    res.status(200).json(newBookings);
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: "Error fetching details", error: error });
  }
};

 const totalReqsForProp = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const reqsCount = await bookingModel.countDocuments({
      propertyId,
      role: 3,
    });
    res.status(200).json(reqsCount);
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

const reqsCountFromABuyer = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const bookings = await bookingModel
      .find({ propertyId, role: 3 })
      .sort({ updatedAt: -1, _id: -1 });
    let users = [];
    const result = await Promise.all(
      bookings.map(async (booking) => {
        if (!users.includes(booking.userId)) {
          users.push(booking.userId);
        } else {
          return null;
        }

        const user = await userModel.findOne({ _id: booking.userId });
        const buyerName = user
          ? `${user.firstName} ${user.lastName}`
          : "Unknown User";
        const bookCount = await bookingModel.countDocuments({
          propertyId,
          userId: booking.userId,
          role: 3,
        });
        return {
          buyerId: booking.userId,
          buyerName: buyerName,
          bookingsCount: bookCount,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        };
      })
    );
    let finalresult = [];
    result.forEach((res1) => {
      if (res1 !== null) {
        finalresult.push(res1);
      }
    });
    res.status(200).json(finalresult);
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

const getCurrentAppointments = async (req, res) => {
  try {
    let currentDate = new Date();
 
    let agentId = req.user.user.userId;

    const appointments = await bookingModel.find({
      agentId: agentId,
      date: currentDate,
    });

    if (appointments.length > 0) {
      res.status(200).json(appointments);
    } else {
      res.status(404).json("No Appointments");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

module.exports = {
   createBooking,
  getAgentBookings,
  rebookingWithAgent,
  getBuyerBookings,
  getBuyerReqForAgent,

  updateBookingStatus,  
  createAgentBooking,
  getUserBookings,
  getBookingByUserAndAgent,
  getBookingByFilters,

  //filter
  getByFilters, //agent filter
  getUserBookingsByStatus, //unused
  getBookingByName, //unused

  // for my use
  updateStatus,
  deleteappointment,
  totalReqsForProp,
  reqsCountFromABuyer,

  getCurrentAppointments,
}; // Export as an object
