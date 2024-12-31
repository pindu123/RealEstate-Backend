const userModel = require("../models/userModel");
const CustomerAssignment = require("../models/customerAssignmentModel");
const customerModel = require("../models/customerModel");
const fieldModel = require("../models/fieldModel");
const layoutModel = require("../models/layoutModel");
const residentialModel = require("../models/residentialModel");
const commercialModel = require("../models/commercialModel");
const nodemailer=require("nodemailer");


const saltRounds = 10; // Define the number of salt rounds for bcrypt hashing

// const addMarketingAgent = async (req, res) => {
//   try {
//     // Getting user data from req.user
//     const roleId = req.user.user.role;
//     let addedBy = req.user.user.userId;

//     // Destructure request body to get marketing agent data
//     const {
//       firstName,
//       lastName,
//       phoneNumber,
//       email,
//       pinCode,
//       city,
//       state,
//       country,
//       district,
//       mandal,
//       profilePicture,
//       identityProof,
//       role,  // Marketing agent role
//     } = req.body;

//     let assignedCsr;
//     if (roleId === 5) {
//       // If the logged-in user is CSR, assign the CSR as the agent
//       assignedCsr = req.user.user.userId;
//     }

//     // Validate required fields
//     if (!firstName || !lastName || !email || !phoneNumber) {
//       return res.status(400).json({
//         message: "Required fields: firstName, lastName, email, phoneNumber"
//       });
//     }

//     // Generate a password using firstName and lastName (length 6)
//     let generatedPassword = (firstName.slice(0, 3) + lastName.slice(0, 3)).toLowerCase();
    
//     // Ensure the password is always 6 characters
//     if (generatedPassword.length < 6) {
//       generatedPassword = generatedPassword.padEnd(6, 'x'); // Pad with 'x' if the length is less than 6
//     } else if (generatedPassword.length > 6) {
//       generatedPassword = generatedPassword.substring(0, 6); // Truncate if length is greater than 6
//     }

//     // Hash the password before saving it
//     const salt = await bcrypt.genSalt(saltRounds);
//     const hashedPassword = await bcrypt.hash(generatedPassword, salt);

//     // Create new marketing agent
//     const newAgent = new userModel({
//       firstName,
//       lastName,
//       phoneNumber,
//       email,
//       pinCode,
//       city,
//       state,
//       country,
//       district,
//       mandal,
//       role,  // Assign role to the new agent
//       addedBy,
//       profilePicture,
//       assignedCsr,
//       identityProof: identityProof || [],
//       password: hashedPassword, // Save the hashed password
//     });

//     // Save the new agent to the database
//     await newAgent.save();

//     // If the role is 6 (Marketing Agent), send an email with the password
//     if (role === 6) {
//       // Set up the email transporter
//       const transporter = nodemailer.createTransport({
//         service: "Gmail", // You can use any other service here
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS,
//         },
//       });

//       // Set up email content
//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: newAgent.email, // Use newAgent.email here
//         subject: "Your Account Details",
//         text: `Hello ${newAgent.firstName},\n\nYour account has been successfully created.\n\nHere are your account details:\nUser ID: ${newAgent.email}\nPassword: ${generatedPassword}\nYou can reset your password here: http://172.17.15.209:3000/resetPassword\nPlease keep this information secure.\n\nBest regards,\nReal Estate Team`,
//       };

//       // Send the email
//       await transporter.sendMail(mailOptions)
//         .then((result) => {
//           console.log("Email sent successfully", result);
//         })
//         .catch((err) => {
//           console.error("Error sending email", err);
//         });
//     }

//     // Respond with success message and new agent data
//     res.status(201).json({
//       message: "Marketing agent added successfully",
//       data: newAgent
//     });
//   } catch (error) {
//     console.error("Error adding marketing agent:", error);
//     res.status(500).json({
//       message: "An error occurred while adding the marketing agent",
//       error: error.message
//     });
//   }
// };


const bcrypt = require('bcrypt');
const propertyAssignmentModel = require("../models/propertyAssignmentModel");

// Helper function to generate a random password
// const generatePassword = (firstName, lastName) => {
//   // Generate a base password by using firstName and lastName
//   let password = (firstName.slice(0, 3) + lastName.slice(0, 3)).toLowerCase();

//   // Ensure the password is at least 6 characters
//   if (password.length < 6) {
//     password = password.padEnd(6, 'x'); // Pad with 'x' if the length is less than 6
//   } else if (password.length > 6) {
//     password = password.substring(0, 6); // Truncate if length is greater than 6
//   }

//   // Ensure password starts with a capital letter
//   password = password.charAt(0).toUpperCase() + password.slice(1);

//   // Add a digit, a lowercase letter, and a special character
//   const specialCharacters = "!@#$%^&*()-_=+";
//   const digit = Math.floor(Math.random() * 10); // Random digit
//   const specialChar = specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

//   // Randomly insert a digit, lowercase letter, and special character in the password
//   password = password.replace(/[a-zA-Z]/, password.charAt(0).toUpperCase()); // Ensure it's capitalized

//   password = password.substring(0, 4) + digit + password.charAt(4) + specialChar;

//   // Final check to ensure password length is still 6
//   if (password.length > 6) {
//     password = password.substring(0, 6);
//   }

//   return password;
// };
function generatePassword(firstName, lastName) {
  const specialChars = "!@#$%^&*()_-+=<>?/{}[]|";

  // Take parts of the first and last name (first 2 letters from each)
  let namePart = firstName.slice(0, 1).toUpperCase() + firstName.slice(1, 2).toLowerCase() + lastName.slice(0, 1).toLowerCase();

  // Randomly add a special character from the list of special characters
  let specialChar = specialChars[Math.floor(Math.random() * specialChars.length)];

  // Generate a random number to add to the password
  let randomNum = Math.floor(Math.random() * 10);

  // Concatenate the name part, special character, and number to form the password
  let password = namePart + specialChar + randomNum;

  // Ensure the password is exactly 8 characters long by adding random characters if necessary
  while (password.length < 8) {
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  }

  // Shuffle the password to make it more secure (mix namePart, special character, and random numbers)
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  // Ensure the password is secure and starts with a capital letter
  password = password.charAt(0).toUpperCase() + password.slice(1);

  return password;
}




const addMarketingAgent = async (req, res) => {
  try {
    // Getting user data from req.user
    const roleId = req.user.user.role;
    let addedBy = req.user.user.userId;

    // Destructure request body to get marketing agent data
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      pinCode,
      city,
      state,
      country,
      district,
      mandal,
      profilePicture,
      identityProof,
      role,  // Marketing agent role
    } = req.body;

    let assignedCsr;
    if (roleId === 5) {
      // If the logged-in user is CSR, assign the CSR as the agent
      assignedCsr = req.user.user.userId;
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber) {
      return res.status(400).json({
        message: "Required fields: firstName, lastName, email, phoneNumber"
      });
    }

    // Generate a password using firstName and lastName (length 8)
    let generatedPassword = generatePassword(firstName, lastName);

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    // Create new marketing agent
    const newAgent = new userModel({
      firstName,
      lastName,
      phoneNumber,
      email,
      pinCode,
      city,
      state,
      country,
      district,
      mandal,
      role,  // Assign role to the new agent
      addedBy,
      profilePicture,
      assignedCsr,
      identityProof: identityProof || [],
      password: hashedPassword, // Save the hashed password
    });

    // Save the new agent to the database
    await newAgent.save();

    // If the role is 6 (Marketing Agent), send an email with the password
    if (role === 6) {
      // Set up the email transporter
      const transporter = nodemailer.createTransport({
        service: "Gmail", // You can use any other service here
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Set up email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: newAgent.email, 
        subject: "Your Account Details",
        text: `Hello ${newAgent.firstName},\n\nYour account has been successfully created.\n\nHere are your account details:\nUser ID: ${newAgent.email}\nPassword: ${generatedPassword}\nYou can reset your password here: http://172.17.15.209:3000/resetPassword\nPlease keep this information secure.\n\nBest regards,\nReal Estate Team`,
      };

      // Send the email
      await transporter.sendMail(mailOptions)
        .then((result) => {
          console.log("Email sent successfully", result);
        })
        .catch((err) => {
          console.error("Error sending email", err);
        });
    }

    // Respond with success message and new agent data
    res.status(201).json({
      message: "Marketing agent added successfully",
      data: newAgent
    });
  } catch (error) {
    console.error("Error adding marketing agent:", error);
    res.status(500).json({
      message: "An error occurred while adding the marketing agent",
      error: error.message
    });
  }
};


const getMarketingAgents = async (req, res) => {
  try {
    const role = req.user.user.role;
    const addedBy = req.user.user.userId;
    let marketingAgentData;
    if (role === 0) {
      marketingAgentData = await userModel.find();
    } else if (role === 5) {
      marketingAgentData = await userModel.find({ addedBy: addedBy });
    }
    if (!marketingAgentData) {
      return res.status(404).json({ message: "No Marketing Agent Data Found" });
    }
    return res.status(200).json({ data: marketingAgentData });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error !" });
  }
};

// api to get assigned customer to the marketing Agent
const getCustomersByAssignedTo = async (req, res) => {
  try {
    const role = req.user.user.userId;
    let assignedTo;
    if (role === 6) {
      assignedTo = req.user.user.userId;
    } else {
      assignedTo = req.params;
    }
    if (!assignedTo) {
      return res.status(400).json({
        message: "Please provide the assignedTo field (agent ID)"
      });
    }
    const assignments = await CustomerAssignment.find({ assignedTo });

    if (assignments.length === 0) {
      return res.status(404).json({
        message: "No customers assigned to the specified agent"
      });
    }

    const customerIds = assignments.flatMap(assignment => assignment.customerIds);
    const customers = await customerModel.find({ _id: { $in: customerIds } });

    if (customers.length === 0) {
      return res.status(404).json({
        message: "No customers found for the assigned agent"
      });
    }

    res.status(200).json({
      message: "Customer details fetched successfully",
      data: customers
    });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    res.status(500).json({
      message: "An error occurred while fetching customer details",
      error: error.message
    });
  }
};

// api to get the properties in marketng agent's district


// const myAreaProperties = async (req, res) => {
//     try {
//       const { user } = req.user;
//       const role = user.role;
//       let agentId;
//       if (role === 6) {
//         agentId = req.params.agentId; 
//       } else if (req.params.agentId) {
//         agentId = req.params.agentId; 
//       }
  
//       if (!agentId) {
//         return res.status(400).json({ message: "Agent ID is required" });
//       }
  
//       // Find the agent and their district
//       const agent = await userModel.findById(agentId);
//       if (!agent || !agent.district) {
//         return res.status(404).json({ message: "Marketing agent or district not found" });
//       }
  
//       const { district } = agent;
  
//       // Fetch properties in the agent's district concurrently
//       const [fieldData, layoutData, residentialData, commercialData] = await Promise.all([
//         fieldModel.find({ "address.district": district }),
//         layoutModel.find({ "layoutDetails.address.district": district }),
//         residentialModel.find({ "address.district": district }),
//         commercialModel.find({ "propertyDetails.landDetails.address.district": district }),
//       ]);
  
//       // Combine all property data
//       const properties = {
//         fieldData,
//         layoutData,
//         residentialData,
//         commercialData,
//       };
  
//       res.status(200).json({
//         message: "Properties found in the agent's district",
//         data: properties,
//       });
//     } catch (error) {
//       console.error("Error fetching properties:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   };
  
const myAreaProperties = async (req, res) => {
  try {
    const { user } = req.user;
    const role = user.role;
    let agentId;

    if (role === 6) {
      agentId = req.params.agentId;
    } else if (req.params.agentId) {
      agentId = req.params.agentId;
    }

    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required" });
    }

    // Find the agent and their district
    const agent = await userModel.findById(agentId);
    if (!agent || !agent.district) {
      return res.status(404).json({ message: "Marketing agent or district not found" });
    }

    const { district } = agent;

    // Fetch properties in the agent's district concurrently with required fields only
    const [fieldData, layoutData, residentialData, commercialData] = await Promise.all([
      fieldModel.find(
        { "address.district": district },
        {
          "ownerDetails.ownerName": 1,
          "landDetails.title": 1,
          "landDetails.price": 1,
          "landDetails.size": 1,
          "address.district": 1,
          "landDetails.images": 1,
        }
      ),
      layoutModel.find(
        { "layoutDetails.address.district": district },
        {
          "ownerDetails.ownerName": 1,
          "layoutDetails.layoutTitle": 1,
          "layoutDetails.plotPrice": 1,
          "layoutDetails.plotSize": 1,
          "layoutDetails.address.district": 1,
          "uploadPics": 1,
        }
      ),
      residentialModel.find(
        { "address.district": district },
        {
          "owner.ownerName": 1,
          "propertyDetails.apartmentName": 1,
          "propertyDetails.flatCost": 1,
          "propertyDetails.flatSize": 1,
          "address.district": 1,
          "propPhotos": 1,
        }
      ),
      commercialModel.find(
        { "propertyDetails.landDetails.address.district": district },
        {
          "propertyDetails.owner.ownerName": 1,
          "propertyTitle": 1,
          "propertyDetails.landDetails.price": 1,
          "propertyDetails.landDetails.plotSize": 1,
          "propertyDetails.landDetails.address.district": 1,
          "propertyDetails.uploadPics": 1,
        }
      ),
    ]);

    // Combine all property data
    const properties = {
      fieldData,
      layoutData,
      residentialData,
      commercialData,
    };

    res.status(200).json({
      message: "Properties found in the agent's district",
      data: properties,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const getAssignedCustomers = async (req, res) => {
//   try {
//     const assignedId = req.params.userId;
//     const role=req.params.role;
//     console.log(role, assignedId)

//     // const { user } = req.user;
//     // const role = user.role;
//     // const assignedId=user.userId;
   
//     let filterField;
//     if (role === 5 ||role === "5" ) {
//       filterField = "assignedBy";
//     } else if (role === 6|| role ==="6" ) {
//       filterField = "assignedTo";
//     } else {
//       return res.status(400).json({ message: "Invalid role. Must be 5 or 6." });
//     }

// //    const assignedId = req.params.assignedId;
//     if (!assignedId) {
//       return res.status(400).json({ message: "Assigned ID is required." });
//     }

//     // Fetch customer assignments based on the role
//     const assignments = await CustomerAssignment.find({ [filterField]: assignedId });

//     if (!assignments || assignments.length === 0) {
//       return res.status(404).json({ message: "No customers assigned for the given ID." });
//     }

//     // Extract customer IDs from the assignments
//     const customerIds = assignments.flatMap(assignment => assignment.customerIds);

//     // Fetch customer details
//     const customers = await customerModel.find(
//       { _id: { $in: customerIds } },
//       { firstName: 1, lastName: 1, email: 1, phoneNumber: 1, district: 1, village: 1, mandal: 1 }
//     );

//     res.status(200).json({
//       message: "Assigned customers retrieved successfully.",
//       data: customers.map(customer => ({
//         name: `${customer.firstName} ${customer.lastName}`,
//         email: customer.email,
//         phone: customer.phoneNumber,
//         district: customer.district,
//         village: customer.village,
//         mandal: customer.mandal,
//       })),
//     });
//   } catch (error) {
//     console.error("Error fetching assigned customers:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// to get entire details
// const getAssignedPropertyDetails = async (req, res) => {
//   try {
//     const assignedId = req.params.userId;
//     const role=req.params.role;
//     console.log(role, assignedId);

//     let filterField;
//     if (role === 5||role === "5") {
//       filterField = "assignedBy"; 
//     } else if (role === 6||role === "6") {
//       filterField = "assignedTo"; 
//     } else {
//       return res.status(400).json({ message: "Invalid role. Must be 5 or 6." });
//     }

//     if (!assignedId) {
//       return res.status(400).json({ message: "Assigned ID is required." });
//     }

//     // Fetch property assignments based on assignedId (either assignedBy or assignedTo)
//     const propertyAssignments = await propertyAssignmentModel.find({
//       [filterField]: assignedId,
//     });

//     if (!propertyAssignments || propertyAssignments.length === 0) {
//       return res.status(409).json({ message: "No properties assigned for the given ID." });
//     }

//     const propertyIds = propertyAssignments.flatMap(assignment => assignment.propertyIds);

//     // Fetch data from all property models using the propertyIds
//     const commercialProperties = await commercialModel.find({ _id: { $in: propertyIds } });
//     const fieldsProperties = await fieldModel.find({ _id: { $in: propertyIds } });
//     const layoutProperties = await layoutModel.find({ _id: { $in: propertyIds } });
//     const residentialProperties = await residentialModel.find({ _id: { $in: propertyIds } });

//     const allProperties = [
//       ...commercialProperties,
//       ...fieldsProperties,
//       ...layoutProperties,
//       ...residentialProperties
//     ];

//     if (allProperties.length === 0) {
//       return res.status(404).json({ message: "No property details found for the given propertyIds." });
//     }

//     // Send the response with all the property details
//     res.status(200).json({
    
//       data: allProperties.map(property => {
//         // Depending on propertyType, extract the relevant fields
//         let propertyDetails = {};
//         if (property.propertyType === "Commercial") {
//           propertyDetails = {
//             propertyType: property.propertyType,
//             propertyTitle: property.propertyTitle,
//             owner: property.propertyDetails.owner,
//             address: property.propertyDetails.address,
//             amenities: property.propertyDetails.amenities,
//             uploadPics: property.propertyDetails.uploadPics,
//           };
//         } else if (property.propertyType === "Agricultural land") {
//           propertyDetails = {
//             propertyType: property.propertyType,
//             ownerDetails: property.ownerDetails,
//             landDetails: property.landDetails,
//             address: property.address,
//             amenities: property.amenities,
//           };
//         } else if (property.propertyType === "Layout") {
//           propertyDetails = {
//             propertyType: property.propertyType,
//             layoutTitle: property.layoutDetails.layoutTitle,
//             description: property.layoutDetails.description,
//             address: property.layoutDetails.address,
//             amenities: property.layoutDetails.amenities,
//             uploadPics: property.layoutDetails.uploadPics,
//           };
//         } else if (property.propertyType === "Residential") {
//           propertyDetails = {
//             propertyType: property.propertyType,
//             apartmentName: property.propertyDetails.apartmentName,
//             flatNumber: property.propertyDetails.flatNumber,
//             address: property.propertyDetails.address,
//             amenities: property.propertyDetails.amenities,
//             propPhotos: property.propertyDetails.propPhotos,
//           };
//         }
//         return propertyDetails;
//       }),
//     });
//   } catch (error) {
//     console.error("Error fetching property details:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// const getAllAssignedPropertyDetails = async (req, res) => {
//   try {
//     const assignedId = req.params.userId;
//     const role = req.params.role;
//     console.log(role, assignedId);

//     let filterField;
//     if (role === 5 || role === "5") {
//       filterField = "assignedBy"; 
//     } else if (role === 6 || role === "6") {
//       filterField = "assignedTo";
//     } else {
//       return res.status(400).json({ message: "Invalid role. Must be 5 or 6." });
//     }
//     if (!assignedId) {
//       return res.status(400).json({ message: "Assigned ID is required." });
//     }
//    const propertyAssignments = await propertyAssignmentModel.find({
//       [filterField]: assignedId,
//     });
//     if (!propertyAssignments || propertyAssignments.length === 0) {
//       return res.status(409).json({ message: "No properties assigned for the given ID." });
//     }
//     const propertyIds = propertyAssignments.flatMap(assignment => assignment.propertyIds);
//    const commercialProperties = await commercialModel.find({ _id: { $in: propertyIds } });
//     const fieldsProperties = await fieldModel.find({ _id: { $in: propertyIds } });
//     const layoutProperties = await layoutModel.find({ _id: { $in: propertyIds } });
//     const residentialProperties = await residentialModel.find({ _id: { $in: propertyIds } });
//     const allProperties = [
//       ...commercialProperties,
//       ...fieldsProperties,
//       ...layoutProperties,
//       ...residentialProperties
//     ];
//     if (allProperties.length === 0) {
//       return res.status(404).json({ message: "No property details found for the given propertyIds." });
//     }
//  res.status(200).json({
//       data: allProperties.map(property => {
//         let propertyDetails = {};
//   if (property.propertyType === "Commercial") {
//           propertyDetails = {
//             propertyType: property.propertyType,
//             propertyTitle: property.propertyTitle,
//             ownerName: property.propertyDetails.owner ? property.propertyDetails.owner.ownerName : null,
//             landTitle: property.propertyTitle, // Assuming 'propertyTitle' is the land title for commercial properties
//             price: property.propertyDetails.landDetails ? property.propertyDetails.landDetails.price : null,
//             address: {
//               district: property.propertyDetails.address ? property.propertyDetails.address.district : null,
//               village: property.propertyDetails.address ? property.propertyDetails.address.village : null,
//               mandal: property.propertyDetails.address ? property.propertyDetails.address.mandal : null
//             },
//             images: property.propertyDetails.uploadPics || [],
//           };
//         } else if (property.propertyType === "Agricultural land") {
//           propertyDetails = {
//             propertyType: property.propertyType,
//             ownerName: property.ownerDetails ? property.ownerDetails.ownerName : null,
//             landTitle: property.landDetails ? property.landDetails.title : null,
//             price: property.landDetails ? property.landDetails.price : null,
//             address: {
//               district: property.address ? property.address.district : null,
//               village: property.address ? property.address.village : null,
//               mandal: property.address ? property.address.mandal : null
//             },
//             images: property.landDetails ? property.landDetails.images : [],
//           };
//         } else if (property.propertyType === "Layout") {
//           propertyDetails = {
//             propertyType: property.propertyType,
//             propertyTitle: property.layoutDetails ? property.layoutDetails.layoutTitle : null,
//             ownerName: property.ownerDetails ? property.ownerDetails.ownerName : null,
//             landTitle: property.layoutDetails ? property.layoutDetails.layoutTitle : null,
//             price: property.layoutDetails ? property.layoutDetails.plotPrice : null,
//             address: {
//               district: property.layoutDetails.address ? property.layoutDetails.address.district : null,
//               village: property.layoutDetails.address ? property.layoutDetails.address.village : null,
//               mandal: property.layoutDetails.address ? property.layoutDetails.address.mandal : null
//             },
//             images: property.layoutDetails ? property.layoutDetails.uploadPics : [],
//           };
//         } else if (property.propertyType === "Residential") {
//           propertyDetails = {
//             propertyType: property.propertyType,
//             apartmentName: property.propertyDetails ? property.propertyDetails.apartmentName : null,
//             ownerName: property.propertyDetails && property.propertyDetails.owner ? property.propertyDetails.owner.ownerName : null,
//             landTitle: property.propertyTitle, // Assuming 'propertyTitle' is the land title for residential properties
//             price: property.propertyDetails ? property.propertyDetails.flatCost : null,
//             address: {
//               district: property.propertyDetails && property.propertyDetails.address ? property.propertyDetails.address.district : null,
//               village: property.propertyDetails && property.propertyDetails.address ? property.propertyDetails.address.village : null,
//               mandal: property.propertyDetails && property.propertyDetails.address ? property.propertyDetails.address.mandal : null
//             },
//             images: property.propertyDetails ? property.propertyDetails.propPhotos : [],
//           };
//         }
//       return propertyDetails;
//       }),
//     });
//   } catch (error) {
//     console.error("Error fetching property details:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// Function to fetch assigned property details

const getAssignedCustomers = async (req, res) => {
  try {
    const { user } = req.user;
    const role = user.role;
    const assignedId = user.userId;

    console.log(role, assignedId);
    console.log(user);

    let filterField;
    if (role === 5) {
      filterField = "assignedBy";
    } else if (role === 6) {
      filterField = "assignedTo";
    } else {
      return res.status(400).json({ message: "Invalid role. Must be 5 or 6." });
    }

    if (!assignedId) {
      return res.status(400).json({ message: "Assigned ID is required." });
    }

    // Get assigned date from query, default to today's date if not provided
    const { assignedDate } = req.query;
    let date = assignedDate ? new Date(assignedDate) : new Date();

    if (isNaN(date)) {
      return res.status(400).json({ message: "Invalid assignedDate format." });
    }

    // Set start and end of the day (UTC)
    const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    // Log the date range for debugging
    console.log("Start of Day (UTC):", startOfDay.toISOString());
    console.log("End of Day (UTC):", endOfDay.toISOString());

    // Fetch customer assignments based on the assigned ID and assignedDate range
    const assignments = await CustomerAssignment.find({
      [filterField]: assignedId,
      assignedDate: { $gte: startOfDay, $lte: endOfDay }, // Use date range filter
    });

    console.log("Assignments fetched:", assignments);

    if (!assignments || assignments.length === 0) {
      return res.status(404).json({ message: "No customers assigned for the given ID and date." });
    }

    const customerIds = assignments.flatMap(assignment => assignment.customerIds);

    // Fetch customer details based on IDs
    const customers = await customerModel.find(
      { _id: { $in: customerIds } },
      { firstName: 1, lastName: 1, email: 1, phoneNumber: 1, district: 1, village: 1, mandal: 1 }
    );

    if (!customers || customers.length === 0) {
      return res.status(404).json({ message: "No customer details found for the assigned customers." });
    }

    // Prepare and send the response
    res.status(200).json({
      message: "Assigned customers retrieved successfully.",
      data: customers.map(customer => ({
        customerId: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phoneNumber,
        district: customer.district,
        village: customer.village,
        mandal: customer.mandal,
      })),
    });
  } catch (error) {
    console.error("Error fetching assigned customers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getAssignedPropertyDetails = async (req, res) => {
  try {
    const assignedId = req.params.userId;
    const role = req.params.role;
    const assignedDateQuery = req.query.assignedDate;

    if (!assignedId) {
      return res.status(400).json({ message: "Assigned ID is required." });
    }

    console.log(`Received request for: ${req.originalUrl}`);
    console.log(role, assignedId, assignedDateQuery);

    // Determine the filter field based on role
    const filterField = role === "5" || role === 5 ? "assignedBy" : role === "6" || role === 6 ? "assignedTo" : null;
    if (!filterField) {
      return res.status(400).json({ message: "Invalid role. Must be 5 or 6." });
    }

    // Resolve the assigned date range (in UTC)
    const assignedDate = assignedDateQuery ? new Date(assignedDateQuery) : new Date();
    if (isNaN(assignedDate)) {
      return res.status(400).json({ message: "Invalid assignedDate format." });
    }

    const startOfDay = new Date(Date.UTC(assignedDate.getUTCFullYear(), assignedDate.getUTCMonth(), assignedDate.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(assignedDate.getUTCFullYear(), assignedDate.getUTCMonth(), assignedDate.getUTCDate(), 23, 59, 59, 999));

    console.log("Start of Day (UTC):", startOfDay.toISOString(), "End of Day (UTC):", endOfDay.toISOString());

    // Fetch property assignments for the assigned ID on the specified date
    const propertyAssignments = await propertyAssignmentModel.find({
      [filterField]: assignedId,
      assignedDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!propertyAssignments.length) {
      return res.status(409).json({ message: "No properties assigned for the given ID on this date." });
    }

    const propertyIds = propertyAssignments.flatMap((assignment) => assignment.propertyIds);

    // Fetch all property details
    const [commercialProperties, fieldsProperties, layoutProperties, residentialProperties] = await Promise.all([
      commercialModel.find({ _id: { $in: propertyIds } }),
      fieldModel.find({ _id: { $in: propertyIds } }),
      layoutModel.find({ _id: { $in: propertyIds } }),
      residentialModel.find({ _id: { $in: propertyIds } }),
    ]);

    const allProperties = [
      ...commercialProperties,
      ...fieldsProperties,
      ...layoutProperties,
      ...residentialProperties,
    ];

    if (!allProperties.length) {
      return res.status(404).json({ message: "No property details found for the given property IDs." });
    }

    // Map property details based on type
    const mapPropertyDetails = (property, assignment) => {
      const commonDetails = {
        propertyType: property.propertyType,
        assignedDate: assignment?.assignedDate || null,
      };

      switch (property.propertyType) {
        case "Commercial":
          return {
            ...commonDetails,
            propertyTitle: property.propertyTitle,
            ownerName: property.propertyDetails.owner?.ownerName || null,
            landTitle: property.propertyTitle,
            price: property.propertyDetails.landDetails?.price || null,
            address: property.propertyDetails.address || {},
            images: property.propertyDetails.uploadPics || [],
          };

        case "Agricultural land":
          return {
            ...commonDetails,
            ownerName: property.ownerDetails?.ownerName || null,
            landTitle: property.landDetails?.title || null,
            price: property.landDetails?.price || null,
            address: property.address || {},
            images: property.landDetails?.images || [],
          };

        case "Layout":
          return {
            ...commonDetails,
            propertyTitle: property.layoutDetails?.layoutTitle || null,
            ownerName: property.ownerDetails?.ownerName || null,
            landTitle: property.layoutDetails?.layoutTitle || null,
            price: property.layoutDetails?.plotPrice || null,
            address: property.layoutDetails?.address || {},
            images: property.layoutDetails?.uploadPics || [],
          };

        case "Residential":
          return {
            ...commonDetails,
            apartmentName: property.propertyDetails?.apartmentName || null,
            ownerName: property.propertyDetails?.owner?.ownerName || null,
            landTitle: property.propertyTitle,
            price: property.propertyDetails?.flatCost || null,
            address: property.propertyDetails?.address || {},
            images: property.propertyDetails?.propPhotos || [],
          };

        default:
          return commonDetails;
      }
    };

    const response = allProperties.map((property) => {
      const assignment = propertyAssignments.find((assignment) =>
        assignment.propertyIds.includes(property._id.toString())
      );
      return mapPropertyDetails(property, assignment);
    });

    res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error fetching property details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  addMarketingAgent,
  getMarketingAgents,
  getCustomersByAssignedTo,
  myAreaProperties,
  getAssignedCustomers,
  getAssignedPropertyDetails,
};