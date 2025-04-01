//const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const nodemailer = require("nodemailer");
const saltRounds = 10;
const {
  registrationSchema,
  roleSchema,
  newProfileSchema,
} = require("../helpers/userValidation");
const commercialModel = require("../models/commercialModel");
const fieldModel = require("../models/fieldModel");
const layoutModel = require("../models/layoutModel");
const residentialModel = require("../models/residentialModel");
const dealsModel = require("../models/propertyDealsModel");

const getUsers = async (req, res) => {
  try {
    const data = await userModel.find({}, { password: 0 });
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
};
const getCsr = async (req, res) => {
  try {
    const role = req.user.user.role;
    const userId = req.user.user.userId;

    if (role !== 1) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Only users with role 1 can access CSR data.",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(409).json({
        status: "error",
        message: "User not found.",
      });
    }

    const csrId = user.assignedCsr;
    if (!csrId) {
      return res.status(409).json({
        status: "error",
        message: "CSR not assigned to this user.",
      });
    }

    const csrData = await userModel.findById(csrId).select("-password");
    if (!csrData) {
      return res.status(409).json({
        status: "error",
        message: "CSR data not found.",
      });
    }

    res.status(200).json(csrData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const result = await roleSchema.validateAsync(req.params);
    const { role } = result;
    // role 1 - agent, 2-seller, 3-buyer
    const users = await userModel.find({ role: role }, { password: 0 });

    if (users.length === 0) {
      return res.status(409).json({ message: "No users found with this role" });
    }

    res.status(200).json(users);
  } catch (error) {
    if (error.isJoi === true)
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const translate = require("@iamtraction/google-translate"); // Import translation library

const createUser = async (req, res) => {
  try {
    console.log("password", req.body.password);

    let result = await registrationSchema.validateAsync(req.body);
    console.log("Role:", result.role);

    const exists = await userModel.findOne({ phoneNumber: result.phoneNumber });
    if (exists) {
      console.log("User with this phone number already exists");
      return res.status(409).json("Phone number exists");
    }

    const emailCheck = await userModel.findOne({ email: result.email });
    if (emailCheck) {
      console.log("User with this email already exists");
      return res.status(409).json("Email exists");
    }

    // Generate unique ID based on the role
    let roleBasedId;
    switch (result.role) {
      case 0:
        roleBasedId = await generateUniqueIds("AD");
        break;
      case 1:
        roleBasedId = await generateUniqueIds("AG");
        break;
      case 3:
        roleBasedId = await generateUniqueIds("CS");
        break;
      case 5:
        roleBasedId = await generateUniqueIds("CSR");
        break;
      case 6:
        roleBasedId = await generateUniqueIds("MA");
        break;
      default:
        console.log("Invalid role provided");
        return res.status(400).json("Invalid role");
    }
    result.accountId = roleBasedId;
    console.log("Generated Role-Based ID:", roleBasedId);

    // Translate string fields and store both original and translated fields
    const fieldsToTranslate = [
      "firstName",
      "lastName",
      "city",
      "state",
      "district",
      "village",
      "mandal",
    ];
    for (const field of fieldsToTranslate) {
      if (result[field]) {
        const translated = await translate(result[field], { to: "te" }); // Translate to Telugu
        result[`${field}Te`] = translated.text; // Append "Te" to the field name for the translated version
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(result.password, salt);
    result.password = hashedPassword;

    // Set default profile picture if not provided
    if (!result.profilePicture) {
      result.profilePicture =
        "https://res.cloudinary.com/ddv2y93jq/image/upload/v1726132403/zsafjroceoneetkmz5jq.webp";
    }

    // Save the user to the database
    const user = new userModel(result);
    await user.save();

    res.status(201).json({
      message: "User added successfully",
      success: true,
      user,
    });
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const createUserInUse = async (req, res) => {
  try {
    console.log("password", req.body.password);

    // Validate the request body
    let result = await registrationSchema.validateAsync(req.body);
    console.log("Role:", result.role);

    // Check if the user already exists by phone number or email
    const exists = await userModel.findOne({ phoneNumber: result.phoneNumber });
    if (exists) {
      console.log("User with this phone number already exists");
      return res.status(409).json("Phone number exists");
    }

    const emailCheck = await userModel.findOne({ email: result.email });
    if (emailCheck) {
      console.log("User with this email already exists");
      return res.status(409).json("Email exists");
    }

    // Generate unique ID based on the role
    let roleBasedId;
    switch (result.role) {
      case 0:
        roleBasedId = await generateUniqueIds("AD");
        break;
      case 1:
        roleBasedId = await generateUniqueIds("AG");
        break;
      case 3:
        roleBasedId = await generateUniqueIds("CS");
        break;
      case 5:
        roleBasedId = await generateUniqueIds("CSR");
        break;
      case 6:
        roleBasedId = await generateUniqueIds("MA");
        break;
      default:
        console.log("Invalid role provided");
        return res.status(400).json("Invalid role");
    }
    result.accountId = roleBasedId;
    console.log("Generated Role-Based ID:", roleBasedId);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(result.password, salt);
    result.password = hashedPassword;

    // Set default profile picture if not provided
    if (!result.profilePicture) {
      result.profilePicture =
        "https://res.cloudinary.com/ddv2y93jq/image/upload/v1726132403/zsafjroceoneetkmz5jq.webp";
    }

    // Save the user to the database
    const user = new userModel(result);
    await user.save();

    res.status(201).json({
      message: "User added successfully",
      success: true,
      user,
    });
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

// Helper function to generate unique IDs
// Helper function to generate unique IDs
const generateUniqueIds = async (prefix, role) => {
  try {
    // Find the last user with the specified role and accountId prefix
    const lastUser = await userModel
      .findOne({
        accountId: { $regex: `^${prefix}\\d+$` }, // Match the prefix and numbers
        role: role, // Ensure the role matches
      })
      .sort({ createdAt: -1 }); // Sort by creation date in descending order

    let counter = 1; // Default to 1 if no matching user found
    if (lastUser) {
      const lastId = lastUser.accountId;
      counter = parseInt(lastId.replace(prefix, ""), 10) + 1; // Increment the counter
    }

    return `${prefix}${counter}`;
  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw new Error("Failed to generate unique ID");
  }
};

const createUsers = async (req, res) => {
  try {
    console.log("password", req.body.password);
    let result = await registrationSchema.validateAsync(req.body);
    let result1;
    console.log(result.role);
    if (result.role === 1) {
      result = {
        ...result,
        assignedCsr: "0",
      };
    }
    console.log("result", result);
    const exists = await userModel.findOne({ phoneNumber: result.phoneNumber });
    if (exists) {
      console.log("User with this phone number already exists");
      return res.status(409).json("phone number exists");
    }
    const emailCheck = await userModel.findOne({ email: result.email });
    if (emailCheck) {
      console.log("User with this email already exists");
      return res.status(409).json("email exists");
    }
    const user = new userModel(result);
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    if (user.profilePicture === "") {
      user.profilePicture =
        "https://res.cloudinary.com/ddv2y93jq/image/upload/v1726132403/zsafjroceoneetkmz5jq.webp";
    }

    // user
    //   .save()
    //   .then(() => {
    //     res.status(201).json({
    //       message: "User Added Successfully",
    //       success: true,
    //       user: user,
    //     });
    //   })
    //   .catch((error) => {
    //     console.log(error.errmsg);
    //     res.status(400).send({
    //       message: "Registration failed",
    //       error: error.errmsg,
    //     });
    //   });
    await user.save();
    res
      .status(201)
      .json({ message: "User added successfully", success: true, user: user });
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    console.log(error);
    // For non-Joi errors, send a generic 500 error
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    console.log(req.body, " user data");
    const updateData = req.body;
    const userId = req.user.user.userId;

    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
      updateData.password = hashedPassword;
    }
    console.log(updateData.phoneNumber, " phonenumber updated");
    if (updateData.phoneNumber) {
      const numberExists = await userModel.findOne({
        phoneNumber: updateData.phoneNumber,
        _id: { $ne: userId },
      });

      if (numberExists) {
        return res
          .status(409)
          .json("User with this phone number already exists");
      }
    }

    // Update user information in the database
    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    console.log(updatedUser);

    // Respond with the updated user info
    res.send({ message: "User updated successfully" });
  } catch (error) {
    // Handle Joi validation errors
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }

    // Handle any other errors
    res
      .status(500)
      .send({ message: "Error updating user", error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    console.log(req.body, " user data");

    const userId = req.user.user.userId;

    if (req.body.profilePicture) {
      const updateData = { profilePicture: req.body.profilePicture };

      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      console.log(updatedUser);

      // Respond with the updated user info
      return res.send({ message: "Profile picture updated successfully" });
    }

    // If no profile picture is provided, return a response
    res.status(400).send({ message: "No profile picture provided to update" });
  } catch (error) {
    // Handle Joi validation errors
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }

    // Handle any other errors
    res.status(500).send({
      message: "Error updating user profile picture",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user.user.userId;

    const user = await userModel.findByIdAndDelete(userId);
    if (!user) {
      return res
        .status(409)
        .send({ message: "User not found", success: false });
    }

    res.send({ message: "User Deleted Successfully", success: true });
  } catch (error) {
    res.status(500).send(error);
  }
};

const mongoose = require("mongoose");

const getProfile = async (req, res) => {
  try {
    const userId = req.user.user.userId;
    const role = req.user.user.role;
    console.log(role, "role");
    console.log(userId, "userId");

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const fields =
      "profilePicture firstName lastName accountId pinCode city email phoneNumber district mandal state country createdAt role altPhoneNumber";

    const user = await userModel.findById(userObjectId, fields).lean();
    console.log(user, "user");
    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }

    console.log("User found:", user);

    if (role == 1) {
      const [
        commercialCount,
        fieldsCount,
        layoutCount,
        residentialCount,
        soldCount,
      ] = await Promise.all([
        commercialModel.countDocuments({ userId: userObjectId }),
        fieldModel.countDocuments({ userId: userObjectId }),
        layoutModel.countDocuments({ userId: userObjectId }),
        residentialModel.countDocuments({ userId: userObjectId }),
        dealsModel.countDocuments({
          agentId: userObjectId,
          sellingStatus: "sold",
        }),
      ]);

      const totalPropertiesCount =
        commercialCount + fieldsCount + layoutCount + residentialCount;

      user.commercialPropertiesCount = commercialCount;
      user.fieldsPropertiesCount = fieldsCount;
      user.layoutPropertiesCount = layoutCount;
      user.residentialPropertiesCount = residentialCount;
      user.soldPropertiesCount = soldCount;
      user.totalPropertiesCount = totalPropertiesCount;

      console.log({
        commercialCount,
        fieldsCount,
        layoutCount,
        residentialCount,
        soldCount,
        totalPropertiesCount,
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res
      .status(500)
      .json({ message: "Error retrieving user profile", error });
  }
};

const namesBasedOnRole = async (req, res) => {
  try {
    const result = await roleSchema.validateAsync(req.params);
    const { role } = result;
    const fields = "firstName lastName";
    const details = await userModel.find({ role: role }, fields);
    let names = [];
    for (let element of details) {
      let fullName = element.firstName + " " + element.lastName;
      names.push(fullName);
    }
    if (names) {
      res.status(200).json(names.sort());
    } else {
      res.status(409).json({ message: "Users not found" });
    }
  } catch (error) {
    if (error.isJoi === true)
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    res.status(500).json({ message: "Error retrieving names", error });
  }
};

const createCSRInUse = async (req, res) => {
  try {
    console.log("password", req.body.password);
    console.log("user data", req.body);
    let result = await registrationSchema.validateAsync(req.body);

    const exists = await userModel.findOne({ phoneNumber: result.phoneNumber });
    if (exists) {
      console.log("User with this phone number already exists");
      return res.status(409).json("Phone number exists");
    }

    if (result.email) {
      const emailCheck = await userModel.findOne({ email: result.email });
      if (emailCheck) {
        console.log("User with this email already exists");
        return res.status(409).json("Email exists");
      }
    }

    let roleBasedId;
    switch (result.role) {
      case 1:
        roleBasedId = await generateUniqueId("AG", 1);
        result.accountId = roleBasedId;
        result.assignedCsr = "0";
        break;
      case 3:
        roleBasedId = await generateUniqueId("CS", 3);
        result.accountId = roleBasedId;
        result.assignedCsr = "0";
        break;
      case 5:
        roleBasedId = await generateUniqueId("CSR", 5);
        result.accountId = roleBasedId;
        break;
      case 6:
        roleBasedId = await generateUniqueId("MA", 6);
        result.accountId = roleBasedId;
        result.assignedCsr = req.user.user.userId;
        break;
      default:
        console.log("Invalid role provided");
        return res.status(400).json("Invalid role");
    }

    console.log("Generated Role-Based ID:", roleBasedId);

    // Generate a password
    const generatedPassword = generatePassword(
      result.firstName,
      result.lastName
    );
    console.log("Generated Password:", generatedPassword);

    // Hash the password if applicable
    const salt = await bcrypt.genSalt(saltRounds);
    if ([1, 3, 5, 6].includes(result.role)) {
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);
      result.password = hashedPassword;
    }

    // Set default profile picture if not provided
    if (!result.profilePicture) {
      result.profilePicture =
        "https://res.cloudinary.com/ddv2y93jq/image/upload/v1726132403/zsafjroceoneetkmz5jq.webp";
    }

    result.addedBy = req.user.user.userId;

    // Save the user to the database
    const user = new userModel(result);
    await user.save();

    // Send email only if email is provided and for specific roles
    if (result.email && [1, 3, 5, 6].includes(result.role)) {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Your Account Details",
        text: `Hello ${user.firstName},\n\nYour account has been successfully created.\n\nHere are your account details:\nUser ID: ${user.email}\nPassword: ${generatedPassword}\nYou can reset your password here: http://172.17.15.209:3000/resetPassword\n\nPlease keep this information secure.\n\nBest regards,\nReal Estate Team`,
      };

      await transporter
        .sendMail(mailOptions)
        .then(() => {
          console.log("Email sent successfully");
        })
        .catch((err) => {
          console.error("Error sending email", err);
        });
    }

    res.status(201).json({
      message: "User added successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    if (error.isJoi === true) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const createCSR = async (req, res) => {
  try {
    console.log("password", req.body.password);
    console.log("user data", req.body);

    let result = await registrationSchema.validateAsync(req.body);

    const fieldsToTranslate = [
      "firstName",
      "lastName",
      "city",
      "state",
      "district",
      "village",
      "mandal",
      "country",
    ];
    for (const field of fieldsToTranslate) {
      if (result[field]) {
        const translated = await translate(result[field], { to: "te" }); // Translate to Telugu
        result[`${field}Te`] = translated.text; // Append "Te" to the field name for the translated version
      }
    }

    // Check if the phone number already exists
    const exists = await userModel.findOne({ phoneNumber: result.phoneNumber });
    if (exists) {
      console.log("User with this phone number already exists");
      return res.status(409).json("Phone number exists");
    }

    // If email is provided, check if it already exists
    if (result.email) {
      const emailCheck = await userModel.findOne({ email: result.email });
      if (emailCheck) {
        console.log("User with this email already exists");
        return res.status(409).json("Email exists");
      }
    }

    // Generate a role-based ID
    let roleBasedId;
    switch (result.role) {
      case 1:
        roleBasedId = await generateUniqueId("AG", 1);
        result.accountId = roleBasedId;
        result.assignedCsr = "0";
        break;
      case 3:
        roleBasedId = await generateUniqueId("CS", 3);
        result.accountId = roleBasedId;
        result.assignedCsr = "0";
        break;
      case 5:
        roleBasedId = await generateUniqueId("CSR", 5);
        result.accountId = roleBasedId;
        break;
      case 6:
        roleBasedId = await generateUniqueId("MA", 6);
        result.accountId = roleBasedId;
        result.assignedCsr = req.user.user.userId;
        break;
      default:
        console.log("Invalid role provided");
        return res.status(400).json("Invalid role");
    }

    console.log("Generated Role-Based ID:", roleBasedId);

    // Generate a password
    const generatedPassword = generatePassword(
      result.firstName,
      result.lastName
    );
    console.log("Generated Password:", generatedPassword);

    // Hash the password if applicable
    const salt = await bcrypt.genSalt(saltRounds);
    if ([1, 3, 5, 6].includes(result.role)) {
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);
      result.password = hashedPassword;
    }

    // Set default profile picture if not provided
    if (!result.profilePicture) {
      result.profilePicture =
        "https://res.cloudinary.com/ddv2y93jq/image/upload/v1726132403/zsafjroceoneetkmz5jq.webp";
    }

    result.addedBy = req.user.user.userId;

    // Save the user to the database
    const user = new userModel(result);
    await user.save();

    // Send email only if email is provided and for specific roles
    if (result.email && [1, 3, 5, 6].includes(result.role)) {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Your Account Details",
        text: `Hello ${user.firstName},\n\nYour account has been successfully created.\n\nHere are your account details:\nUser ID: ${user.email}\nPassword: ${generatedPassword}\nYou can reset your password here: http://172.17.15.209:3000/resetPassword\n\nPlease keep this information secure.\n\nBest regards,\nReal Estate Team`,
      };

      await transporter
        .sendMail(mailOptions)
        .then(() => {
          console.log("Email sent successfully");
        })
        .catch((err) => {
          console.error("Error sending email", err);
        });
    }

    res.status(201).json({
      message: "User added successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    if (error.isJoi === true) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const createCSRs = async (req, res) => {
  try {
    console.log("password", req.body.password);

    let result = await registrationSchema.validateAsync(req.body);

    const exists = await userModel.findOne({ phoneNumber: result.phoneNumber });
    if (exists) {
      console.log("User with this phone number already exists");
      return res.status(409).json("Phone number exists");
    }

    const emailCheck = await userModel.findOne({ email: result.email });
    if (emailCheck) {
      console.log("User with this email already exists");
      return res.status(409).json("Email exists");
    }
    const generatedPassword = generatePassword(
      result.firstName,
      result.lastName
    );
    console.log(generatedPassword);
    console.log(result.role);
    if (result.role === 1) {
      result = {
        ...result,
        assignedCsr: "0",
      };
    }
    if (result.role === 6) {
      result = {
        ...result,
        assignedCsr: req.user.user.userId,
      };
    }
    if (result.role === 3) {
      result = {
        ...result,
        assignedCsr: "0",
      };
    }
    console.log("result", result);
    const user = new userModel(result);
    const salt = await bcrypt.genSalt(saltRounds);
    if (
      user.role === 5 ||
      user.role === 1 ||
      user.role === 6 ||
      user.role === 3
    ) {
      const hashedpassword = await bcrypt.hash(generatedPassword, salt);
      user.password = hashedpassword;
    }

    if (user.profilePicture === "") {
      user.profilePicture =
        "https://res.cloudinary.com/ddv2y93jq/image/upload/v1726132403/zsafjroceoneetkmz5jq.webp";
    }

    user.addedBy = req.user.user.userId;
    await user.save();
    if (
      user.role === 5 ||
      user.role === 1 ||
      user.role === 6 ||
      user.role === 3
    ) {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Your Account Details",
        text: `Hello ${user.firstName},\n\nYour account has been successfully created.\n\nHere are your account details:\nUser ID: ${user.email}\nPassword: ${generatedPassword}\n   You can reset your password here...  http://172.17.15.209:3000/resetPassword \nPlease keep this information secure.\n\nBest regards,\n Real Estate Team  `,
      };
      await transporter
        .sendMail(mailOptions)
        .then((res) => {
          console.log("Email sent successfully", res);
        })
        .catch((err) => {
          console.log("Email sent successfully", err);
        });
    }

    res.status(201).json({
      message: "User added successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    if (error.isJoi === true) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    // For non-Joi errors, send a generic 500 error
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const createCSRss = async (req, res) => {
  try {
    console.log("password", req.body.password);

    let result = await registrationSchema.validateAsync(req.body);

    const exists = await userModel.findOne({ phoneNumber: result.phoneNumber });
    if (exists) {
      console.log("User with this phone number already exists");
      return res.status(409).json("Phone number exists");
    }

    const emailCheck = await userModel.findOne({ email: result.email });
    if (emailCheck) {
      console.log("User with this email already exists");
      return res.status(409).json("Email exists");
    }

    // Generate a role-based ID
    let roleBasedId;
    switch (result.role) {
      case 1:
        roleBasedId = await generateUniqueId("AG");
        result.accountId = roleBasedId;
        result.assignedCsr = "0";
        break;
      case 3:
        roleBasedId = await generateUniqueId("CS");
        result.accountId = roleBasedId;
        result.assignedCsr = "0";
        break;
      case 5:
        roleBasedId = await generateUniqueId("CSR");
        result.accountId = roleBasedId;
        break;
      case 6:
        roleBasedId = await generateUniqueId("MA");
        result.accountId = roleBasedId;
        result.assignedCsr = req.user.user.userId;
        break;
      default:
        console.log("Invalid role provided");
        return res.status(400).json("Invalid role");
    }

    console.log("Generated Role-Based ID:", roleBasedId);

    // Generate a password
    const generatedPassword = generatePassword(
      result.firstName,
      result.lastName
    );
    console.log("Generated Password:", generatedPassword);

    // Hash the password if applicable
    const salt = await bcrypt.genSalt(saltRounds);
    if ([1, 3, 5, 6].includes(result.role)) {
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);
      result.password = hashedPassword;
    }

    // Set default profile picture if not provided
    if (!result.profilePicture) {
      result.profilePicture =
        "https://res.cloudinary.com/ddv2y93jq/image/upload/v1726132403/zsafjroceoneetkmz5jq.webp";
    }

    result.addedBy = req.user.user.userId;

    // Save the user to the database
    const user = new userModel(result);
    await user.save();

    // Send email for specific roles
    if ([1, 3, 5, 6].includes(result.role)) {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Your Account Details",
        text: `Hello ${user.firstName},\n\nYour account has been successfully created.\n\nHere are your account details:\nUser ID: ${user.email}\nPassword: ${generatedPassword}\nYou can reset your password here: http://172.17.15.209:3000/resetPassword\n\nPlease keep this information secure.\n\nBest regards,\nReal Estate Team`,
      };

      await transporter
        .sendMail(mailOptions)
        .then(() => {
          console.log("Email sent successfully");
        })
        .catch((err) => {
          console.error("Error sending email", err);
        });
    }

    res.status(201).json({
      message: "User added successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    if (error.isJoi === true) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const generateUniqueI = async (prefix, role) => {
  try {
    const latestUser = await userModel
      .findOne({
        role: role,
        accountId: { $regex: `^${prefix}\\d+$` },
      })
      .sort({ createdAt: -1 })
      .lean();

    if (latestUser && latestUser.accountId) {
      const lastId = parseInt(latestUser.accountId.replace(prefix, ""), 10);
      return `${prefix}${lastId + 1}`;
    }

    return `${prefix}1`;
  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw new Error("Could not generate unique account ID");
  }
};

const generateUniqueId = async (prefix, role) => {
  try {
    console.log(prefix, "prefix");

    const latestUser = await userModel
      .findOne({ role: role })
      .sort({ createdAt: -1 })
      .lean();
    console.log(latestUser);

    if (latestUser && latestUser.accountId) {
      const lastId = parseInt(latestUser.accountId.replace(prefix, ""), 10);
      const newId = `${prefix}${lastId + 1}`;
      console.log("Latest ID:", latestUser.accountId, "New ID:", newId);
      return newId;
    }

    // If no users found for the given role, start from 1
    return `${prefix}1`;
  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw new Error("Could not generate unique account ID");
  }
};

function generatePassword(firstName, lastName) {
  const firstPart = firstName.slice(0, 2); // First 2 characters of first name
  const lastPart = lastName.slice(-3); // Last 3 characters of last name
  const specialChars = "!@#$%^&*()_+";
  const numbers = "0123456789";
  const randomPool = specialChars + numbers;
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * randomPool.length);
    randomPart += randomPool[randomIndex];
  }
  const generatedPassword = firstPart + lastPart + randomPart;
  return generatedPassword;
}

const findAnAgents = async (req, res) => {
  try {
    const { text } = req.query;

    if (text && text.length < 3) {
      return res
        .status(400)
        .json({ message: "Search text must be at least 3 characters long" });
    }

    const searchCondition = text
      ? {
          $or: [
            { firstName: { $regex: text, $options: "i" } },
            { lastName: { $regex: text, $options: "i" } },
            {
              $and: [
                { firstName: { $regex: text, $options: "i" } },
                { lastName: { $regex: text, $options: "i" } },
              ],
            },
            { "location.district": { $regex: text, $options: "i" } },
            { "location.village": { $regex: text, $options: "i" } },
            { "location.state": { $regex: text, $options: "i" } },
            { "location.mandal": { $regex: text, $options: "i" } },
          ],
        }
      : {};

    // Fetch agents based on role and search conditions
    const agentData = await userModel
      .find({ role: 1, ...searchCondition }, { password: 0 })
      .lean();

    if (!agentData.length) {
      return res.status(409).json({ message: "No agents found" });
    }

    // Get a list of agent IDs
    const agentIds = agentData.map((agent) => agent._id);

    // Use aggregation to calculate the count of sold deals for each agent
    const soldPropertiesCounts = await dealsModel.aggregate([
      { $match: { agentId: { $in: agentIds }, sellingStatus: "sold" } },
      { $group: { _id: "$agentId", soldCount: { $sum: 1 } } },
    ]);

    // Map the sold counts back to the agents
    const soldCountMap = soldPropertiesCounts.reduce(
      (acc, { _id, soldCount }) => {
        acc[_id.toString()] = soldCount;
        return acc;
      },
      {}
    );

    // Add the soldPropertiesCount field to each agent
    const result = agentData.map((agent) => ({
      ...agent,
      soldPropertiesCount: soldCountMap[agent._id.toString()] || 0,
    }));

    return res
      .status(200)
      .json({ message: "Agent details fetched", data: result });
  } catch (error) {
    console.error("Error in findAnAgent:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
const findAnAgent = async (req, res) => {
  try {
    const { text } = req.query;

    if (text && text.length < 3) {
      return res
        .status(400)
        .json({ message: "Search text must be at least 3 characters long" });
    }

    let searchCondition = {};

    if (text) {
      const nameParts = text.trim().split(/\s+/);

      if (nameParts.length === 1) {
        searchCondition = {
          $or: [
            { firstName: { $regex: nameParts[0], $options: "i" } },
            { lastName: { $regex: nameParts[0], $options: "i" } },
            { district: { $regex: text, $options: "i" } },
            { village: { $regex: text, $options: "i" } },
            { city: { $regex: text, $options: "i" } },
            { state: { $regex: text, $options: "i" } },
            { mandal: { $regex: text, $options: "i" } },
          ],
        };
      } else if (nameParts.length > 1) {
        // Multiple parts (e.g., "Jaswanth Kumar")
        const [firstName, lastName] = nameParts;
        searchCondition = {
          $or: [
            { firstName: { $regex: firstName, $options: "i" } },
            { lastName: { $regex: lastName, $options: "i" } },
            { district: { $regex: text, $options: "i" } },
            { village: { $regex: text, $options: "i" } },
            { city: { $regex: text, $options: "i" } },
            { state: { $regex: text, $options: "i" } },
            { mandal: { $regex: text, $options: "i" } },
          ],
        };
      }
    }

    // Fetch agents based on role and search conditions
    const agentData = await userModel
      .find({ role: 1, ...searchCondition }, { password: 0 })
      .lean();

    if (!agentData.length) {
      return res.status(409).json({ message: "No agents found" });
    }

    // Get a list of agent IDs
    const agentIds = agentData.map((agent) => agent._id);

    // Use aggregation to calculate the count of sold deals for each agent
    const soldPropertiesCounts = await dealsModel.aggregate([
      { $match: { agentId: { $in: agentIds }, sellingStatus: "sold" } },
      { $group: { _id: "$agentId", soldCount: { $sum: 1 } } },
    ]);

    // Map the sold counts back to the agents
    const soldCountMap = soldPropertiesCounts.reduce(
      (acc, { _id, soldCount }) => {
        acc[_id.toString()] = soldCount;
        return acc;
      },
      {}
    );

    // Add the soldPropertiesCount field to each agent
    const result = agentData.map((agent) => ({
      ...agent,
      soldPropertiesCount: soldCountMap[agent._id.toString()] || 0,
    }));

    return res
      .status(200)
      .json({ message: "Agent details fetched", data: result });
  } catch (error) {
    console.error("Error in findAnAgent:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.user.userId;
    console.log("req.body", data, userId);

    const updateStatus = await userModel.findByIdAndUpdate(
      userId,
      { subscription: data },
      { new: true }
    );

    console.log(updateStatus);
    if (updateStatus) {
      res
        .status(200)
        .json({ message: " Subscription plan updated Successfully" });
    } else {
      res.status(409).json({ message: "Subscription plan upgradtion failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createUser,
  deleteUser, //unused
  getUsers, //unused
  updateUser,
  getProfile,
  getUsersByRole, //unused
  namesBasedOnRole,
  createCSR,
  updateUserProfile,
  getCsr, //mobile app
  findAnAgent,
  updateSubscription,
};
