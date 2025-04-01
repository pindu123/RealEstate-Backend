const districtModel = require("../models/districtModel");
const locationModel = require("../models/locationModel");

const getLocationByPincode = async (req, res) => {
  try {
    const { pincode, district, mandal } = req.params;

    if (!pincode) {
      return res.status(400).json({ message: "Pincode not found in request" });
    }

    const query = {
      "villages.0": { $exists: true },
    };

    if (district !== "@") {
      query.district = district;
    }

    if (mandal !== "@") {
      query.mandal = mandal;
    }

    const locations = await districtModel.find(query);
    console.log(query);
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

const getMandalsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;

    if (!district) {
      return res.status(400).json({ message: "District not found in request" });
    }

    const locations = await districtModel.find({ district });

    const mandals = [...new Set(locations.map((location) => location.mandal))];

    if (mandals.length === 0) {
      return res
        .status(404)
        .json({ message: "No mandals found for this district" });
    }
    mandals.sort();
    res.status(200).json({ mandals });
  } catch (error) {
    console.error("Error fetching mandals:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getVillagesByMandal = async (req, res) => {
  try {
    const { mandal } = req.params;

    if (!mandal) {
      return res.status(400).json({ message: "Mandal not found in request" });
    }

    const locations = await districtModel.find({ mandal });

    let villagesData = locations[0].villages;
    console.log(villagesData);

    let villages = [];

    villagesData.forEach((village) => {
      villages.push(village.villageName);
    });

    if (villages.length === 0) {
      return res
        .status(404)
        .json({ message: "No villages found for this mandal" });
    }

    res.status(200).json(villages.sort());
  } catch (error) {
    console.error("Error fetching villages:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getAllMandals = async (req, res) => {
  try {
    const mandals = await locationModel.distinct("mandal");
    if (mandals.length === 0) {
      res.status(400).json("Mandals not found");
    }
    res.status(200).json(mandals.sort());
  } catch (error) {
    console.error("Error fetching mandals:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

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
  getAllMandals,  
  getAllVillages,  
};
