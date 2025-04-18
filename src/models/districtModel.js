const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema({
  district: String,
  mandal: String,
  villages: Array,
});

const districtModel = mongoose.model("districts", districtSchema);

module.exports = districtModel;
