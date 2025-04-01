const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  district: String,
  mandal: String,
  villages: Array,
});

const locationModel = mongoose.model("locations", locationSchema);

module.exports = locationModel;
