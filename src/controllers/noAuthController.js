require("dotenv").config();
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const secret_key = process.env.SECRET_KEY;

const saltRounds = 10;
const {
  loginSchema,
  validateNumber,
  otpValidation,
} = require("../helpers/loginValidation");
const { getByDistrict } = require("./fieldController");
const contactModel = require("../models/contactModel");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;
const twilio = require("twilio")(accountSid, authToken);
const sendSMS = async (phoneNumber, body) => {
  const phone = `+91${phoneNumber}`;
  let msgOptions = {
    from: twilioNumber,
    to: phone,
    body: body,
  };
  try {
    const msg = await twilio.messages.create(msgOptions);
    return msg;
  } catch (err) {
    console.log(err);
    return err;
  }
};

let otpStore = {};

function generateOtp(phoneNumber) {
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[phoneNumber] = otp;
  console.log(otpStore[phoneNumber]);
  return otp;
}

function verifyOtp(phoneNumber, inputOtp) {
  const storedOtp = otpStore[phoneNumber];
  console.log(otpStore[phoneNumber]);
  if (!storedOtp) {
    return false;
  }
  if (parseInt(inputOtp) === storedOtp) {
    delete otpStore[phoneNumber];
    return true;
  }
  return false;
}

const otpForLogin = async (req, res) => {
  try {
    const result = await validateNumber.validateAsync(req.body);
    let { phoneNumber } = result;
    let user = await userModel.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = generateOtp(phoneNumber);
    const body = `Dear user, your One-Time Password (OTP) for logging into RealEstate Lokam is: "${otp}". Please use this code within 2 minutes to complete your login.`;
    const responseMsg = await sendSMS(phoneNumber, body);
    res.status(200).json({ smsResponse: responseMsg });
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    // Send response with server error status
    res.status(500).send(error);
  }
};

const otpLogin = async (req, res) => {
  try {
    const result = await otpValidation.validateAsync(req.body);
    let { phoneNumber, otp } = result;

     let user = await userModel.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = verifyOtp(phoneNumber, otp);
    if (isMatch) {
      const token = jwt.sign(
        {
          user: {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
          },
        },
        secret_key,
        { expiresIn: "1d" }
      );
      // Send response with success status and token
      res.send({ success: true, token });
      return { token, message: "Login successful" };
    } else {
      // Send response with failure status if credentials are invalid
      res.status(400).send({ message: "Invalid credentials", success: false });
    }
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    // Send response with server error status
    res.status(500).send(error);
  }
};

 const userLoginController = async (req, res) => {
  try {
    const result = await loginSchema.validateAsync(req.body);
    let { password } = result;
    const email = result.email.toLowerCase();
     let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign(
        {
          user: {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            district: user.district,
            profilePicture: user.profilePicture,
          },
        },
        secret_key,
        { expiresIn: "1d" }
      );
      // Send response with success status and token
      res.send({ success: true, token });
      return { token, message: "Login successful" };
    } else {
      // Send response with failure status if credentials are invalid
      res.status(400).send({ message: "Invalid credentials", success: false });
      // throw new Error("Invalid password or email");
    }
  } catch (error) {
    if (error.isJoi === true) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    // Send response with server error status
    res.status(500).send(error);
    throw new Error("Error during login: " + error.message);
  }
};

 const verifyPhno = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const present = await userModel.findOne({ phoneNumber: phoneNumber });
    if (!present) {
      return res.status(409).json("User with this phone number does not exist");
    }
    res.status(200).json("User exists");
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};
 

const verifyEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const userEmail = email.toLowerCase(); // Corrected usage of toLowerCase
    const present = await userModel.findOne({ email: userEmail });

    if (!present) {
      return res
        .status(409)
        .json({ message: "User with this email does not exist" });
    }

    res.status(200).json({ message: "User exists" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const resetMail = async (req, res) => {
  try {
    const result = await loginSchema.validateAsync(req.body);

    const user = await userModel.find({ email: req.body.email });
    if (user) {
      let userId = user[0]._id;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      await userModel.findByIdAndUpdate(userId, {
        password: hashedPassword,
      });

      res.status(200).json("Password Updated Successfully");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const contactUs = async (req, res) => {
  try {
    const contact = new contactModel(req.body);
    await contact.save();
    res.status(200).json({ message: "Response saved !", success: "true" });
  } catch (error) {}
};
module.exports = {
  userLoginController,
  otpForLogin,
  otpLogin,
  verifyPhno,
  verifyEmail,
  resetMail,
  contactUs,
};
