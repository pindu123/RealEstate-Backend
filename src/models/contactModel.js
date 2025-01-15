const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  roleName: { type: String, required: true },
  timeOfAvailability: { type: String, required: false },
  callBackStatus: { type: String, required: false },
  comments: { type: String, required: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
