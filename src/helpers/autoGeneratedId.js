const Counter = require("../models/counterModel");
const fieldModel = require("../models/fieldModel");

const generatePropertyId = async (propertyType) => {
  const prefix = {
    "Agricultural land": "PA",
    "Commercial": "PC",
    "Residential": "PR",
    "Layout": "PL",
  }[propertyType];

  const count = await fieldModel.countDocuments({ propertyType });
  return `${prefix}${count + 1}`;
};


const generateAutoId = async (propertyType) => {
    const prefixMap = {
      "Agricultural land": "PA",
      "Commercial": "PC",
      "Residential": "PR",
      "Layout": "PL",
    };
  
    // Fetch and increment the sequence value
    const counter = await Counter.findOneAndUpdate(
      { propertyType },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true } // Create if not exists
    );
  
    const prefix = prefixMap[propertyType] || "PX"; 
    return `${prefix}${counter.sequenceValue}`;
  };
  