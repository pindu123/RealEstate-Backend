// const UnifiedProperty = require("../models/propertyModel");


// exports.createProperty = async (req, res) => {
//   try {
//     const property = new UnifiedProperty(req.body);

//     await property.save();
//     res.status(201).json({ message: "Property created successfully", property });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Get all properties
// exports.getAllProperties = async (req, res) => {
//   try {
//     const properties = await UnifiedProperty.find();
//     res.status(200).json(properties);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get a single property by ID
// exports.getPropertyById = async (req, res) => {
//   try {
//     const property = await UnifiedProperty.findById(req.params.id);
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }
//     res.status(200).json(property);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update a property by ID
// exports.updateProperty = async (req, res) => {
//   try {
//     const property = await UnifiedProperty.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }
//     res.status(200).json({ message: "Property updated successfully", property });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Delete a property by ID
// exports.deleteProperty = async (req, res) => {
//   try {
//     const property = await UnifiedProperty.findByIdAndDelete(req.params.id);
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }
//     res.status(200).json({ message: "Property deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
