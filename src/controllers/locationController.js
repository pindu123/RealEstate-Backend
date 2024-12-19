// Import necessary modules
const districtModel = require("../models/districtModel");
const locationModel = require("../models/locationModel");

const getLocationByPincode = async (req, res) => {
  try {
    const { pincode, district, mandal } = req.params;

    if (!pincode) {
      return res.status(400).json({ message: "Pincode not found in request" });
    }

    // Build the query dynamically based on the params
    const query = {
      "villages.0": { $exists: true },
    };

    // If district is not '@', add it to the query
    if (district !== "@") {
      query.district = district;
    }

    // If mandal is not '@', add it to the query
    if (mandal !== "@") {
      query.mandal = mandal;
    }

    // Find all documents matching the built query
    const locations = await districtModel.find(query);
    console.log(query);
    // Initialize the result structure
    const result = {
      districts: [],
      mandals: [],
      villages: [],
    };

    // Process each location
    // locations.forEach((location) => {
    //   const villageObject = location.villages[0];
    //   const matchingVillages = Object.keys(villageObject).filter(
    //     (key) => villageObject[key] === pincode
    //   );

    //   if (matchingVillages.length > 0) {
    //     // Add district and mandal to result arrays if not already present
    //     if (!result.districts.includes(location.district)) {
    //       result.districts.push(location.district);
    //     }
    //     if (!result.mandals.includes(location.mandal)) {
    //       result.mandals.push(location.mandal);
    //     }

    //     // Add matching villages to the result
    //     result.villages.push(...matchingVillages);
    //   }
    // });

    locations.forEach((location) => {
      //   for (let loc of location)
      //   {
      //               const villageObject = location.villages[0];

      //   }

      // console.log(location.villages);

      const villageObject = location.villages;
      let villagesData = [];
      const matchingVillages = Object.keys(villageObject).filter(
        (key) => villageObject[key] === pincode
      );

      villageObject.forEach((vil) => {
        if (vil.pincode === pincode) {
          villagesData.push(vil.villageName);
        }
        // console.log(vil.villageName, vil.pincode);
      });

      if (villagesData.length > 0) {
        if (!result.districts.includes(location.district)) {
          result.districts.push(location.district);
        }
        if (!result.mandals.includes(location.mandal)) {
          result.mandals.push(location.mandal);
        }

        result.villages.push(...villagesData);
      }
    });

    // Remove duplicate villages
    result.villages = [...new Set(result.villages)];

    // If no matching villages are found
    if (result.villages.length === 0) {
      return res
        .status(404)
        .json({ message: "No villages found for this pincode" });
    }
    result.mandals.sort();
    result.villages.sort();
    result.districts.sort();
    // Return the results
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching villages:", error);
    // Internal server error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//get mandals based on district
const getMandalsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;

    // Check if district is provided
    if (!district) {
      return res.status(400).json({ message: "District not found in request" });
    }

    // Find all documents matching the specified district
    const locations = await districtModel.find({ district });

    // Extract and collect unique mandals
    const mandals = [...new Set(locations.map((location) => location.mandal))];

    // If no mandals are found
    if (mandals.length === 0) {
      return res
        .status(404)
        .json({ message: "No mandals found for this district" });
    }
    mandals.sort();
    // Return the list of mandals
    res.status(200).json({ mandals });
  } catch (error) {
    console.error("Error fetching mandals:", error);
    // Internal server error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//get villages by mandal
const getVillagesByMandal = async (req, res) => {
  try {
    const { mandal } = req.params;

    // Check if mandal is provided
    if (!mandal) {
      return res.status(400).json({ message: "Mandal not found in request" });
    }

    // Find all documents matching the specified mandal
    const locations = await districtModel.find({ mandal });

    let villagesData = locations[0].villages;
    console.log(villagesData);

    let villages = [];

    villagesData.forEach((village) => {
      villages.push(village.villageName);
    });

    // If no villages are found
    if (villages.length === 0) {
      return res
        .status(404)
        .json({ message: "No villages found for this mandal" });
    }

    // Return the list of villages
    res.status(200).json(villages.sort());
  } catch (error) {
    console.error("Error fetching villages:", error);
    // Internal server error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//display all mandals
const getAllMandals = async (req, res) => {
  try {
    const mandals = await locationModel.distinct("mandal");
    if (mandals.length === 0) {
      res.status(400).json("Mandals not found");
    }
    res.status(200).json(mandals.sort());
  } catch (error) {
    console.error("Error fetching mandals:", error);
    // Internal server error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//get all villages
const getAllVillages = async (req, res) => {
  try {
    const villagesData = await locationModel.find({}, { villages: 1 }); // Fetch the entire 'villages' array
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
    //console.log(villageNames);
    res.status(200).json(villageNames.sort());
  } catch (error) {
    console.error("Error fetching mandals:", error);
    // Internal server error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
module.exports = {
  getLocationByPincode,
  getMandalsByDistrict,
  getVillagesByMandal,
  getAllMandals, //unused
  getAllVillages, //unused
};
