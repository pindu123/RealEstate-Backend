
const emInterestModel = require("../models/emInterestModel");
const {interestSchema, removeInterestValidationSchema} = require('../helpers/emInterestValidation');

// Add a property to the interests
const addToInterests = async (req, res) => {
    try {
      const { userId, role } = req.user.user;
      const wishlistDetailsData = {
        userId, 
        ...req.body, 
      };
      // Validate the data using Joi
      const validatedData = await interestSchema.validateAsync(wishlistDetailsData, { abortEarly: false });
      // Destructure the necessary fields from the validated data
      console.log(validatedData);
      const { estId, status = 1 } = validatedData;
  
      // Check if the property is already in the user's wishlist
      const propertyCheck = await emInterestModel.findOne({
        estId: estId,
        userId: userId,
      });
  
      if (propertyCheck) {
        return res.status(409).json({
          message: "Property is already added to interested list",
          success: false,
        });
      }
  
      // Create the wishlist object
      const wishlist = new emInterestModel(validatedData);
  
      // Save the wishlist item to the database
      await wishlist.save();
  
      res.status(201).json({
        message: "Property added to interests successfully",
        success: true,
      });
    } catch (error) {
      if (error.isJoi) {
        // Handle Joi validation errors
        return res.status(422).json({
          message: "Validation error",
          details: error.details.map(err => err.message), // Collect all validation error messages
          success: false,
        });
      }
      // Handle any other errors
      console.error("Error adding property to interests:", error);
      res.status(500).json({
        message: "Error adding property to interests",
        error,
        success: false,
      });
    }
  };


  //remove from interests
  const removeFromInterests = async (req, res) => {
    try {
      // Validate the request params (propertyId)
      const { error } = removeInterestValidationSchema.validate(req.params);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
  
      const userId = req.user.user.userId; // User ID from the token
      const { estId } = req.params; // Property ID from params
  
      // Find and delete the wishlist item
      const deletedItem = await emInterestModel.findOneAndDelete({
        userId,
        estId
      });
  
      if (!deletedItem) {
        return res
          .status(404)
          .json({ message: "This Property is not in interests to Delete", success: false });
      }
  
      // Successfully deleted
      res.status(200).json({
        message: "Property removed from interests successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error removing property from interests:", error);
      res
        .status(500)
        .json({ message: "Error removing property from interests", error });
    }
  };

  module.exports = {addToInterests, removeFromInterests}