const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  propertyType: { type: String, required: true, unique: true }, // e.g., "Agricultural", "Commercial"
  sequenceValue: { type: Number, required: true, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;
