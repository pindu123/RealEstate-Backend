const axios = require("axios");
const mongoose = require("mongoose");
const commercialModel = require("../models/commercialModel");
const residentialModel = require("../models/residentialModel");
const layoutModel = require("../models/layoutModel");
const fieldModel = require("../models/fieldModel");

const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
const pageId = process.env.PAGE_ID;

async function getPropertyDetails(propertyIds) {
  let propertyDetails = [];
  for (let propertyId of propertyIds) {
    let property = null;

    if (propertyId.propertyType === "Agricultural land") {
      property = await fieldModel.findById(propertyId._id);
    } else if (propertyId.propertyType === "Commercial") {
      property = await commercialModel.findById(propertyId._id);
    } else if (propertyId.propertyType === "Residential") {
      property = await residentialModel.findById(propertyId._id);
    } else if (propertyId.propertyType === "Layout") {
      property = await layoutModel.findById(propertyId._id);
    }

    if (property) {
      propertyDetails.push(property);
    }
  }

  return propertyDetails;
}

const postInFacebook = async (req, res) => {
  try {
    const { propertyIds, description } = req.body;

    const propertyDetails = await getPropertyDetails(propertyIds);

    let postContent = description + "\n\n";
    let imageUrls = [];
    propertyDetails.forEach((property) => {
      const propertyDetailsObj = property.propertyDetails || {};
      const address = propertyDetailsObj.address || {};

      postContent += `Property Name: ${
        property.propertyTitle || propertyDetailsObj.apartmentName
      }\n`;
      postContent += `Location: ${address.district || "N/A"}, ${
        address.state || "N/A"
      }\n`;
      postContent += `Price: ₹${
        propertyDetailsObj.totalCost ||
        propertyDetailsObj.landDetails?.totalPrice
      }\n`;
      postContent += `Size: ${
        propertyDetailsObj.flatSize || propertyDetailsObj.landDetails?.size
      } ${
        propertyDetailsObj.flatSize
          ? "sq. ft"
          : propertyDetailsObj.landDetails?.sizeUnit || "N/A"
      }\n`;
      postContent += `Description: ${
        propertyDetailsObj.propDesc || propertyDetailsObj.propertyDesc
      }\n\n`;

      // Push the image URL to the imageUrls array
      if (propertyDetailsObj.uploadPics) {
        imageUrls.push(...propertyDetailsObj.uploadPics);
      } else if (propertyDetailsObj.propPhotos) {
        imageUrls.push(...propertyDetailsObj.propPhotos);
      } else if (propertyDetailsObj.images) {
        imageUrls.push(...propertyDetailsObj.images);
      }
    });

    // Post content to Facebook (without image for now)
    const response = await axios.post(
      `https://graph.facebook.com/${pageId}/feed`,
      {
        message: postContent,
        access_token: pageAccessToken,
      }
    );

    // If image URL exists, post the image
    for (let imageUrl of imageUrls) {
      await axios.post(`https://graph.facebook.com/${pageId}/photos`, {
        url: imageUrl, // Use Cloudinary image URL here
        message: postContent, // Optional: You can add message if required
        access_token: pageAccessToken,
      });
    }

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to post to Facebook" });
  }
};

module.exports = {
  postInFacebook,
};
