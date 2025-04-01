// // services/propertyService.js

// const PropertyReservation = require('../models/PropertyReservation');
// const Residential = require('../models/Residential');
// const Layout = require('../models/Layout');
// const AgriculturalLand = require('../models/AgriculturalLand');
// const Commercial = require('../models/Commercial');
// const residentialModel = require('../models/residentialModel');
// const layoutModel = require('../models/layoutModel');
// const fieldModel = require('../models/fieldModel');
// const commercialModel = require('../models/commercialModel');
// const propertyReservation = require('../models/propertyReservation');

// async function updatePropertyOnHoldStatus() {
//   try {
//     console.log('in updating reserved properties checking')
//     const currentDate = new Date();
//     const fourteenDaysAgo = new Date();
//     fourteenDaysAgo.setDate(currentDate.getDate() - 14); // 14 days ago

//     // Step 1: Find all PropertyReservation entries with startDate 14 days ago and reservationStatus true
//     const reservations = await propertyReservation.find({
//       startDate: { $lte: fourteenDaysAgo },
//       reservationStatus: true,
//     });

//     if (reservations.length > 0) {
//       // Step 2: Loop through each reservation
//       for (const reservation of reservations) {
//         // Update reservationStatus to false
//         await PropertyReservation.updateOne(
//           { _id: reservation._id },
//           { $set: { reservationStatus: false } }
//         );

//         // Step 3: Based on propertyType, find the corresponding model and update the propertyOnHold field
//         let propertyModel;
//         switch (reservation.propertyType) {
//           case 'Residential':
//             propertyModel = residentialModel;
//             break;
//           case 'Layout':
//             propertyModel = layoutModel;
//             break;
//           case 'Agricultural land':
//             propertyModel = fieldModel;
//             break;
//           case 'Commercial':
//             propertyModel = commercialModel;
//             break;
//           default:
//             console.log('Unknown property type:', reservation.propertyType);
//             continue;
//         }

//         // Step 4: Find the property by propId and update the propertyOnHold field to 'no'
//         await propertyModel.updateOne(
//           { _id:new ObjectId(reservation.propId) },
//           { $set: { propertyOnHold: 'no' } }
//         );
//       }
//     }

//     console.log('Property updates completed.');
//   } catch (error) {
//     console.error('Error updating properties:', error);
//   }
// }

// module.exports = {
//   updatePropertyOnHoldStatus,
// };

// services/propertyService.js

const { ObjectId } = require("mongoose").Types; // Import ObjectId from mongoose
const residentialModel = require("../models/residentialModel");
const layoutModel = require("../models/layoutModel");
const fieldModel = require("../models/fieldModel");
const commercialModel = require("../models/commercialModel");
const propertyReservation = require("../models/propertyReservation");

async function updatePropertyOnHoldStatus() {
  try {
    const currentDate = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(currentDate.getDate() - 14); // 14 days ago

    // Step 1: Find all PropertyReservation entries with startDate 14 days ago and reservationStatus true
    const reservations = await propertyReservation.find({
      startDate: { $lte: fourteenDaysAgo },
      reservationStatus: true,
    });

    if (reservations.length > 0) {
      // Step 2: Loop through each reservation
      for (const reservation of reservations) {
        // Update reservationStatus to false
        await propertyReservation.updateOne(
          { _id: reservation._id },
          { $set: { reservationStatus: false } }
        );

        // Step 3: Based on propertyType, find the corresponding model and update the propertyOnHold field
        let propertyModel;
        switch (reservation.propertyType) {
          case "Residential":
            propertyModel = residentialModel;
            break;
          case "Layout":
            propertyModel = layoutModel;
            break;
          case "Agricultural land":
            propertyModel = fieldModel;
            break;
          case "Commercial":
            propertyModel = commercialModel;
            break;
          default:
            console.log("Unknown property type:", reservation.propertyType);
            continue;
        }

        // Step 4: Find the property by propId and update the propertyOnHold field to 'no'
        await propertyModel.updateOne(
          { _id: new ObjectId(reservation.propId) }, // Convert propId to ObjectId
          { $set: { propertyOnHold: "no" } }
        );
      }
    }

    console.log("Property updates completed.");
  } catch (error) {
    console.error("Error updating properties:", error);
  }
}

module.exports = {
  updatePropertyOnHoldStatus,
};
