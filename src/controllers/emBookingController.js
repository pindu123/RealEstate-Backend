const { clientBookingSchema, validateBookingIdStatus } = require("../helpers/emBookingValidation");
const emBookingModel = require("../models/emBookingModel");
const estateModel = require("../models/estateModel");
const userModel = require("../models/userModel");


//api for a client to book appointment with agent
const createBooking = async (req, res) => {
    try {
      const {
        userId,
        role
      } = req.user.user;
      console.log(userId);
      const details = {
        clientId:userId,
        role,
        ...req.body,
      };
      const result = await clientBookingSchema.validateAsync(details);
      const booking = new emBookingModel(result);
      await booking.save();
      res.status(200).send({ message: "Appointment Booked with an agent Successfully", success: true });
    } catch (error) {
      if (error.isJoi === true){
        console.log(error);
        return res.status(422).json({
          status: "error",
          message: error.details.map((detail) => detail.message).join(", "),
        });}
      console.error("Error Details:", error);
      res
        .status(400)
        .send({ message: "Error in booking", error: error.message || error });
    }
  };

  // get all requests sent to agent from client
  const getClientRequests = async(req,res)=>{
    try{
    const userId = req.user.user.userId;
    const requests = await emBookingModel.find({clientId:userId}).sort({_id:-1});
    if(!requests){
    return res.status(400).json('No requests found for this user');
    }
    const finalRequests = await Promise.all(
        requests.map(async (booking) => {
    const user = await userModel.findById(booking.agentId, 'firstName lastName email phoneNumber profilePicture'); 
    if(!user)
    {
    return booking.toObject();
    }
    const estate = await estateModel.findById(booking.estId);
    console.log(estate);
    return {
    ...booking.toObject(),
    estate:estate,
     firstName: user.firstName,
                lastName: user.lastName,
                  email: user.email,
                  phoneNumber: user.phoneNumber,
                  profilePicture: user.profilePicture
    }     
        }
  )
  )
  
    return res.status(200).json(finalRequests);
    }
    catch(error){
    return res.status(500).json("Internal server error");
    }
    }


    //get all client requests- agent side
    const getAllRequests = async(req,res)=>{
        try{
        const userId = req.user.user.userId;
        const requests = await emBookingModel.find({agentId:userId}).sort({_id:-1});
        if(!requests){
        return res.status(400).json('No requests found for this user');
        }
        const finalRequests = await Promise.all(
            requests.map(async (booking) => {
        const user = await userModel.findById(booking.clientId, 'firstName lastName email phoneNumber profilePicture'); 
        if(!user)
        {
        return booking.toObject();
        }
        console.log(booking.estId);
        const estate = await estateModel.findById(booking.estId);
        console.log(estate);
        return {
        ...booking.toObject(),
        estate:estate,
         firstName: user.firstName,
                    lastName: user.lastName,
                      email: user.email,
                      phoneNumber: user.phoneNumber,
                      profilePicture: user.profilePicture
        }     
            }
      )
      )
      
        return res.status(200).json(finalRequests);
        }
        catch(error){
        return res.status(500).json("Internal server error");
        }
        }
    

        //update booking status
const updateBookingStatus = async (req, res) => {
    try {
        console.log(req.params);
      const result= await validateBookingIdStatus.validateAsync(req.params);
      console.log(result)
      const bookingId = result.bookingId; // Get bookingId from request parameters
      const status = result.status; // Get status from request body
      // Ensure status is either 0,1,-1
      // Update the booking status
      const updatedBooking = await emBookingModel.findByIdAndUpdate(
        bookingId,
        { status: status },
        { new: true }
      );
      // If no booking found with the given id
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      const resultData = {
        _id: updatedBooking._id,
        status: updatedBooking.status,
      };
      console.log(resultData);
      // Return the updated booking
      res
        .status(200)
        .json({ message: "Booking status updated successfully", resultData });
    } catch (error) {
      // Handle any errors
      if (error.isJoi === true){
        console.log(error);
        return res.status(422).json({
          status: "error",
          message: error.details.map((detail) => detail.message).join(", "),
        });}
      res.status(500).json({ message: "Error updating booking status", error });
    }
  };
  
  
    
  module.exports = {createBooking, getClientRequests, getAllRequests, updateBookingStatus}