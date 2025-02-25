const axios = require("axios");
const userModel = require("../models/userModel");
const pushNotification = require("../models/pushNotification");

const admin = require("firebase-admin");

const testNotification = async (req, res) => {
  try {
    const response = await axios.post("https://api.expo.dev/v2/push/send", {
      to: "ExponentPushToken[ZaPymxHF8bZnmeVP-mCbVw]",
      sound: "default",
      title: "Auction Reminder",
      body: "Hello! How are you",
    });

    // Return only the response data
    res.status(200).json({
      message: "Notification sent successfully",
      data: response.data, // Log only the response data, not the whole response object
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const AgentpushNotification = async (title, message, role) => {
  try {
    console.log("In push notification", title, message);

    const userData = await userModel.find({ role: role });

    if (userData.length > 0) {
      for (let user of userData) {
        const tokenData = await pushNotification.find({ userId: user._id });
        for (let token of tokenData) {
          console.log("tokenData", token.pushToken);

          const response = await axios.post(
            "https://api.expo.dev/v2/push/send",
            {
              to: token.pushToken,
              sound: "default",
              title: title,
              body: message,

              channelId: "realEstateMiracle",
           
            }
          );
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const AgentpushNotification1 = async (title, message, role, userId) => {
  try {
    const tokenData = await pushNotification.find({ userId: userId });
    console.log(tokenData);
    for (let token of tokenData) {
      console.log(
        "In push notification",
        title,
        message,
        userId,
        token.pushToken
      );

      const response = await axios.post("https://api.expo.dev/v2/push/send", {
        to: token.pushToken,
        sound: "default",
        title: title,
        body: message,
        channelId: "realEstateMiracle",
    
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });

module.exports = {
  AgentpushNotification,
  AgentpushNotification1,
  testNotification,
};
