const propertyRatingModel = require("../models/propertyRatingModel");
const residentialModel = require("../models/residentialModel");
const commercialModel = require("../models/commercialModel");
const fieldModel = require("../models/fieldModel");
const layoutModel = require("../models/layoutModel");
const usersModel = require("../models/userModel");
const { propertyRatingSchema } = require("../helpers/propertyRatingValidation");
const {
  validateType,
  validateIdAndType,
  validateIdTypeStatus,
  validateIdUserIdType,
  validateId,
  validateLocation,
  validateSlider,
} = require("../helpers/propertyValidation");
const { response } = require("express");
const locationModel = require("../models/locationModel");
const userModel = require("../models/userModel");
const { AwsInstance } = require("twilio/lib/rest/accounts/v1/credential/aws");
const dealsModel = require("../models/propertyDealsModel");
const auctionModel = require("../models/auctionModel");
const propertyReservation = require("../models/propertyReservation");

const getPropertiesByLocation = async (req, res) => {
  try {
    const { type, district, mandal, village } = req.params;
    let query = {};

    if (!location) {
      return res
        .status(400)
        .json({ message: "Location parameter is required" });
    }

    if (!isNaN(location)) {
      const pinCode = Number(location);
      query["address.pinCode"] = pinCode;
    } else {
      query["$or"] = [
        { "address.village": location },
        { "address.mandal": location },
        { "address.district": location },
        { "address.state": location },
      ];
    }

    const properties = await fieldModel.find(query);

    if (properties.length === 0) {
      return res.status(409).json({ message: "No properties found" });
    }

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertiesByUserId = async (req, res) => {
  try {
    const {
      text,
      propertyType,
      minPrice,
      maxPrice,
      propertySize,
      sizeUnit,
      location,
    } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const userId = req.params.agentId;
    const offset = (page - 1) * limit;

    const queryFilters = (modelFilters) => {
      let filtersAdded = false;
      modelFilters.$or = [];

      // Create filters for text-based search
      if (text) {
        modelFilters.$or.push(
          { "landDetails.title": { $regex: text, $options: "i" } },
          { "layoutDetails.layoutTitle": { $regex: text, $options: "i" } },
          { "propertyDetails.apartmentName": { $regex: text, $options: "i" } },
          { propertyTitle: { $regex: text, $options: "i" } }
        );
        filtersAdded = true;
      }

      // Add property type filter if provided
      if (propertyType) {
        modelFilters.propertyType = { $regex: propertyType, $options: "i" };
        filtersAdded = true;
      }

      // Add location filters if provided
      if (location) {
        const locationFilter = {
          $or: [
            {
              "layoutDetails.address.district": {
                $regex: location,
                $options: "i",
              },
            },
            {
              "layoutDetails.address.state": {
                $regex: location,
                $options: "i",
              },
            },
            {
              "layoutDetails.address.mandal": {
                $regex: location,
                $options: "i",
              },
            },
            {
              "layoutDetails.address.village": {
                $regex: location,
                $options: "i",
              },
            },
            {
              "propertyDetails.landDetails.address.district": {
                $regex: location,
                $options: "i",
              },
            },
            {
              "propertyDetails.landDetails.address.state": {
                $regex: location,
                $options: "i",
              },
            },
            {
              "propertyDetails.landDetails.address.mandal": {
                $regex: location,
                $options: "i",
              },
            },
            {
              "propertyDetails.landDetails.address.village": {
                $regex: location,
                $options: "i",
              },
            },
            { "address.district": { $regex: location, $options: "i" } },
            { "address.state": { $regex: location, $options: "i" } },
            { "address.mandal": { $regex: location, $options: "i" } },
            { "address.village": { $regex: location, $options: "i" } },
          ],
        };
        modelFilters.$or.push(locationFilter);
        filtersAdded = true;
      }

      // Price range filter
      if (minPrice && maxPrice) {
        modelFilters.$or.push(
          {
            "propertyDetails.totalCost": {
              $gte: parseFloat(minPrice),
              $lte: parseFloat(maxPrice),
            },
          },
          {
            "landDetails.totalPrice": {
              $gte: parseFloat(minPrice),
              $lte: parseFloat(maxPrice),
            },
          },
          {
            "layoutDetails.totalAmount": {
              $gte: parseFloat(minPrice),
              $lte: parseFloat(maxPrice),
            },
          },
          {
            "landDetails.sell.totalAmount": {
              $gte: parseFloat(minPrice),
              $lte: parseFloat(maxPrice),
            },
          },
          {
            "landDetails.rent.totalAmount": {
              $gte: parseFloat(minPrice),
              $lte: parseFloat(maxPrice),
            },
          },
          {
            "landDetails.lease.totalAmount": {
              $gte: parseFloat(minPrice),
              $lte: parseFloat(maxPrice),
            },
          }
        );
        filtersAdded = true;
      }

      if (propertySize && sizeUnit) {
        // Convert propertySize to a number for comparison if it's numeric
        const numericPropertySize = parseFloat(propertySize);

        // Check if propertySize is a valid number
        if (!isNaN(numericPropertySize)) {
          modelFilters.$or.push(
            { "landDetails.size": { $lte: numericPropertySize } },
            { "landDetails.sell.plotSize": { $lte: numericPropertySize } },
            { "landDetails.rent.plotSize": { $lte: numericPropertySize } },
            { "landDetails.lease.plotSize": { $lte: numericPropertySize } }
          );
        }

        // Check for sizeUnit matching exactly
        modelFilters.$or.push(
          {
            "landDetails.sizeUnit": { $regex: `^${sizeUnit}$`, $options: "i" },
          },
          {
            "landDetails.sell.sizeUnit": {
              $regex: `^${sizeUnit}$`,
              $options: "i",
            },
          },
          {
            "landDetails.rent.sizeUnit": {
              $regex: `^${sizeUnit}$`,
              $options: "i",
            },
          },
          {
            "landDetails.lease.sizeUnit": {
              $regex: `^${sizeUnit}$`,
              $options: "i",
            },
          }
        );
        filtersAdded = true;
      }

      // Ensure $or is not empty before applying
      if (!filtersAdded) {
        delete modelFilters.$or;
      }
    };

    const buildQuery = async (model, filters) => {
      return await model
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    };

    // Filters for all models
    const fieldFilters = { userId };
    const commercialFilters = { userId };
    const layoutFilters = { userId };
    const residentialFilters = { userId };

    queryFilters(fieldFilters);
    queryFilters(commercialFilters);
    queryFilters(layoutFilters);
    queryFilters(residentialFilters);

    let fieldData = [];
    let commercialProperties = [];
    let layoutProperties = [];
    let residentialProperties = [];

    if (page && limit) {
      fieldData = await fieldModel
        .find(fieldFilters)
        .skip(offset)
        .limit(limit / 4);

      commercialProperties = await commercialModel
        .find(commercialFilters)
        .skip(offset)
        .limit(limit / 4);

      layoutProperties = await layoutModel
        .find(layoutFilters)
        .skip(offset)
        .limit(limit / 4);

      residentialProperties = await residentialModel
        .find(residentialFilters)
        .skip(offset)
        .limit(limit / 4);
    } else {
      [
        fieldData,
        commercialProperties,
        layoutProperties,
        residentialProperties,
      ] = await Promise.all([
        buildQuery(fieldModel, fieldFilters),
        buildQuery(commercialModel, commercialFilters),
        buildQuery(layoutModel, layoutFilters),
        buildQuery(residentialModel, residentialFilters),
      ]);
    }

    const allProperties = [
      ...fieldData,
      ...commercialProperties,
      ...layoutProperties,
      ...residentialProperties,
    ];

    const resultData = [];

    for (let fields of allProperties) {
      const id = fields._id;

      const data = await auctionModel.find({ propertyId: id });

      const reservation = await propertyReservation.find({
        propId: id,
        reservationStatus: true,
        userId: userId,
      });

      if (reservation.length > 0) {
        fields.reservedBy = reservation[0].userId;

        console.log("reservererddsdf", fields.resercedBy);
      }

      fields.auctionData = data[0];

      console.log("auction", data[0]);
      if (data.length === 0) {
        fields.auctionStatus = "InActive";
        console.log("field.auctionStatus", fields.auctionStatus);
      } else {
        console.log(data[0].buyers);
        const buyerData = data[0].buyers;
        if (buyerData.length > 0) {
          buyerData.sort((a, b) => b.bidAmount - a.bidAmount);
        }
        fields.auctionStatus = data[0].auctionStatus;
        fields.auctionData.buyers = buyerData;
      }
      console.log("asd", fields.auctionStatus);

      resultData.push({
        ...fields._doc,
        auctionStatus: fields.auctionStatus,
        auctionData: fields.auctionData,
        reservedBy: fields.resercedBy,
      });
    }

    if (resultData.length === 0) {
      return res.status(409).json({ message: "No properties found" });
    }

    res.status(200).json(resultData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertiesByUserIds = async (req, res) => {
  try {
    let page = req.query.page;
    let limit = req.query.limit;
    let fieldData = [];
    let commercialProperties = [];
    let layoutProperties = [];
    let residentialProperties = [];

    const userId = req.params.agentId;

    if (page) {
      let offset = (page - 1) * limit;
      fieldData = await fieldModel
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
      commercialProperties = await commercialModel
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
      layoutProperties = await layoutModel
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
      residentialProperties = await residentialModel
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    } else {
      fieldData = await fieldModel
        .find({ userId: userId })
        .sort({ createdAt: -1 });
      commercialProperties = await commercialModel
        .find({ userId: userId })
        .sort({ createdAt: -1 });
      layoutProperties = await layoutModel
        .find({ userId: userId })
        .sort({ createdAt: -1 });
      residentialProperties = await residentialModel
        .find({ userId: userId })
        .sort({ createdAt: -1 });
    }
    const allProperties = [
      ...fieldData,
      ...commercialProperties,
      ...layoutProperties,
      ...residentialProperties,
    ];
    if (allProperties.length === 0) {
      return res.status(409).json({ message: "No properties found" });
    }

    res.status(200).json(allProperties);
  } catch (error) {
    // Handle errors and return a 500 status
    res.status(500).json({ message: error.message });
  }
};

const getAllProperties = async (req, res) => {
  try {
    let fields = [];
    let residentials = [];
    let commercials = [];
    let layouts = [];

    let offset = req.query.offset;

    console.log("offset", offset);

    const fieldsCount = await fieldModel.countDocuments();
    const commercialCount = await commercialModel.countDocuments();
    const residentialCount = await residentialModel.countDocuments();
    const layoutCount = await layoutModel.countDocuments();
    let fieldProperties,
      residentialProperties,
      commercialProperties,
      layoutProperties;

    if (offset === "1") {
      if (fieldsCount > 4) {
        fieldProperties = await fieldModel
          .find(
            {},
            {
              "landDetails.images": 1,
              "address.district": 1,
              "landDetails.title": 1,
              "landDetails.size": 1,
              "landDetails.totalPrice": 1,
              "landDetails.sizeUnit": 1,
              propertyType: 1,
              propertyInterestedCount: 1,
              propertyId: 1,
              "address.districtTe": 1,
              "landDetails.titleTe": 1,
              propertyTypeTe: 1,
            }
          )
          .sort({ createdAt: -1 })
          .limit(2);
      } else {
        fieldProperties = await fieldModel
          .find(
            {},
            {
              "landDetails.images": 1,
              "address.district": 1,
              "landDetails.title": 1,
              "landDetails.size": 1,
              "landDetails.totalPrice": 1,
              "landDetails.sizeUnit": 1,
              propertyType: 1,
              propertyInterestedCount: 1,
              propertyId: 1,
              "address.districtTe": 1,
              "landDetails.titleTe": 1,
              propertyTypeTe: 1,
            }
          )
          .sort({ createdAt: -1 })
          .limit(2);
      }
    } else {
      if (fieldsCount > 4) {
        fieldProperties = await fieldModel
          .find(
            {},
            {
              "landDetails.images": 1,
              "address.district": 1,
              "landDetails.title": 1,
              "landDetails.size": 1,
              "landDetails.totalPrice": 1,
              "landDetails.sizeUnit": 1,
              propertyType: 1,
              propertyInterestedCount: 1,
              propertyId: 1,
              "address.districtTe": 1,
              "landDetails.titleTe": 1,
              propertyTypeTe: 1,
            }
          )
          .sort({ createdAt: -1 });
      } else {
        fieldProperties = await fieldModel
          .find(
            {},
            {
              "landDetails.images": 1,
              "address.district": 1,
              "landDetails.title": 1,
              "landDetails.size": 1,
              "landDetails.totalPrice": 1,
              "landDetails.sizeUnit": 1,
              propertyType: 1,
              propertyInterestedCount: 1,
              propertyId: 1,
              "address.districtTe": 1,
              "landDetails.titleTe": 1,
              propertyTypeTe: 1,
            }
          )
          .sort({ createdAt: -1 });
      }
    }

    // Iterate over field properties and push to the fields array
    fieldProperties.forEach((property) => {
      fields.push({
        propertyId: property.id,
        propId: property.propertyId,
        propertyType: property.propertyType,
        propertyTypeTe: property.propertyTypeTe || property.propertyTypeTe,
        images: property.landDetails.images,
        price: property.landDetails.totalPrice,
        size: property.landDetails.size,
        sizeUnit: property.landDetails.sizeUnit,
        title: property.landDetails.title,
        titleTe: property.landDetails.titleTe || property.landDetails.title,
        district: property.address.district,
        districtTe: property.address.districtTe || property.address.district,
        propertyInterestedCount: property.propertyInterestedCount,
      });
    });

    if (offset === "1") {
      if (residentialCount > 4) {
        residentialProperties = await residentialModel
          .find(
            {},
            {
              propPhotos: 1,
              "propertyDetails.apartmentName": 1,
              "propertyDetails.apartmentNameTe": 1,
              "propertyDetails.flatCost": 1,
              "propertyDetails.flatSize": 1,
              "address.district": 1,
              "address.districtTe": 1,
              "propertyDetails.sizeUnit": 1,
              propertyInterestedCount: 1,
              propertyType: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 })
          .limit(2);
      } else {
        residentialProperties = await residentialModel
          .find(
            {},
            {
              propPhotos: 1,
              "propertyDetails.apartmentName": 1,
              "propertyDetails.apartmentNameTe": 1,
              "propertyDetails.flatCost": 1,
              "propertyDetails.flatSize": 1,
              "address.districtTe": 1,
              "address.district": 1,
              "propertyDetails.sizeUnit": 1,
              propertyInterestedCount: 1,
              propertyType: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 })
          .limit(2);
      }
    } else {
      if (residentialCount > 4) {
        residentialProperties = await residentialModel
          .find(
            {},
            {
              propPhotos: 1,
              "propertyDetails.apartmentName": 1,
              "propertyDetails.apartmentNameTe": 1,
              "propertyDetails.flatCost": 1,
              "propertyDetails.flatSize": 1,
              "address.district": 1,
              "address.districtTe": 1,
              "propertyDetails.sizeUnit": 1,
              propertyInterestedCount: 1,
              propertyType: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 });
      } else {
        residentialProperties = await residentialModel
          .find(
            {},
            {
              propPhotos: 1,
              "propertyDetails.apartmentName": 1,
              "propertyDetails.apartmentNameTe": 1,
              "propertyDetails.flatCost": 1,
              "propertyDetails.flatSize": 1,
              "address.districtTe": 1,
              "address.district": 1,
              "propertyDetails.sizeUnit": 1,
              propertyInterestedCount: 1,
              propertyType: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 });
      }
    }

    // Iterate over residential properties and push to the residentials array
    residentialProperties.forEach((property) => {
      residentials.push({
        propertyId: property.id,
        propId: property.propertyId,
        propertyInterestedCount: property.propertyInterestedCount,
        propertyType: property.propertyType,
        images: property.propPhotos,
        price: property.propertyDetails.flatCost,
        size: property.propertyDetails.flatSize,
        sizeUnit: property.propertyDetails.sizeUnit,
        title: property.propertyDetails.apartmentName,
        sizeUnitTe:
          property.propertyDetails.sizeUnitTe ||
          property.propertyDetails.sizeUnit,
        titleTe:
          property.propertyDetails.apartmentNameTe ||
          property.propertyDetails.apartmentName,
        district: property.address.district,
        districtTe: property.address.districtTe || property.address.district,
      });
    });

    if (offset === "1") {
      if (commercialCount > 4) {
        commercialProperties = await commercialModel
          .find(
            {},
            {
              "propertyDetails.landDetails": 1,
              "propertyDetails.uploadPics": 1,
              propertyTitle: 1,
              propertyTitleTe: 1,
              propertyType: 1,
              propertyInterestedCount: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 })
          .limit(2);
      } else {
        commercialProperties = await commercialModel
          .find(
            {},
            {
              "propertyDetails.landDetails": 1,
              "propertyDetails.uploadPics": 1,
              propertyTitle: 1,
              propertyTitleTe: 1,
              propertyType: 1,
              propertyInterestedCount: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 })
          .limit(2);
      }
    } else {
      if (commercialCount > 4) {
        commercialProperties = await commercialModel
          .find(
            {},
            {
              "propertyDetails.landDetails": 1,
              "propertyDetails.uploadPics": 1,
              propertyTitle: 1,
              propertyTitleTe: 1,
              propertyType: 1,
              propertyInterestedCount: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 });
      } else {
        commercialProperties = await commercialModel
          .find(
            {},
            {
              "propertyDetails.landDetails": 1,
              "propertyDetails.uploadPics": 1,
              propertyTitle: 1,
              propertyTitleTe: 1,
              propertyType: 1,
              propertyInterestedCount: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 });
      }
    }
    // Iterate over commercial properties and push to the commercials array
    commercialProperties.forEach((property) => {
      let price, size;
      const { landDetails } = property.propertyDetails;

      // Check if land is for sale, rent, or lease
      if (landDetails.sell?.landUsage?.length > 0) {
        price = landDetails.sell.totalAmount;
        size = landDetails.sell.plotSize;
      } else if (landDetails.rent?.landUsage?.length > 0) {
        price = landDetails.rent.totalAmount;
        size = landDetails.rent.plotSize;
      } else if (landDetails.lease?.landUsage?.length > 0) {
        price = landDetails.lease.totalAmount;
        size = landDetails.lease.plotSize;
      }

      commercials.push({
        propertyId: property.id,
        propId: property.propertyId,
        propertyType: property.propertyType,
        propertyTypeTe: property.propertyTypeTe || property.propertyType,
        images: property.propertyDetails.uploadPics,
        price: price,
        size: size,
        sizeUnit:
          landDetails.sell?.sizeUnit ||
          landDetails.lease?.sizeUnit ||
          landDetails.rent?.sizeUnit ||
          "NA",
        title: property.propertyTitle,
        district: landDetails?.address?.district || "NA",
        titleTe: property.propertyTitleTe || property.propertyTitle,
        districtTe:
          landDetails?.address?.districtTe || landDetails?.address?.district,
        propertyInterestedCount: property.propertyInterestedCount,
      });
    });

    if (offset === "1") {
      if (layoutCount > 4) {
        layoutProperties = await layoutModel
          .find(
            {},
            {
              uploadPics: 1,
              "layoutDetails.layoutTitle": 1,
              "layoutDetails.layoutTitleTe": 1,
              "layoutDetails.plotSize": 1,
              "layoutDetails.totalAmount": 1,
              "layoutDetails.address.district": 1,
              "layoutDetails.address.districtTe": 1,
              "layoutDetails.sizeUnit": 1,
              propertyInterestedCount: 1,
              propertyType: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 })
          .limit(2);
      } else {
        layoutProperties = await layoutModel
          .find(
            {},
            {
              uploadPics: 1,
              "layoutDetails.layoutTitle": 1,
              "layoutDetails.layoutTitleTe": 1,
              "layoutDetails.plotSize": 1,
              "layoutDetails.totalAmount": 1,
              "layoutDetails.address.district": 1,
              "layoutDetails.address.districtTe": 1,
              "layoutDetails.sizeUnit": 1,
              propertyInterestedCount: 1,
              propertyType: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 })
          .limit(2);
      }
    } else {
      if (layoutCount > 4) {
        layoutProperties = await layoutModel
          .find(
            {},
            {
              uploadPics: 1,
              "layoutDetails.layoutTitle": 1,
              "layoutDetails.layoutTitleTe": 1,
              "layoutDetails.plotSize": 1,
              "layoutDetails.totalAmount": 1,
              "layoutDetails.address.district": 1,
              "layoutDetails.address.districtTe": 1,
              "layoutDetails.sizeUnit": 1,
              propertyInterestedCount: 1,
              propertyType: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 });
      } else {
        layoutProperties = await layoutModel
          .find(
            {},
            {
              uploadPics: 1,
              "layoutDetails.layoutTitle": 1,
              "layoutDetails.layoutTitleTe": 1,
              "layoutDetails.plotSize": 1,
              "layoutDetails.totalAmount": 1,
              "layoutDetails.address.district": 1,
              "layoutDetails.address.districtTe": 1,
              "layoutDetails.sizeUnit": 1,
              propertyInterestedCount: 1,
              propertyType: 1,
              propertyId: 1,
            }
          )
          .sort({ createdAt: -1 });
      }
    }
    // Iterate over layout properties and push to the layouts array
    layoutProperties.forEach((property) => {
      layouts.push({
        propertyId: property.id,
        propId: property.propertyId,
        propertyType: property.propertyType,
        propertyTypeTe: property.propertyTypeTe || "NA",
        images: property.uploadPics,
        price: property.layoutDetails.totalAmount,
        size: property.layoutDetails.plotSize,
        sizeUnit: property.layoutDetails.sizeUnit || "NA",
        sizeUnitTe: property.layoutDetails.sizeUnitTe || "NA",
        title: property.layoutDetails.layoutTitle,
        district: property.layoutDetails.address.district,
        titleTe: property.layoutDetails.layoutTitleTe || "NA",
        districtTe: property.layoutDetails.address.districtTe || "NA",
        propertyInterestedCount: property.propertyInterestedCount,
      });
    });

    // Combine all properties into one array
    const allProperties = [
      ...fields,
      ...residentials,
      ...commercials,
      ...layouts,
    ];

    // Check if any properties were found
    if (allProperties.length === 0) {
      return res.status(409).json({ message: "No properties found" });
    }

    // Send the combined result back to the client
    res.status(200).json(allProperties.sort());
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const plansBasedProperties = async (req, res) => {
  try {
    const { type } = req.query;

    const calculateEachPrice = (totalPrice, size) => {
      return size ? (totalPrice / size).toFixed(2) : null;
    };

    const fetchProperties = async (
      model,
      projection,
      sortField,
      extractDataFn
    ) => {
      const properties = await model
        .find({}, projection)
        .sort(
          type === "premium"
            ? { [sortField]: -1 }
            : type === "standard"
            ? { views: -1 }
            : { createdAt: -1 }
        )
        .limit(1);

      return properties.map(extractDataFn);
    };

    const fields = await fetchProperties(
      fieldModel,
      {
        "landDetails.images": 1,
        "address.district": 1,
        "landDetails.title": 1,
        "landDetails.size": 1,
        "landDetails.totalPrice": 1,
        "landDetails.sizeUnit": 1,
        propertyType: 1,
        propertyId: 1,
      },
      "landDetails.totalPrice",
      (property) => ({
        id: property.id,
        name: property.landDetails.title,
        images:
          property.landDetails.images && property.landDetails.images.length > 0
            ? property.landDetails.images[0]
            : null,
        totalPrice: property.landDetails.totalPrice,
        eachPrice: calculateEachPrice(
          property.landDetails.totalPrice,
          property.landDetails.size
        ),
        size: property.landDetails.size,
        sizeUnit: property.landDetails.sizeUnit,
        district: property.address.district,
        propertyType: property.propertyType,
        propertyId: property.propertyId,
      })
    );

    // Fetch Residential properties
    const residentials = await fetchProperties(
      residentialModel,
      {
        "propertyDetails.apartmentName": 1,
        propPhotos: 1,
        "propertyDetails.flatCost": 1,
        "propertyDetails.flatSize": 1,
        "address.district": 1,
        "propertyDetails.sizeUnit": 1,
        propertyType: 1,
        propertyId: 1,
      },
      "propertyDetails.flatCost",
      (property) => ({
        id: property.id,
        name: property.propertyDetails.apartmentName,
        images:
          property.propPhotos && property.propPhotos.length > 0
            ? property.propPhotos[0]
            : null,
        totalPrice: property.propertyDetails.flatCost,
        eachPrice: calculateEachPrice(
          property.propertyDetails.flatCost,
          property.propertyDetails.flatSize
        ),
        size: property.propertyDetails.flatSize,
        sizeUnit: property.propertyDetails.sizeUnit,
        district: property.address.district,
        propertyType: property.propertyType,
        propertyId: property.propertyId,
      })
    );

    // Fetch Commercial properties
    // Fetch Commercial properties
    const commercials = await fetchProperties(
      commercialModel,
      {
        "propertyDetails.landDetails": 1,
        propertyTitle: 1,
        propertyType: 1,
        propertyId: 1,
        "propertyDetails.uploadPics": 1,
      },
      "propertyDetails.landDetails.sell.totalAmount",
      (property) => {
        let price, size, sizeUnit, district;
        const { landDetails } = property.propertyDetails;

        if (landDetails.sell?.landUsage?.length > 0) {
          price = landDetails.sell.totalAmount;
          size = landDetails.sell.plotSize;
          sizeUnit = landDetails.sell.sizeUnit;
          district = landDetails?.address?.district;
        } else if (landDetails.rent?.landUsage?.length > 0) {
          price = landDetails.rent.totalAmount;
          size = landDetails.rent.plotSize;
          sizeUnit = landDetails.rent.sizeUnit;
          district = landDetails?.address?.district;
        } else if (landDetails.lease?.landUsage?.length > 0) {
          price = landDetails.lease.totalAmount;
          size = landDetails.lease.plotSize;
          sizeUnit = landDetails.lease.sizeUnit;
          district = landDetails?.address?.district;
        }

        return {
          propertyId: property.propertyId,
          id: property.id,
          name: property.propertyTitle,
          images:
            property.propertyDetails.uploadPics &&
            property.propertyDetails.uploadPics.length > 0
              ? property.propertyDetails.uploadPics[0]
              : null,
          totalPrice: price,
          eachPrice: calculateEachPrice(price, size),
          size,
          sizeUnit,
          district,
          propertyType: property.propertyType,
        };
      }
    );

    // Fetch Layout properties
    const layouts = await fetchProperties(
      layoutModel,
      {
        "layoutDetails.layoutTitle": 1,
        uploadPics: 1,
        "layoutDetails.plotSize": 1,
        "layoutDetails.totalAmount": 1,
        "layoutDetails.address.district": 1,
        "layoutDetails.sizeUnit": 1,
        propertyType: 1,
        propertyId: 1,
      },
      "layoutDetails.totalAmount",
      (property) => ({
        propertyId: property.propertyId,
        id: property.id,
        name: property.layoutDetails.layoutTitle,
        images:
          property.uploadPics && property.uploadPics.length > 0
            ? property.uploadPics[0]
            : null,
        totalPrice: property.layoutDetails.totalAmount,
        eachPrice: calculateEachPrice(
          property.layoutDetails.totalAmount,
          property.layoutDetails.plotSize
        ),
        size: property.layoutDetails.plotSize,
        sizeUnit: property.layoutDetails.sizeUnit,
        district: property.layoutDetails.address.district,
        propertyType: property.propertyType,
      })
    );

    // Combine all properties into one array
    const allProperties = [
      ...fields,
      ...residentials,
      ...commercials,
      ...layouts,
    ];

    // Check if any properties were found
    if (allProperties.length === 0) {
      return res.status(409).json({ message: "No properties found" });
    }

    // Shuffle properties if type is 'basic'
    if (type === "basic") {
      allProperties.sort(() => Math.random() - 0.5);
    }

    // Send the combined result back to the client
    res.status(200).json(allProperties);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const getPropertiesByType = async (req, res) => {
  const result = req.params;
  const { type } = result;

  const page = req.query.page;
  const limit = req.query.limit;

  try {
    let properties;

    // Fetch data based on property type
    switch (type.toLowerCase()) {
      case "agricultural":
        if (page) {
          let offset = (page - 1) * limit;
          properties = await fieldModel.find().skip(offset).limit(limit);
        } else {
          properties = await fieldModel.find().exec();
        }
        break;
      case "residential":
        if (page) {
          let offset = (page - 1) * limit;
          properties = await residentialModel.find().skip(offset).limit(limit);
        } else {
          properties = await residentialModel.find().exec();
        }
        // properties = await residentialModel.find().exec();
        break;
      case "commercial":
        if (page) {
          let offset = (page - 1) * limit;
          properties = await commercialModel.find().skip(offset).limit(limit);
        } else {
          properties = await commercialModel.find().exec();
        }
        break;
      case "layout":
        if (page) {
          let offset = (page - 1) * limit;
          properties = await layoutModel.find().skip(offset).limit(limit);
        } else {
          properties = await layoutModel.find().exec();
        }
        break;
      default:
        return res.status(400).json({ message: "Invalid property type" });
    }

    if (properties.length === 0) {
      return res.status(409).json({ message: "No properties found" });
    }

    // Send the result back to the client
    res.status(200).json(properties);
  } catch (error) {
    // Handle any errors
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.log(error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};
const recentlyAddedProperties = async (req, res) => {
  try {
    let agriculturalProperties,
      residentialProperties,
      commercialProperties,
      layoutProperties;

    agriculturalProperties = await fieldModel
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();
    residentialProperties = await residentialModel
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();
    commercialProperties = await commercialModel
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();
    layoutProperties = await layoutModel
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();
    const allProperties = [
      ...agriculturalProperties,
      ...residentialProperties,
      ...commercialProperties,
      ...layoutProperties,
    ];

    if (allProperties.length === 0) {
      return res.status(409).json({ message: "No properties found" });
    }

    res.status(200).json(allProperties);
  } catch (error) {
    if (error.isJoi) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const insertPropertyRatings = async (req, res) => {
  let five = 0,
    four = 0,
    three = 0,
    two = 0,
    one = 0;
  try {
    const userId = req.user.user.userId;

    const status = 1;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is missing in request", success: false });
    }

    const { propertyId, propertyType, rating } = req.body;

    const ratingsData = {
      userId,

      status,
      propertyId,
      propertyType,
      rating,
    };
    const result = await propertyRatingSchema.validateAsync(ratingsData);
    const newRating = new propertyRatingModel(result);
    await newRating.save();

    // Fetch all ratings for this propertyId to calculate the average rating
    const ratings = await propertyRatingModel
      .find({
        propertyId: result.propertyId,
      })
      .sort({ userId: 1, createdAt: -1 });
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = (sumRatings / totalRatings).toFixed(2); // Calculate the average rating

    // Filter to get only the latest rating per user
    const latestRatings = [];
    const seenUsers = new Set();

    for (const rating of ratings) {
      if (!seenUsers.has(rating.userId)) {
        latestRatings.push(rating);
        seenUsers.add(rating.userId);
      }
    }

    // Count ratings
    latestRatings.forEach((rating) => {
      if (rating.rating >= 4.5) {
        five++;
      } else if (rating.rating >= 3.5 && rating.rating < 4.5) {
        four++;
      } else if (rating.rating >= 2.5 && rating.rating < 3.5) {
        three++;
      } else if (rating.rating >= 1.5 && rating.rating < 2.5) {
        two++;
      } else if (rating.rating >= 0.5 && rating.rating < 1.5) {
        one++;
      }
    });

    const countOfRatings = {
      fiveStar: five,
      fourStar: four,
      threeStar: three,
      twoStar: two,
      oneStar: one,
    };

    // Determine which property type schema to update based on the propertyType field
    let propertyModel;
    if (result.propertyType === "Agricultural land") {
      propertyModel = fieldModel;
    } else if (result.propertyType === "Commercial") {
      propertyModel = commercialModel;
    } else if (result.propertyType === "Residential") {
      propertyModel = residentialModel;
    } else if (result.propertyType === "Layout") {
      propertyModel = layoutModel;
    } else {
      return res
        .status(400)
        .json({ message: "Invalid property type", success: false });
    }

    // Update the property rating in the corresponding schema
    if (propertyModel) {
      const updatedProperty = await propertyModel.findOneAndUpdate(
        { _id: result.propertyId }, // Ensure propertyId is the _id
        {
          rating: avgRating,
          ratingCount: totalRatings,
          countOfRatings: countOfRatings,
        }, // Update the rating with the new average
        { new: true } // Return the updated document
      );
      if (!updatedProperty) {
        return res.status(409).json({
          message: `Property not found in ${result.propertyType} schema`,
          success: false,
        });
      }
    }

    res.status(201).json({
      message: "Rating details added successfully, and average rating updated",
      success: true,
      avgRating,
      countOfRatings,
    });
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.error(
      "Error inserting rating details or updating the property rating:",
      error
    ); // Log the error
    res.status(500).json({
      message: "Error inserting rating details or updating the property rating",
      error,
    });
  }
};

const getPropertyRatings = async (req, res) => {
  try {
    const result = await validateId.validateAsync(req.params);
    const { propertyId } = result;
    const ratings = await propertyRatingModel.find({ propertyId: propertyId });
    if (ratings.length === 0) {
      return res.status(409).json({ message: "No ratings found" });
    }
    const updatedRatings = await Promise.all(
      ratings.map(async (rating) => {
        // Fetch user details based on userId
        const user = await usersModel.findById(
          rating.userId,
          "firstName lastName role"
        );

        // Add the user details to the rating result
        return {
          ...rating.toObject(), // Convert Mongoose document to plain object
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
      })
    );
    res.status(200).json(updatedRatings);
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: error.message });
  }
};

const getPropertiesById = async (req, res) => {
  try {
    const result = await validateIdAndType.validateAsync(req.params);
    const { propertyType, propertyId } = result;
    console.log("efsdfsfdsf");

    const userId = req.user.user.userId;
    console.log("userID", userId);
    // Check if the property is part of any deal for this user
    const deal = await dealsModel.findOne({ propertyId, customerId: userId });

    let properties;
    let interestedIn = 0; // Default value if no deal is found

    if (deal) {
      const { propertyType: dealPropertyType } = deal;

      if (
        dealPropertyType === "Agricultural" ||
        dealPropertyType === "Agricultural land"
      ) {
        properties = await fieldModel.findOne({ _id: propertyId });
      } else if (dealPropertyType === "Residential") {
        properties = await residentialModel.findOne({ _id: propertyId });
      } else if (dealPropertyType === "Layout") {
        properties = await layoutModel.findOne({ _id: propertyId });
      } else {
        properties = await commercialModel.findOne({ _id: propertyId });
      }

      if (properties) {
        interestedIn = deal.interestIn; // Use the `interestedIn` status from the deal
      }
    } else {
      if (
        propertyType === "Agricultural" ||
        propertyType === "Agricultural land"
      ) {
        properties = await fieldModel.findOne({ _id: propertyId });
      } else if (propertyType === "Residential") {
        properties = await residentialModel.findOne({ _id: propertyId });
      } else if (propertyType === "Layout") {
        properties = await layoutModel.findOne({ _id: propertyId });
      } else {
        properties = await commercialModel.findOne({ _id: propertyId });
      }
    }

    if (!properties) {
      return res.status(409).json({ message: "No properties found" });
    }

    const agent = await usersModel.findById(properties.userId);
    if (!agent) {
      return res.status(409).json({ message: "Agent not found" });
    }

    const propertyDetails = {
      ...properties._doc,
      interestedIn,
      agentName: agent.firstName + " " + agent.lastName,
      agentNumber: agent.phoneNumber,
      agentEmail: agent.email,
      agentCity: agent.city,
      agentProfilePicture: agent.profilePicture,
    };

    // Additional filtering based on query params (location, size, price)
    const { location, propertySize, sizeUnit, maxPrice, minPrice } = req.query;
    let filterCriteria = { _id: propertyId, status: 0 }; // Only show available properties

    // Location-based filtering
    if (location) {
      filterCriteria.$or = [
        { "propertyDetails.landDetails.address.district": location },
        { "layoutDetails.address.district": location },
        { "address.district": location },
      ];
    }

    // Property size filtering
    if (propertySize) {
      filterCriteria.$or = filterCriteria.$or || [];
      filterCriteria.$or.push(
        { "propertyDetails.landDetails.sell.plotSize": propertySize },
        { "propertyDetails.landDetails.rent.plotSize": propertySize },
        { "propertyDetails.landDetails.lease.plotSize": propertySize },
        { "layoutDetails.plotSize": propertySize },
        { "propertyDetails.flatSize": propertySize },
        { "landDetails.size": propertySize }
      );
    }

    // Size unit filtering
    if (sizeUnit) {
      filterCriteria.$or = filterCriteria.$or || [];
      filterCriteria.$or.push(
        { "propertyDetails.landDetails.sell.sizeUnit": sizeUnit },
        { "propertyDetails.landDetails.rent.sizeUnit": sizeUnit },
        { "propertyDetails.landDetails.lease.sizeUnit": sizeUnit },
        { "layoutDetails.sizeUnit": sizeUnit },
        { "propertyDetails.sizeUnit": sizeUnit },
        { "landDetails.sizeUnit": sizeUnit }
      );
    }

    // Price range filtering
    if (maxPrice && minPrice) {
      filterCriteria.$or = filterCriteria.$or || [];
      filterCriteria.$or.push(
        { "landDetails.totalPrice": { $gte: minPrice, $lte: maxPrice } },
        { "layoutDetails.totalAmount": { $gte: minPrice, $lte: maxPrice } },
        {
          "propertyDetails.landDetails.sell.totalAmount": {
            $gte: minPrice,
            $lte: maxPrice,
          },
        },
        {
          "propertyDetails.landDetails.rent.totalAmount": {
            $gte: minPrice,
            $lte: maxPrice,
          },
        },
        {
          "propertyDetails.landDetails.lease.totalAmount": {
            $gte: minPrice,
            $lte: maxPrice,
          },
        },
        { "propertyDetails.totalCost": { $gte: minPrice, $lte: maxPrice } }
      );
    }

    // Applying additional filter criteria
    let filteredProperties =
      (await fieldModel.findOne(filterCriteria)) ||
      (await residentialModel.findOne(filterCriteria)) ||
      (await layoutModel.findOne(filterCriteria)) ||
      (await commercialModel.findOne(filterCriteria));

    if (filteredProperties) {
      Object.assign(propertyDetails, filteredProperties._doc);
    }
    console.log("ad");

    propertyDetails.auctionStatus = "inActive";

    console.log("ad");
    const reservation = await propertyReservation.find({
      propId: propertyId,
      reservationStatus: true,
      userId: userId,
    });
    console.log(propertyId, reservation, reservation.length, "asdas");
    if (reservation.length > 0) {
      propertyDetails.reservedBy = reservation[0].userId;
      console.log(propertyDetails.reservedBy);
    }

    const auctionData = await auctionModel.find({
      propertyId: propertyDetails._id,
    });

    if (auctionData.length > 0) {
      for (let auction of auctionData) {
        if (
          auction.auctionStatus === "active" ||
          auction.auctionStatus === "Active"
        ) {
          propertyDetails.auctionStatus = "active";
          propertyDetails.auctionType = auction.auctionType;
          break;
        } else {
          propertyDetails.auctionStatus = "Inactive";
          propertyDetails.auctionType = auction.auctionType;
        }
      }
      propertyDetails.auctionData = auctionData;
    }
    // Sending final response
    res.status(200).json(propertyDetails);
  } catch (error) {
    console.log(error);
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: error.message });
  }
};

const updatePropertyStatus = async (req, res) => {
  const result = await validateIdTypeStatus.validateAsync(req.body);
  const { propertyId, propertyType, status } = result;
  let model;
  // Determine the model based on type
  switch (propertyType.toLowerCase()) {
    case "residential":
      model = residentialModel;
      break;
    case "commercial":
      model = commercialModel;
      break;
    case "agricultural land":
      model = fieldModel;
      break;
    case "layout":
      model = layoutModel;
      break;
    default:
      return res.status(400).json({ error: "Invalid property type specified" });
  }

  try {
    let updateData = { status: status };

    // If propertyType is layout and status is 1, set availablePlots to 0
    if (propertyType.toLowerCase() === "layout" && status === 1) {
      updateData["layoutDetails.availablePlots"] = 0;
    }
    // Update the document with the specified propertyId
    const updatedResult = await model.findByIdAndUpdate(
      { _id: propertyId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedResult) {
      return res.status(404).json({ message: "Property not found" });
    }

    res
      .status(200)
      .json({ message: "Status updated successfully", updatedResult });
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};

const resetRatings = async (req, res) => {
  try {
    await fieldModel.updateMany(
      {}, // No filter, so all documents are selected
      {
        $set: {
          rating: 0,
          ratingCount: 0,
        },
      }
    );
    await commercialModel.updateMany(
      {}, // No filter, so all documents are selected
      {
        $set: {
          rating: 0,
          ratingCount: 0,
          //status: 0,
        },
      }
    );
    await residentialModel.updateMany(
      {}, // No filter, so all documents are selected
      {
        $set: {
          rating: 0,
          ratingCount: 0,
        },
      }
    );
    await layoutModel.updateMany(
      {}, // No filter, so all documents are selected
      {
        $set: {
          rating: 0,
          ratingCount: 0,
          //status: 0,
        },
      }
    );
    res.send("updated");
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

const getLatestProps = async (req, res) => {
  try {
    const properties = [];

    let page = req.query.page;
    let limit = req.query.limit;

    let field = [];
    let residential = [];
    let commercial = [];
    let layout = [];
    if (page) {
      let offset = (page - 1) * limit;
      field = await fieldModel.find().sort({ _id: -1 }).skip(offset).limit(2);
      residential = await residentialModel
        .find()
        .sort({ _id: -1 })
        .skip(offset)
        .limit(2);
      commercial = await commercialModel
        .find()
        .sort({ _id: -1 })
        .skip(offset)
        .limit(2);
      layout = await layoutModel.find().sort({ _id: -1 }).skip(offset).limit(2);
    } else {
      field = await fieldModel.find().sort({ _id: -1 }).limit(2);
      residential = await residentialModel.find().sort({ _id: -1 }).limit(2);
      commercial = await commercialModel.find().sort({ _id: -1 }).limit(2);
      layout = await layoutModel.find().sort({ _id: -1 }).limit(2);
    }

    field[0].propertyType = "Agricultural land";
    residential[0].propertyType = "Residential";
    commercial[0].propertyType = "Commercial";
    layout[0].propertyType = "Layout";
    properties.push(field[0]);
    properties.push(field[1]);
    properties.push(commercial[0]);
    properties.push(commercial[1]);
    properties.push(layout[0]);
    properties.push(layout[1]);
    properties.push(residential[0]);
    properties.push(residential[1]);
    if (properties.length === 0) {
      res.status(404).json("Properties not found");
    }
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json("Error fetching properties");
  }
};

const getProperty = async (req, res) => {
  try {
    let page = req.query.page;
    let limit = req.query.limit || 10;

    const result = await validateIdUserIdType.validateAsync(req.params);
    const { propertyType, userId, propertyId } = result;
    if (!propertyType) {
      return res.status(404).json("Property type is required");
    }
    const query = {};

    if (userId !== "@") {
      query.userId = req.user.user.userId;
    } else if (propertyId !== "@") {
      query._id = propertyId;
    }
    let propertyModel;
    if (propertyType === "Agricultural") {
      propertyModel = fieldModel;
    } else if (propertyType === "Commercial") {
      propertyModel = commercialModel;
    } else if (propertyType === "Residential") {
      propertyModel = residentialModel;
    } else if (propertyType === "Layout") {
      propertyModel = layoutModel;
    } else {
      return res
        .status(400)
        .json({ message: "Invalid property type", success: false });
    }
    let properties = [];
    if (page) {
      let offset = (page - 1) * limit;
      properties = await propertyModel
        .find(query)
        .skip(offset)
        .limit(limit)
        .sort({ status: 1, updatedAt: -1 })
        .exec();
    } else {
      properties = await propertyModel
        .find(query)
        .sort({ status: 1, updatedAt: -1 })
        .exec();
    }
    // Check if any properties were found
    if (properties.length === 0) {
      return res.status(404).json({ message: "No properties found" });
    }

    // Send the result back to the client
    res.status(200).json(properties);
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: error.message });
  }
};

const maxPrice = async (req, res) => {
  const { type, sell, rent, lease, flat, house } = req.params;
  const userId = req.user.user.userId;
  try {
    let result = 0,
      response;
    if (type === "agricultural") {
      const fields = await fieldModel.find({ userId: userId });
      fields.forEach((field) => {
        let price = field.landDetails.totalPrice;
        result = Math.max(result, price);
      });

      response = result;
    } else if (type === "residential") {
      let maxFlat = 0,
        maxHouse = 0;
      let maxPrice = 0;

      result = await residentialModel.find({ userId: userId }).exec();
      result.forEach((property) => {
        let price = 0;
        const propType = property.propertyDetails.type;
        price = property.propertyDetails.totalCost;
        if (!price) {
          price = 0;
        }
        if (propType === "Flat") {
          maxFlat = Math.max(price, maxFlat);
        } else if (propType === "House") {
          maxHouse = Math.max(price, maxHouse);
        }
      });
      if (flat === "flat") {
        maxPrice = Math.max(maxPrice, maxFlat);
      }
      if (house === "house") {
        maxPrice = Math.max(maxPrice, maxHouse);
      }
      if (flat === "@" && house === "@") {
        maxPrice = Math.max(maxPrice, maxFlat);
        maxPrice = Math.max(maxPrice, maxHouse);
      }
      response = maxPrice > 0 ? maxPrice : 0;
    } else if (type === "layout") {
      const plots = await layoutModel.find({ userId: userId });
      plots.forEach((plot) => {
        result = Math.max(result, plot.layoutDetails.totalAmount);
      });
      response = result;
    } else if (type === "commercial") {
      let maxSell = 0,
        maxRent = 0,
        maxLease = 0;
      let maxPrice = 0;

      commercialProperties = await commercialModel
        .find(
          { userId: userId },
          {
            "propertyDetails.landDetails": 1,
          }
        )
        .exec();
      // Iterate over commercial properties and extract necessary fields
      commercialProperties.forEach((property) => {
        let price = 0;
        const { landDetails } = property.propertyDetails;

        // Check if land is for sale, rent, or lease
        if (landDetails.sell?.landUsage?.length > 0) {
          price = landDetails.sell.totalAmount;
          maxSell = Math.max(maxSell, price);
        } else if (landDetails.rent?.landUsage?.length > 0) {
          price = landDetails.rent.totalAmount;
          maxRent = Math.max(maxRent, price);
        } else if (landDetails.lease?.landUsage?.length > 0) {
          price = landDetails.lease.totalAmount;
          maxLease = Math.max(maxLease, price);
        }
      });
      if (sell === "sell") {
        maxPrice = Math.max(maxPrice, maxSell);
      }
      if (rent === "rent") {
        maxPrice = Math.max(maxPrice, maxRent);
      }
      if (lease === "lease") {
        maxPrice = Math.max(maxPrice, maxLease);
      }
      if (sell === "@" && rent === "@" && lease === "@") {
        maxPrice = Math.max(maxPrice, maxSell);
        maxPrice = Math.max(maxPrice, maxRent);
        maxPrice = Math.max(maxPrice, maxLease);
      }
      response = maxPrice > 0 ? maxPrice : 0;
    } else {
      return res.status(400).json("Invalid");
    }
    return res.status(200).json({ maxPrice: response });
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

const getVillages = async () => {
  const villagesData = await locationModel.find({}, { villages: 1 });
  if (villagesData.length === 0) {
    res.status(400).json("Villages not found");
  }
  let villages = [];
  for (let element of villagesData) {
    villages.push(Object.keys(element.villages[0]));
  }
  let villageNames = [];
  for (let village of villages) {
    for (let v of village) {
      villageNames.push(v);
    }
  }
  return villageNames;
};

const getPropsByLocation = async (req, res) => {
  let page = req.query.page;
  let limit = req.query.limit;

  const result = await validateLocation.validateAsync(req.params);
  const { type, location } = result;
  try {
    if (location === "All") {
      if (type === "agriculture") {
        const props = await fieldModel
          .find()
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "residential") {
        const props = await residentialModel
          .find()
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "layout") {
        const props = await layoutModel
          .find()
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "commercial") {
        const props = await commercialModel
          .find()
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      }
    }

    let isDistrict, isMandal, isVillage;
    isDistrict = await locationModel.find({ district: { $regex: location } });
    isMandal = await locationModel.find({ mandal: { $regex: location } });
    const villages = await getVillages();
    if (villages.includes(location)) {
      isVillage = true;
    }
    if (isDistrict.length === 0 && isMandal.length === 0 && !isVillage) {
      return res.status(404).json("Location not found");
    }

    let query = {},
      model;
    if (type === "agriculture") {
      model = fieldModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "address.district": { $regex: location },
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "address.mandal": { $regex: location },
        };
      } else if (isVillage) {
        query = {
          ...query,
          "address.village": { $regex: location },
        };
      }
    } else if (type === "layout") {
      model = layoutModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "layoutDetails.address.district": { $regex: location },
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "layoutDetails.address.mandal": { $regex: location },
        };
      } else if (isVillage) {
        query = {
          ...query,
          "layoutDetails.address.village": { $regex: location },
        };
      }
    } else if (type === "residential") {
      model = residentialModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "address.district": { $regex: location },
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "address.mandal": { $regex: location },
        };
      } else if (isVillage) {
        query = {
          ...query,
          "address.village": { $regex: location },
        };
      }
    } else if (type === "commercial") {
      model = commercialModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.district": { $regex: location },
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.mandal": { $regex: location },
        };
      } else if (isVillage) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.village": { $regex: location },
        };
      }
    } else {
      return res.status(404).json("Invalid property type");
    }

    let properties = [];

    console.log("query", query);

    if (page) {
      let offset = (page - 1) * limit;
      properties = await model.find(query).skip(offset).limit(limit);
    } else {
      properties = await model.find(query);
    }
    if (properties.length === 0) {
      return res.status(404).json("No properties found");
    }
    return res.status(200).json(properties);
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res
      .status(500)
      .json({ error: error, message: "Error fetching properties" });
  }
};

const getMyPropsByLocation = async (req, res) => {
  const page = req.query.page;
  const limit = req.query.limit;

  const result = await validateLocation.validateAsync(req.params);
  let { userId } = req.user.user;
  const { type, location } = result;
  try {
    if (location === "All") {
      if (type === "agriculture") {
        const props = await fieldModel
          .find({ userId: userId })
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "residential") {
        const props = await residentialModel
          .find({ userId: userId })
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "layout") {
        const props = await layoutModel
          .find({ userId: userId })
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      } else if (type === "commercial") {
        const props = await commercialModel
          .find({ userId: userId })
          .sort({ status: 1, updatedAt: -1 });
        return res.status(200).json(props);
      }
    }

    let isDistrict, isMandal, isVillage;
    isDistrict = await locationModel.find({ district: location });
    isMandal = await locationModel.find({ mandal: location });
    const villages = await getVillages();
    if (villages.includes(location)) {
      isVillage = true;
    }
    if (isDistrict.length === 0 && isMandal.length === 0 && !isVillage) {
      return res.status(404).json("Location not found");
    }

    let query = { userId: userId },
      model;
    if (type === "agriculture") {
      model = fieldModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "address.village": location,
        };
      }
    } else if (type === "layout") {
      model = layoutModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "layoutDetails.address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "layoutDetails.address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "layoutDetails.address.village": location,
        };
      }
    } else if (type === "residential") {
      model = residentialModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "address.village": location,
        };
      }
    } else if (type === "commercial") {
      model = commercialModel;
      if (isDistrict.length !== 0) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.district": location,
        };
      } else if (isMandal.length !== 0) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.mandal": location,
        };
      } else if (isVillage) {
        query = {
          ...query,
          "propertyDetails.landDetails.address.village": location,
        };
      }
    } else {
      return res.status(404).json("Invalid property type");
    }
    let properties = [];
    if (page) {
      let offset = (page - 1) * limit;
      properties = await model.find(query).skip(offset).limit(limit);
    } else {
      properties = await model.find(query);
    }

    let resultData = [];

    for (let res of properties) {
      const id = res._id;

      const data = await auctionModel.find({ propertyId: id });
      console.log("auctionDataauctionDataauctionData", data, id);
      res.auctionData = data[0];

      const reservation = await propertyReservation.find({
        propId: id,
        reservationStatus: true,
        userId: userId,
      });

      if (reservation.length > 0) {
        res.reservedBy = reservation[0].userId;
      }

      if (data.length === 0) {
        res.auctionStatus = "InActive";
      } else {
        res.auctionStatus = data[0].auctionStatus;
        const buyerData = data[0].buyers;
        if (buyerData.length > 0) {
          buyerData.sort((a, b) => b.bidAmount - a.bidAmount);
        }
        res.auctionData.buyers = buyerData;
      }

      resultData.push({
        ...res._doc,
        reservedBy: res.reservedBy,
        auctionData: res.auctionData,
        auctionStatus: res.auctionStatus,
      });
    }

    if (properties.length === 0) {
      return res.status(404).json("No properties found");
    }
    return res.status(200).json(resultData);
  } catch (error) {
    console.log(error);
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res
      .status(500)
      .json({ error: error, message: "Error fetching properties" });
  }
};

const propertyBasedOnLocation = async (req, res) => {
  try {
    const { type } = req.query;
    let limit = 2;

    if (type === "premium") {
      limit = 3;
    }

    const calculateEachPrice = (totalPrice, size) => {
      return size ? (totalPrice / size).toFixed(2) : null;
    };

    const fetchProperties = async (
      model,
      projection,
      sortField,
      extractDataFn
    ) => {
      const properties = await model
        .find({}, projection)
        .sort(type === "premium" ? { [sortField]: -1 } : { createdAt: -1 })
        .limit(limit);

      return properties.map(extractDataFn);
    };

    // Fetch Field properties
    const fields = await fetchProperties(
      fieldModel,
      {
        _id: 1,
        propertyId: 1,
        "landDetails.title": 1,
        "landDetails.totalPrice": 1,
        "landDetails.size": 1,
        "landDetails.sizeUnit": 1,
        "address.district": 1,
        propertyType: 1,
      },
      "landDetails.totalPrice",
      (property) => ({
        id: property._id,
        propertyId: property.propertyId,
        propertyType: property.propertyType,
        name: property.landDetails.title,
        totalPrice: property.landDetails.totalPrice,
        eachPrice: calculateEachPrice(
          property.landDetails.totalPrice,
          property.landDetails.size
        ),
        size: property.landDetails.size,
        sizeUnit: property.landDetails.sizeUnit,
        district: property.address.district,
      })
    );

    // Fetch Residential properties
    const residentials = await fetchProperties(
      residentialModel,
      {
        _id: 1,
        propertyId: 1,
        "propertyDetails.apartmentName": 1,
        "propertyDetails.flatCost": 1,
        "propertyDetails.flatSize": 1,
        "address.district": 1,
        "propertyDetails.sizeUnit": 1,
        propertyType: 1,
      },
      "propertyDetails.flatCost",
      (property) => ({
        id: property._id,
        propertyId: property.propertyId,
        propertyType: property.propertyType,
        name: property.propertyDetails.apartmentName,
        totalPrice: property.propertyDetails.flatCost,
        eachPrice: calculateEachPrice(
          property.propertyDetails.flatCost,
          property.propertyDetails.flatSize
        ),
        size: property.propertyDetails.flatSize,
        sizeUnit: property.propertyDetails.sizeUnit,
        district: property.address.district,
      })
    );

    // Fetch Commercial properties
    const commercials = await fetchProperties(
      commercialModel,
      {
        _id: 1,
        propertyId: 1,
        propertyTitle: 1,
        "propertyDetails.landDetails": 1,
        propertyType: 1,
      },
      "propertyDetails.landDetails.sell.totalAmount",
      (property) => {
        let price, size, sizeUnit, district;
        const { landDetails } = property.propertyDetails;

        if (landDetails.sell?.landUsage?.length > 0) {
          price = landDetails.sell.totalAmount;
          size = landDetails.sell.plotSize;
          sizeUnit = landDetails.sell.sizeUnit;
          district = landDetails?.address?.district;
        } else if (landDetails.rent?.landUsage?.length > 0) {
          price = landDetails.rent.totalAmount;
          size = landDetails.rent.plotSize;
          sizeUnit = landDetails.rent.sizeUnit;
          district = landDetails?.address?.district;
        } else if (landDetails.lease?.landUsage?.length > 0) {
          price = landDetails.lease.totalAmount;
          size = landDetails.lease.plotSize;
          sizeUnit = landDetails.lease.sizeUnit;
          district = landDetails?.address?.district;
        }

        return {
          id: property._id,
          propertyId: property.propertyId,
          propertyType: property.propertyType,
          name: property.propertyTitle,
          totalPrice: price,
          eachPrice: calculateEachPrice(price, size),
          size,
          sizeUnit,
          district,
        };
      }
    );

    // Fetch Layout properties
    const layouts = await fetchProperties(
      layoutModel,
      {
        _id: 1,
        propertyId: 1,
        "layoutDetails.layoutTitle": 1,
        "layoutDetails.plotSize": 1,
        "layoutDetails.totalAmount": 1,
        "layoutDetails.address.district": 1,
        "layoutDetails.sizeUnit": 1,
        propertyType: 1,
      },
      "layoutDetails.totalAmount",
      (property) => ({
        id: property._id,
        propertyId: property.propertyId,
        propertyType: property.propertyType,
        name: property.layoutDetails.layoutTitle,
        totalPrice: property.layoutDetails.totalAmount,
        eachPrice: calculateEachPrice(
          property.layoutDetails.totalAmount,
          property.layoutDetails.plotSize
        ),
        size: property.layoutDetails.plotSize,
        sizeUnit: property.layoutDetails.sizeUnit,
        district: property.layoutDetails.address.district,
      })
    );

    // Combine all properties into one array
    const allProperties = [
      ...fields,
      ...residentials,
      ...commercials,
      ...layouts,
    ];

    // Check if any properties were found
    if (allProperties.length === 0) {
      return res.status(409).json({ message: "No properties found" });
    }

    // Shuffle properties if type is 'basic'
    if (type === "basic") {
      allProperties.sort(() => Math.random() - 0.5);
    }

    // Send the combined result back to the client
    res.status(200).json(allProperties);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

const maximumSizeForAllProps = async (req, res) => {
  const result = await validateSlider.validateAsync(req.params);
  const { type, sell, rent, lease, flat, house, sold, unsold } = result;

  try {
    let result = 0,
      unsoldResult = 0,
      soldResult = 0,
      response,
      unsoldResponse,
      soldResponse;
    if (type === "agricultural") {
      const fields = await fieldModel.find();
      fields.forEach((field) => {
        let size = field.landDetails.size;
        result = Math.max(result, size);

        if (field.status == 0) {
          unsoldResult = Math.max(unsoldResult, size);
        } else if (field.status == 1) {
          soldResult = Math.max(soldResult, size);
        }
      });
      unsoldResponse = unsoldResult;
      soldResponse = soldResult;
      response = result;
    } else if (type === "residential") {
      let maxFlat = 0,
        maxHouse = 0,
        maxUnsoldFlat = 0,
        maxUnsoldHouse = 0,
        maxsoldFlat = 0,
        maxsoldHouse = 0;
      let maxSize = 0,
        maxUnsoldSize = 0,
        maxsoldSize = 0;

      result = await residentialModel.find().exec();
      result.forEach((property) => {
        let size = 0;
        const propType = property.propertyDetails.type;
        size = property.propertyDetails.flatSize;
        if (!size) {
          size = 0;
        }
        if (propType === "Flat") {
          maxFlat = Math.max(size, maxFlat);
          if (property.status == 0) {
            maxUnsoldFlat = Math.max(size, maxUnsoldFlat);
          } else {
            maxsoldFlat = Math.max(size, maxsoldFlat);
          }
        } else if (propType === "House") {
          maxHouse = Math.max(size, maxHouse);
          if (property.status == 0) {
            maxUnsoldHouse = Math.max(size, maxUnsoldHouse);
          } else {
            maxsoldHouse = Math.max(size, maxsoldHouse);
          }
        }
      });
      if (flat === "flat") {
        maxSize = Math.max(maxSize, maxFlat);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldFlat);
        maxsoldSize = Math.max(maxsoldSize, maxsoldFlat);
      }
      if (house === "house") {
        maxSize = Math.max(maxSize, maxHouse);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldHouse);
        maxsoldSize = Math.max(maxsoldSize, maxsoldHouse);
      }
      if (flat === "@" && house === "@") {
        maxSize = Math.max(maxSize, maxFlat);
        maxSize = Math.max(maxSize, maxHouse);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldFlat);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldHouse);
        maxsoldSize = Math.max(maxsoldSize, maxsoldFlat);
        maxsoldSize = Math.max(maxsoldSize, maxsoldHouse);
      }
      response = maxSize > 0 ? maxSize : 0;
      unsoldResponse = maxUnsoldSize > 0 ? maxUnsoldSize : 0;
      soldResponse = maxsoldSize > 0 ? maxsoldSize : 0;
    } else if (type === "layout") {
      const plots = await layoutModel.find();
      plots.forEach((plot) => {
        result = Math.max(result, plot.layoutDetails.plotSize);
        if (plot.status == 0) {
          unsoldResult = Math.max(unsoldResult, plot.layoutDetails.plotSize);
        } else {
          soldResult = Math.max(soldResult, plot.layoutDetails.plotSize);
        }
      });
      unsoldResponse = unsoldResult;
      soldResponse = soldResult;
      response = result;
    } else if (type === "commercial") {
      let maxSell = 0,
        maxRent = 0,
        maxLease = 0,
        maxUnsoldSell = 0,
        maxUnsoldRent = 0,
        maxUnsoldLease = 0,
        maxsoldSell = 0,
        maxsoldRent = 0,
        maxsoldLease = 0;
      let maxSize = 0,
        maxUnsoldSize = 0,
        maxsoldSize = 0;

      commercialProperties = await commercialModel.find().exec();
      // Iterate over commercial properties and extract necessary fields
      commercialProperties.forEach((property) => {
        let size = 0;
        const { landDetails } = property.propertyDetails;

        // Check if land is for sale, rent, or lease
        if (landDetails.sell?.landUsage?.length > 0) {
          size = landDetails.sell.plotSize;
          maxSell = Math.max(maxSell, size);
          if (property.status == 0) {
            maxUnsoldSell = Math.max(maxUnsoldSell, size);
          } else {
            maxsoldSell = Math.max(maxsoldSell, size);
          }
        } else if (landDetails.rent?.landUsage?.length > 0) {
          size = landDetails.rent.plotSize;
          maxRent = Math.max(maxRent, size);
          if (property.status == 0) {
            maxUnsoldRent = Math.max(maxUnsoldRent, size);
          } else {
            maxsoldRent = Math.max(maxsoldRent, size);
          }
        } else if (landDetails.lease?.landUsage?.length > 0) {
          size = landDetails.lease.plotSize;
          maxLease = Math.max(maxLease, size);
          if (property.status == 0) {
            maxUnsoldLease = Math.max(maxUnsoldLease, size);
          } else {
            maxsoldLease = Math.max(maxsoldLease, size);
          }
        }
      });
      if (sell === "sell") {
        maxSize = Math.max(maxSize, maxSell);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldSell);
        maxsoldSize = Math.max(maxsoldSize, maxsoldSell);
      }
      if (rent === "rent") {
        maxSize = Math.max(maxSize, maxRent);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldRent);
        maxsoldSize = Math.max(maxsoldSize, maxsoldRent);
      }
      if (lease === "lease") {
        maxSize = Math.max(maxSize, maxLease);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldLease);
        maxsoldSize = Math.max(maxsoldSize, maxsoldLease);
      }
      if (sell === "@" && rent === "@" && lease === "@") {
        maxSize = Math.max(maxSize, maxSell);
        maxSize = Math.max(maxSize, maxRent);
        maxSize = Math.max(maxSize, maxLease);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldSell);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldRent);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldLease);
        maxsoldSize = Math.max(maxsoldSize, maxsoldSell);
        maxsoldSize = Math.max(maxsoldSize, maxsoldRent);
        maxsoldSize = Math.max(maxsoldSize, maxsoldLease);
      }
      response = maxSize > 0 ? maxSize : 0;
      unsoldResponse = maxUnsoldSize > 0 ? maxUnsoldSize : 0;
      soldResponse = maxsoldSize > 0 ? maxsoldSize : 0;
    } else {
      return res.status(400).json("Invalid");
    }
    if (unsold === "unsold" && sold === "@") {
      return res.status(200).json({ maxSize: unsoldResponse });
    } else if (sold === "sold" && unsold === "@") {
      return res.status(200).json({ maxSize: soldResponse });
    }
    return res.status(200).json({ maxSize: response });
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    return res.status(500).json("Internal server error");
  }
};

const maxPriceForAllProps = async (req, res) => {
  const { type, sell, rent, lease, flat, house } = req.params;
  try {
    let result = 0,
      response;
    if (type === "agricultural") {
      const fields = await fieldModel.find();
      fields.forEach((field) => {
        let price = field.landDetails.totalPrice;
        result = Math.max(result, price);
      });

      response = result;
    } else if (type === "residential") {
      let maxFlat = 0,
        maxHouse = 0;
      let maxPrice = 0;

      result = await residentialModel.find().exec();
      result.forEach((property) => {
        let price = 0;
        const propType = property.propertyDetails.type;
        price = property.propertyDetails.totalCost;
        if (!price) {
          price = 0;
        }
        if (propType === "Flat") {
          maxFlat = Math.max(price, maxFlat);
        } else if (propType === "House") {
          maxHouse = Math.max(price, maxHouse);
        }
      });
      if (flat === "flat") {
        maxPrice = Math.max(maxPrice, maxFlat);
      }
      if (house === "house") {
        maxPrice = Math.max(maxPrice, maxHouse);
      }
      if (flat === "@" && house === "@") {
        maxPrice = Math.max(maxPrice, maxFlat);
        maxPrice = Math.max(maxPrice, maxHouse);
      }
      response = maxPrice > 0 ? maxPrice : 0;
    } else if (type === "layout") {
      const plots = await layoutModel.find();
      plots.forEach((plot) => {
        result = Math.max(result, plot.layoutDetails.totalAmount);
      });
      response = result;
    } else if (type === "commercial") {
      let maxSell = 0,
        maxRent = 0,
        maxLease = 0;
      let maxPrice = 0;

      commercialProperties = await commercialModel
        .find(
          {},
          {
            "propertyDetails.landDetails": 1,
          }
        )
        .exec();
      // Iterate over commercial properties and extract necessary fields
      commercialProperties.forEach((property) => {
        let price = 0;
        const { landDetails } = property.propertyDetails;

        // Check if land is for sale, rent, or lease
        if (landDetails.sell?.landUsage?.length > 0) {
          price = landDetails.sell.totalAmount;
          maxSell = Math.max(maxSell, price);
        } else if (landDetails.rent?.landUsage?.length > 0) {
          price = landDetails.rent.totalAmount;
          maxRent = Math.max(maxRent, price);
        } else if (landDetails.lease?.landUsage?.length > 0) {
          price = landDetails.lease.totalAmount;
          maxLease = Math.max(maxLease, price);
        }
      });
      if (sell === "sell") {
        maxPrice = Math.max(maxPrice, maxSell);
      }
      if (rent === "rent") {
        maxPrice = Math.max(maxPrice, maxRent);
      }
      if (lease === "lease") {
        maxPrice = Math.max(maxPrice, maxLease);
      }
      if (sell === "@" && rent === "@" && lease === "@") {
        maxPrice = Math.max(maxPrice, maxSell);
        maxPrice = Math.max(maxPrice, maxRent);
        maxPrice = Math.max(maxPrice, maxLease);
      }
      response = maxPrice > 0 ? maxPrice : 0;
    } else {
      return res.status(400).json("Invalid");
    }

    return res.status(200).json({ maxPrice: response });
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

const maximumSize = async (req, res) => {
  const result = await validateSlider.validateAsync(req.params);
  const { type, sell, rent, lease, flat, house, sold, unsold } = result;
  const userId = req.user.user.userId;

  try {
    let result = 0,
      unsoldResult = 0,
      soldResult = 0,
      response,
      unsoldResponse,
      soldResponse;
    if (type === "agricultural") {
      const fields = await fieldModel.find({ userId: userId });
      fields.forEach((field) => {
        let size = field.landDetails.size;
        result = Math.max(result, size);

        if (field.status == 0) {
          unsoldResult = Math.max(unsoldResult, size);
        } else if (field.status == 1) {
          soldResult = Math.max(soldResult, size);
        }
      });
      unsoldResponse = unsoldResult;
      soldResponse = soldResult;
      response = result;
    } else if (type === "residential") {
      let maxFlat = 0,
        maxHouse = 0,
        maxUnsoldFlat = 0,
        maxUnsoldHouse = 0,
        maxsoldFlat = 0,
        maxsoldHouse = 0;
      let maxSize = 0,
        maxUnsoldSize = 0,
        maxsoldSize = 0;

      result = await residentialModel.find({ userId: userId }).exec();
      result.forEach((property) => {
        let size = 0;
        const propType = property.propertyDetails.type;
        size = property.propertyDetails.flatSize;
        if (!size) {
          size = 0;
        }
        if (propType === "Flat") {
          maxFlat = Math.max(size, maxFlat);
          if (property.status == 0) {
            maxUnsoldFlat = Math.max(size, maxUnsoldFlat);
          } else {
            maxsoldFlat = Math.max(size, maxsoldFlat);
          }
        } else if (propType === "House") {
          maxHouse = Math.max(size, maxHouse);
          if (property.status == 0) {
            maxUnsoldHouse = Math.max(size, maxUnsoldHouse);
          } else {
            maxsoldHouse = Math.max(size, maxsoldHouse);
          }
        }
      });
      if (flat === "flat") {
        maxSize = Math.max(maxSize, maxFlat);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldFlat);
        maxsoldSize = Math.max(maxsoldSize, maxsoldFlat);
      }
      if (house === "house") {
        maxSize = Math.max(maxSize, maxHouse);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldHouse);
        maxsoldSize = Math.max(maxsoldSize, maxsoldHouse);
      }
      if (flat === "@" && house === "@") {
        maxSize = Math.max(maxSize, maxFlat);
        maxSize = Math.max(maxSize, maxHouse);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldFlat);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldHouse);
        maxsoldSize = Math.max(maxsoldSize, maxsoldFlat);
        maxsoldSize = Math.max(maxsoldSize, maxsoldHouse);
      }
      response = maxSize > 0 ? maxSize : 0;
      unsoldResponse = maxUnsoldSize > 0 ? maxUnsoldSize : 0;
      soldResponse = maxsoldSize > 0 ? maxsoldSize : 0;
    } else if (type === "layout") {
      const plots = await layoutModel.find({ userId: userId });
      plots.forEach((plot) => {
        result = Math.max(result, plot.layoutDetails.plotSize);
        if (plot.status == 0) {
          unsoldResult = Math.max(unsoldResult, plot.layoutDetails.plotSize);
        } else {
          soldResult = Math.max(soldResult, plot.layoutDetails.plotSize);
        }
      });
      unsoldResponse = unsoldResult;
      soldResponse = soldResult;
      response = result;
    } else if (type === "commercial") {
      let maxSell = 0,
        maxRent = 0,
        maxLease = 0,
        maxUnsoldSell = 0,
        maxUnsoldRent = 0,
        maxUnsoldLease = 0,
        maxsoldSell = 0,
        maxsoldRent = 0,
        maxsoldLease = 0;
      let maxSize = 0,
        maxUnsoldSize = 0,
        maxsoldSize = 0;

      commercialProperties = await commercialModel
        .find({ userId: userId })
        .exec();
      // Iterate over commercial properties and extract necessary fields
      commercialProperties.forEach((property) => {
        let size = 0;
        const { landDetails } = property.propertyDetails;

        // Check if land is for sale, rent, or lease
        if (landDetails.sell?.landUsage?.length > 0) {
          size = landDetails.sell.plotSize;
          maxSell = Math.max(maxSell, size);
          if (property.status == 0) {
            maxUnsoldSell = Math.max(maxUnsoldSell, size);
          } else {
            maxsoldSell = Math.max(maxsoldSell, size);
          }
        } else if (landDetails.rent?.landUsage?.length > 0) {
          size = landDetails.rent.plotSize;
          maxRent = Math.max(maxRent, size);
          if (property.status == 0) {
            maxUnsoldRent = Math.max(maxUnsoldRent, size);
          } else {
            maxsoldRent = Math.max(maxsoldRent, size);
          }
        } else if (landDetails.lease?.landUsage?.length > 0) {
          size = landDetails.lease.plotSize;
          maxLease = Math.max(maxLease, size);
          if (property.status == 0) {
            maxUnsoldLease = Math.max(maxUnsoldLease, size);
          } else {
            maxsoldLease = Math.max(maxsoldLease, size);
          }
        }
      });
      if (sell === "sell") {
        maxSize = Math.max(maxSize, maxSell);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldSell);
        maxsoldSize = Math.max(maxsoldSize, maxsoldSell);
      }
      if (rent === "rent") {
        maxSize = Math.max(maxSize, maxRent);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldRent);
        maxsoldSize = Math.max(maxsoldSize, maxsoldRent);
      }
      if (lease === "lease") {
        maxSize = Math.max(maxSize, maxLease);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldLease);
        maxsoldSize = Math.max(maxsoldSize, maxsoldLease);
      }
      if (sell === "@" && rent === "@" && lease === "@") {
        maxSize = Math.max(maxSize, maxSell);
        maxSize = Math.max(maxSize, maxRent);
        maxSize = Math.max(maxSize, maxLease);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldSell);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldRent);
        maxUnsoldSize = Math.max(maxUnsoldSize, maxUnsoldLease);
        maxsoldSize = Math.max(maxsoldSize, maxsoldSell);
        maxsoldSize = Math.max(maxsoldSize, maxsoldRent);
        maxsoldSize = Math.max(maxsoldSize, maxsoldLease);
      }
      response = maxSize > 0 ? maxSize : 0;
      unsoldResponse = maxUnsoldSize > 0 ? maxUnsoldSize : 0;
      soldResponse = maxsoldSize > 0 ? maxsoldSize : 0;
    } else {
      return res.status(400).json("Invalid");
    }

    if (unsold === "unsold" && sold === "@") {
      return res.status(200).json({ maxSize: unsoldResponse });
    } else if (sold === "sold" && unsold === "@") {
      return res.status(200).json({ maxSize: soldResponse });
    }
    return res.status(200).json({ maxSize: response });
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    return res.status(500).json("Internal server error");
  }
};

const getCountOfRatings = async (req, res) => {
  const { propertyId, propertyType } = req.params;
  let five = 0,
    four = 0,
    three = 0,
    two = 0,
    one = 0,
    zero = 0;

  try {
    const ratings = await propertyRatingModel
      .find({ propertyId, propertyType })
      .sort({ userId: 1, createdAt: -1 }); // Sort by userId and createdAt to get latest rating per user

    if (ratings.length === 0) {
      return res.status(404).json("NO RATING FOUND FOR THIS PROPERTY");
    }

    // Filter to get only the latest rating per user
    const latestRatings = [];
    const seenUsers = new Set();

    for (const rating of ratings) {
      if (!seenUsers.has(rating.userId)) {
        latestRatings.push(rating);
        seenUsers.add(rating.userId);
      }
    }

    // Count ratings
    latestRatings.forEach((rating) => {
      if (rating.rating >= 4.5) {
        five++;
      } else if (rating.rating >= 3.5 && rating.rating < 4.5) {
        four++;
      } else if (rating.rating >= 2.5 && rating.rating < 3.5) {
        three++;
      } else if (rating.rating >= 1.5 && rating.rating < 2.5) {
        two++;
      } else if (rating.rating >= 0.5 && rating.rating < 1.5) {
        one++;
      } else {
        zero++;
      }
    });

    const result = {
      fiveStar: five,
      fourStar: four,
      threeStar: three,
      twoStar: two,
      oneStar: one,
      zeroStar: zero,
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

const propertyFilters = async (req, res) => {
  try {
    res.status(200).json("Hello");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const updatePropertyDetails = async (req, res) => {
  try {
    const propertyType = req.body.propertyType;
    const propertyId = req.body.propertyId;
    const data = req.body;
    let status;
    if (propertyType === "Layout") {
      status = await layoutModel.findByIdAndUpdate({ _id: propertyId }, data, {
        new: true,
        runValidators: true,
      });
    } else if (propertyType === "Residential") {
      status = await residentialModel.findByIdAndUpdate(
        { _id: propertyId },
        data,
        {
          new: true,
          runValidators: true,
        }
      );
    } else if (propertyType === "Commercial") {
      status = await commercialModel.findByIdAndUpdate(
        { _id: propertyId },
        data,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      status = await fieldModel.findByIdAndUpdate({ _id: propertyId }, data, {
        new: true,
        runValidators: true,
      });
    }
    if (!status) {
      res.status(409).json("Property Update Failed");
    }
    res.status(200).json("Property Updates Successfully");
  } catch (error) {
    console.log(error);

    res.status(500).json("Internal Server Error");
  }
};

const propertyBasedOnDistrict = async (req, res) => {
  try {
    const userId = req.user.user.userId;

    const { page, limit } = req.query;

    const userData = await userModel.findById(userId);
    const userDistrict = userData.district;
    let fields = [];
    let residentials = [];
    let commercials = [];
    let layouts = [];
    if (page && limit) {
      let offset = (page - 1) * limit;
      fields = await fieldModel
        .find({ "address.district": userDistrict })
        .skip(offset)
        .limit(limit / 2);
      residentials = await residentialModel
        .find({ "address.district": userDistrict })
        .skip(offset)
        .limit(limit / 2);
      commercials = await commercialModel
        .find({ "address.disrict": userDistrict })
        .skip(offset)
        .limit(limit / 2);
      layouts = await layoutModel
        .find({ "address.district": userDistrict })
        .skip(offset)
        .limit(limit / 2);
    } else {
      (fields = await fieldModel.find({ "address.district": userDistrict })),
        (residentials = await residentialModel.find({
          "address.district": userDistrict,
        })),
        (commercials = await commercialModel.find({
          "propertyDetails.landDetails.address.district": userDistrict,
        })),
        (layouts = await layoutModel.find({
          "layoutDetails.address.district": userDistrict,
        }));
    }

    const properties = [...fields, ...residentials, ...commercials, ...layouts];

    if (properties.length === 0) {
      return res
        .status(404)
        .json({ message: "No properties found in the specified district" });
    }

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const residentialSearch = async (req, res) => {
  try {
    res.status(200).json("abcd");

    console.log(req);
  } catch (error) {
    res.status(500).json("Internal Server Error");
    console.log(error);
  }
};

const getAllProperties1 = async (req, res) => {
  try {
    let fields = [];
    let residentials = [];
    let commercials = [];
    let layouts = [];

    let page = req.query.page;
    let limit = req.query.limit;

    const fieldsCount = await fieldModel.countDocuments();
    const commercialCount = await commercialModel.countDocuments();
    const residentialCount = await residentialModel.countDocuments();
    const layoutCount = await layoutModel.countDocuments();
    let fieldProperties,
      residentialProperties,
      commercialProperties,
      layoutProperties;

    let offset = (page - 1) * limit;

    if (fieldsCount > 4) {
      fieldProperties = await fieldModel
        .find(
          {},
          {
            "landDetails.images": 1,
            "address.district": 1,
            "landDetails.title": 1,
            "landDetails.size": 1,
            "landDetails.totalPrice": 1,
            "landDetails.sizeUnit": 1,
            propertyType: 1,
            propertyInterestedCount: 1,
            propertyId: 1,
            "address.districtTe": 1,
            "landDetails.titleTe": 1,
            propertyTypeTe: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit / 4);
    } else {
      fieldProperties = await fieldModel
        .find(
          {},
          {
            "landDetails.images": 1,
            "address.district": 1,
            "landDetails.title": 1,
            "landDetails.size": 1,
            "landDetails.totalPrice": 1,
            "landDetails.sizeUnit": 1,
            propertyType: 1,
            propertyInterestedCount: 1,
            propertyId: 1,
            "address.districtTe": 1,
            "landDetails.titleTe": 1,
            propertyTypeTe: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit / 4);
    }

    // Iterate over field properties and push to the fields array
    fieldProperties.forEach((property) => {
      fields.push({
        propertyId: property.id,
        propId: property.propertyId,
        propertyType: property.propertyType,
        propertyTypeTe: property.propertyTypeTe || property.propertyTypeTe,
        images: property.landDetails.images,
        price: property.landDetails.totalPrice,
        size: property.landDetails.size,
        sizeUnit: property.landDetails.sizeUnit,
        title: property.landDetails.title,
        titleTe: property.landDetails.titleTe || property.landDetails.title,
        district: property.address.district,
        districtTe: property.address.districtTe || property.address.district,
        propertyInterestedCount: property.propertyInterestedCount,
      });
    });

    if (residentialCount > 4) {
      residentialProperties = await residentialModel
        .find(
          {},
          {
            propPhotos: 1,
            "propertyDetails.apartmentName": 1,
            "propertyDetails.apartmentNameTe": 1,
            "propertyDetails.flatCost": 1,
            "propertyDetails.flatSize": 1,
            "address.district": 1,
            "address.districtTe": 1,
            "propertyDetails.sizeUnit": 1,
            propertyInterestedCount: 1,
            propertyType: 1,
            propertyId: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit / 4);
    } else {
      residentialProperties = await residentialModel
        .find(
          {},
          {
            propPhotos: 1,
            "propertyDetails.apartmentName": 1,
            "propertyDetails.apartmentNameTe": 1,
            "propertyDetails.flatCost": 1,
            "propertyDetails.flatSize": 1,
            "address.districtTe": 1,
            "address.district": 1,
            "propertyDetails.sizeUnit": 1,
            propertyInterestedCount: 1,
            propertyType: 1,
            propertyId: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit / 4);
    }

    // Iterate over residential properties and push to the residentials array
    residentialProperties.forEach((property) => {
      residentials.push({
        propertyId: property.id,
        propId: property.propertyId,
        propertyInterestedCount: property.propertyInterestedCount,
        propertyType: property.propertyType,
        images: property.propPhotos,
        price: property.propertyDetails.flatCost,
        size: property.propertyDetails.flatSize,
        sizeUnit: property.propertyDetails.sizeUnit,
        title: property.propertyDetails.apartmentName,
        sizeUnitTe:
          property.propertyDetails.sizeUnitTe ||
          property.propertyDetails.sizeUnit,
        titleTe:
          property.propertyDetails.apartmentNameTe ||
          property.propertyDetails.apartmentName,
        district: property.address.district,
        districtTe: property.address.districtTe || property.address.district,
      });
    });

    if (commercialCount > 4) {
      commercialProperties = await commercialModel
        .find(
          {},
          {
            "propertyDetails.landDetails": 1,
            "propertyDetails.uploadPics": 1,
            propertyTitle: 1,
            propertyTitleTe: 1,
            propertyType: 1,
            propertyInterestedCount: 1,
            propertyId: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit / 4);
    } else {
      commercialProperties = await commercialModel
        .find(
          {},
          {
            "propertyDetails.landDetails": 1,
            "propertyDetails.uploadPics": 1,
            propertyTitle: 1,
            propertyTitleTe: 1,
            propertyType: 1,
            propertyInterestedCount: 1,
            propertyId: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit / 4);
    }

    // Iterate over commercial properties and push to the commercials array
    commercialProperties.forEach((property) => {
      let price, size;
      const { landDetails } = property.propertyDetails;

      // Check if land is for sale, rent, or lease
      if (landDetails.sell?.landUsage?.length > 0) {
        price = landDetails.sell.totalAmount;
        size = landDetails.sell.plotSize;
      } else if (landDetails.rent?.landUsage?.length > 0) {
        price = landDetails.rent.totalAmount;
        size = landDetails.rent.plotSize;
      } else if (landDetails.lease?.landUsage?.length > 0) {
        price = landDetails.lease.totalAmount;
        size = landDetails.lease.plotSize;
      }

      commercials.push({
        propertyId: property.id,
        propId: property.propertyId,
        propertyType: property.propertyType,
        propertyTypeTe: property.propertyTypeTe || property.propertyType,
        images: property.propertyDetails.uploadPics,
        price: price,
        size: size,
        sizeUnit:
          landDetails.sell?.sizeUnit ||
          landDetails.lease?.sizeUnit ||
          landDetails.rent?.sizeUnit ||
          "NA",
        title: property.propertyTitle,
        district: landDetails?.address?.district || "NA",
        titleTe: property.propertyTitleTe || property.propertyTitle,
        districtTe:
          landDetails?.address?.districtTe || landDetails?.address?.district,
        propertyInterestedCount: property.propertyInterestedCount,
      });
    });

    if (layoutCount > 4) {
      layoutProperties = await layoutModel
        .find(
          {},
          {
            uploadPics: 1,
            "layoutDetails.layoutTitle": 1,
            "layoutDetails.layoutTitleTe": 1,
            "layoutDetails.plotSize": 1,
            "layoutDetails.totalAmount": 1,
            "layoutDetails.address.district": 1,
            "layoutDetails.address.districtTe": 1,
            "layoutDetails.sizeUnit": 1,
            propertyInterestedCount: 1,
            propertyType: 1,
            propertyId: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit / 4);
    } else {
      layoutProperties = await layoutModel
        .find(
          {},
          {
            uploadPics: 1,
            "layoutDetails.layoutTitle": 1,
            "layoutDetails.layoutTitleTe": 1,
            "layoutDetails.plotSize": 1,
            "layoutDetails.totalAmount": 1,
            "layoutDetails.address.district": 1,
            "layoutDetails.address.districtTe": 1,
            "layoutDetails.sizeUnit": 1,
            propertyInterestedCount: 1,
            propertyType: 1,
            propertyId: 1,
          }
        )
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit / 4);
    }

    // Iterate over layout properties and push to the layouts array
    layoutProperties.forEach((property) => {
      layouts.push({
        propertyId: property.id,
        propId: property.propertyId,
        propertyType: property.propertyType,
        propertyTypeTe: property.propertyTypeTe || "NA",
        images: property.uploadPics,
        price: property.layoutDetails.totalAmount,
        size: property.layoutDetails.plotSize,
        sizeUnit: property.layoutDetails.sizeUnit || "NA",
        sizeUnitTe: property.layoutDetails.sizeUnitTe || "NA",
        title: property.layoutDetails.layoutTitle,
        district: property.layoutDetails.address.district,
        titleTe: property.layoutDetails.layoutTitleTe || "NA",
        districtTe: property.layoutDetails.address.districtTe || "NA",
        propertyInterestedCount: property.propertyInterestedCount,
      });
    });

    // Combine all properties into one array
    const allProperties = [
      ...fields,
      ...residentials,
      ...commercials,
      ...layouts,
    ];

    // Check if any properties were found
    if (allProperties.length === 0) {
      return res.status(409).json({ message: "No properties found" });
    }

    // Send the combined result back to the client
    res.status(200).json(allProperties.sort());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching properties", error });
  }
};

module.exports = {
  getPropertiesByLocation, //unused
  getPropertiesByUserId, //only fields(unused)
  insertPropertyRatings,
  getPropertiesByType, //by type
  getPropertyRatings, //unused
  getPropertiesById, // by id and type
  getAllProperties, // for landing page
  updatePropertyStatus, // to mark a property as sold and unsold
  resetRatings, // my use
  getLatestProps, // banner
  getProperty, // get property by type or by userId or by propertyId
  maxPrice, //to get max price
  getPropsByLocation, // location filter,
  maximumSize,
  maximumSizeForAllProps,
  maxPriceForAllProps,
  getCountOfRatings,
  getMyPropsByLocation,
  propertyBasedOnLocation,
  propertyFilters,
  updatePropertyDetails,
  plansBasedProperties,
  recentlyAddedProperties,
  propertyBasedOnDistrict,
  residentialSearch,
  getAllProperties1,
};
