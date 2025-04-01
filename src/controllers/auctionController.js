const auctionModel = require("../models/auctionModel");
const commercialModel = require("../models/commercialModel");
const fieldModel = require("../models/fieldModel");
const layoutModel = require("../models/layoutModel");
const residentialModel = require("../models/residentialModel");
const nodemailer = require("nodemailer");
const userModel = require("../models/userModel");
const pushNotification = require("../models/pushNotification");

const axios = require("axios");
const { AgentpushNotification1 } = require("./pushNotifyController");
const postAuction = async (req, res) => {
  try {
    const data = req.body;

    const propertyId = data.propertyId;

    const auctions = await auctionModel.find({
      propertyId: propertyId,
      auctionStatus: "active",
    });

    console.log("auctions", auctions);
    if (auctions.length > 0) {
      return res
        .status(400)
        .json({ message: "Already the property is in auction" });
    }

    console.log(data);
    const auction = new auctionModel(data);

    auction.save();

    res.status(201).json("Auction Created Successfully");
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const bidByBuyer = async (req, res) => {
  try {
    const auctionId = req.params.auctionId;
    const bid = req.body;

    const auctionData = await auctionModel.find({ _id: auctionId });

    let buyers = auctionData[0].buyers;

    const date = new Date();
 

    if (date < auctionData[0].startDate) {
      console.log("erere");
      res.status(400).json({ message: "Auction Not Started Yet" });
    }

    buyers.push(bid);

    await auctionModel.findByIdAndUpdate(
      { _id: auctionId },
      { buyers: buyers }
    );

    res.status(201).json("Bid Successfull");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getBidsOfAuction = async (req, res) => {
  try {
    const auctionId = req.params.auctionId;

    const auctionData = await auctionModel.find({ _id: auctionId });

    let maxBid = 0;
    let maxBidData = {};
    let buyerData = auctionData[0];

    for (let buyer of buyerData) {
      if (buyer.bidAmount > maxBid) {
        maxBid = buyer.bidAmount;
        maxBidData = buyer;
      }
    }

    let auctionDetails = {
      auctionData,
      maximumBid: maxBidData,
    };

    if (!auctionDetails) {
      res.status(409).json({ message: "Auction Details Not Found" });
    } else {
      res.status(200).json({ data: auctionDetails });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const closeAuction = async (req, res) => {
  try {
    const auctionId = req.body.auctionId;

    const status = req.body.status;

    const auctionStatus = await auctionModel.findByIdAndUpdate(
      { _id: auctionId },
      { auctionStatus: status }
    );

    res.status(200).json({ message: "Auction Closed Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllAuctions = async (req, res) => {
  try {
    const { page, limit } = req.query;

    let auctionData = [];

    if (page && limit) {
      let offset = (page - 1) * limit;

      auctionData = await auctionModel
        .find({
          $or: [{ auctionStatus: "active" }, { auctionStatus: "closed" }],
        })
        .skip(offset)
        .limit(limit);
    } else {
      auctionData = await auctionModel.find({
        $or: [{ auctionStatus: "active" }, { auctionStatus: "closed" }],
      });
    }

    let resultData = [];
    for (let auction of auctionData) {
      let prop;
      const fieldData = await fieldModel.find({ _id: auction.propertyId });
      const commData = await commercialModel.find({ _id: auction.propertyId });

      const residential = await residentialModel.find({
        _id: auction.propertyId,
      });

      const layout = await layoutModel.find({ _id: auction.propertyId });

      if (fieldData.length > 0) {
        prop = fieldData;
      }
      if (commData.length > 0) {
        prop = commData;
      }
      if (residential.length > 0) {
        prop = residential;
      }
      if (layout.length > 0) {
        prop = layout;
      }

      resultData.push({
        ...auction._doc,
        property: prop,
      });
    }

    if (auctionData.length === 0) {
      return res.status(409).json({ message: "No Active Auctions" });
    }

    res.status(200).json({ data: resultData });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.lof(error);
  }
};

const getTodayAuctions = async (req, res) => {
  try {
    const currentTime = new Date();

    const auctionData = await auctionModel.find({
      startDate: { $lte: currentTime },
      endDate: { $gt: currentTime },
      auctionStatus: "active",
    });

    if (auctionData.length === 0) {
      return res.status(400).json({ message: "No Auction Found" });
    }

    auctionWinner("679c923ebda9afb73db55205");

    let resultData = [];
    for (let auction of auctionData) {
      let prop;
      const fieldData = await fieldModel.find({ _id: auction.propertyId });
      const commData = await commercialModel.find({ _id: auction.propertyId });

      const residential = await residentialModel.find({
        _id: auction.propertyId,
      });

      const layout = await layoutModel.find({ _id: auction.propertyId });

      if (fieldData.length > 0) {
        prop = fieldData;
      }
      if (commData.length > 0) {
        prop = commData;
      }
      if (residential.length > 0) {
        prop = residential;
      }
      if (layout.length > 0) {
        prop = layout;
      }

      resultData.push({
        ...auction._doc,
        property: prop[0],
      });
    }

    res.status(200).json({ data: resultData });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getFutureAuctions = async (req, res) => {
  try {
    const currentTime = new Date();
    const nextTime = new Date(currentTime);
    nextTime.setDate(currentTime.getDate() + 2);

    const auctionData = await auctionModel.find();

    let resultData = [];
    console.log(auctionData);
    for (let auction of auctionData) {
      console.log("abcd", auction.startDate > currentTime, currentTime);

      if (auction.startDate > currentTime && auction.startDate < nextTime) {
        resultData.push(auction);
      }
    }

    res.status(200).json({ data: resultData });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
};

const getAuctionDetailsofProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const auctionData = await auctionModel.find({ propertyId: propertyId });

    const reslutData = [];

    if (auctionData.length > 0) {
      let prop;
      const fieldData = await fieldModel.find({ _id: propertyId });
      const commData = await commercialModel.find({ _id: propertyId });

      const residential = await residentialModel.find({ _id: propertyId });

      const layout = await layoutModel.find({ _id: propertyId });

      if (fieldData.length > 0) {
        prop = fieldData;
      }
      if (commData.length > 0) {
        prop = commData;
      }
      if (residential.length > 0) {
        prop = residential;
      }
      if (layout.length > 0) {
        prop = layout;
      }

      let maxBid = 0;
      let maxBidData = {};
      let buyerData = auctionData[0].buyers;
      console.log(buyerData, auctionData);

      for (let buyer of buyerData) {
        if (buyer.bidAmount > maxBid) {
          maxBid = buyer.bidAmount;
          maxBidData = buyer;
        }
      }

      // let auctionDetails = {
      //     auctionData,
      //     maximumBid: maxBidData
      // }

      reslutData.push({
        ...auctionData[0]._doc,
        property: prop[0],
        maximumBid: maxBidData,
      });
    }

    if (reslutData.length === 0) {
      return res.status(400).json({ message: "No Auctions Found" });
    }

    res.status(200).json({ data: reslutData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const auctionById = async (req, res) => {
  try {
    const auctionId = req.params.auctionId;

    const auctionData = await auctionModel.find({ _id: auctionById });

    if (auctionData.length === 0) {
      res.status(409).josn({ message: "No Data Found", data: auctionData[0] });
    } else {
      res.status(200).json({ data: auctionData[0] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const auctionWinner = async (auctionId) => {
  console.log("auctionnnnnnnnn", auctionId);

  const auctionData = await auctionModel.find({ _id: auctionId });

  let maxBidAmount = 0;
  let winnerId;
  let winnerData;

  if (auctionData.length > 0) {
    const bidData = auctionData[0].buyers;

    for (let bid of bidData) {
      if (bid.bidAmount > maxBidAmount) {
        maxBidAmount = bid.bidAmount;
        winnerId = bid.buyerId;
        winnerData = bid;
      }
    }

    const status = await auctionModel.findByIdAndUpdate(
      { _id: auctionId },
      { auctionWinner: winnerId, winnerData: winnerData }
    );

    if (status) {
      for (let bids of bidData) {
        sendAuctionWinnerDetails(winnerId, bids.buyerId);
      }
      console.log("winner decided", status);
    } else {
      console.log("abcd");
    }
  } else {
    console.log("No Auction");
  }
};
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const sendAuctionWinnerDetails = async (winnerMail, contactId) => {
  console.log("mails");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const contact = await userModel.find({ _id: contactId }, { password: 0 });

  AgentpushNotification1(
    "Auction Winner details",
    `${contact[0].firstName} ${contact[0].lastName} won the Auction`,
    3,
    contactId
  );

  let htmlContent;
  console.log(winnerMail, contactId, winnerMail === contactId);
  if (winnerMail === contactId) {
    htmlContent = `<div style="text-align: center; font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <h1 style="color:rgb(46, 139, 139);">Congratulations ${contact[0].firstName} ${contact[0].lastName}!</h1>
      <h2 style="color: #555;">You are the winner of the auction!</h2>
      <h3 style="color: #888;">You will be contacted shortly for the next steps in the process.</h3>
      <p style="color: #333;">Thank you for participating in the auction, and we look forward to working with you!</p>
      <footer style="margin-top: 20px; font-size: 14px; color: #aaa;">
        <p>Best regards,<br>Your Auction Team</p>
      </footer>
    </div>`;
  } else {
    htmlContent = `<div style="text-align: center; font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <h1 style="color:rgb(74, 138, 158);">Thank you for participating, ${contact[0].firstName} ${contact[0].lastName}!</h1>
      <h2 style="color: #555;">Unfortunately, you did not win the auction this time.</h2>
      <h3 style="color: #888;">We appreciate your interest and participation!</h3>
      <p style="color: #333;">Stay tuned for future auctions and best of luck next time!</p>
      <footer style="margin-top: 20px; font-size: 14px; color: #aaa;">
        <p>Best regards,<br>Your Auction Team</p>
      </footer>
    </div>`;
  }

  const contactValue = contact[0].email;

  const mailOptions = {
    from: EMAIL_USER,
    to: contactValue,
    subject: "Auction Winner Details",
    html: `<html><body>${htmlContent}</body></html>`, // HTML content with inline images
  };

  await transporter.sendMail(mailOptions);
};

const getWinnerData = async (req, res) => {
  try {
    const userId = req.user.user.userId;

    const auctionData = await auctionModel.find({ auctionWinner: userId });
 
    let result = [];

 


    if (auctionData.length === 0) {
      res.status(409).json({ message: "No won Auctions", status: false });
    } else {
      for (let auction of auctionData) {
        let propertyDetails;

        propertyDetails = await fieldModel.find({ _id: auction.propertyId });
        if (propertyDetails.length === 0) {
          propertyDetails = await commercialModel.find({
            _id: auction.propertyId,
          });
        }
        if (propertyDetails.length === 0) {
          propertyDetails = await layoutModel.find({ _id: auction.propertyId });
        }
        if (propertyDetails.length === 0) {
          propertyDetails = await residentialModel.find({
            _id: auction.propertyId,
          });
        }

        console.log("propertyDetails", auction, propertyDetails);

        let propertyName;
        let propertyImage;
        if (propertyDetails[0].propertyType === "Agricultural land") {
          propertyName = propertyDetails[0].landDetails.title;
          propertyImage = propertyDetails[0].landDetails.images;
        } else if (propertyDetails[0].propertyType === "Layout") {
          propertyName = propertyDetails[0].layoutDetails.layoutTitle;
          propertyImage = propertyDetails[0].uploadPics;
        } else if (propertyDetails[0].propertyType === "Residential") {
          propertyName = propertyDetails[0].propertyDetails.apartmentName;
          propertyImage = propertyDetails[0].propPhotos;
        } else {
          propertyName = propertyDetails[0].propertyTitle;

          propertyImage = propertyDetails[0].uploadPics;
        }
        if(auction.winnerData.seenStatus===0 || auction.winnerData.seenStatus==="0")
          {
            await auctionModel.findByIdAndUpdate(auction._id,{"winnerData.seenStatus":1})


            result.push({
              auctionData: auction,
              propertyName: propertyName,
              propertyImage: propertyImage,
            });
          } 

             
 
      }

      res.status(200).json({ data: result, status: true });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Internal Server Error" });
  }
};

const registerPushToken = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const userId = req.user.user.userId;

    const role = req.user.user.role;
    const pushToken = req.body.pushToken;

    const data = {
      userId: userId,
      role: role,
      pushToken: pushToken,
    };

    const notificationData = await pushNotification.find({
      userId: userId,
      pushToken: pushToken,
    });
    console.log("notificationData", notificationData);
    if (notificationData.length === 0) {
      const pushModel = new pushNotification(data);

      await pushModel.save();
    }

    res.status(200).json({ message: "Token Registered Successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Internal Server Error" });
  }
};

 

const AuctionPushNotification = async (message) => {
  try {
    console.log("message", message);
    const buyersData = await userModel.find({ role: 3 });

    for (let buyer of buyersData) {
      const tokensData = await pushNotification.find({ userId: buyer._id });
      console.log("tokensData1234", tokensData);

      if (tokensData.length > 0) {
        for (let tokens of tokensData) {
          console.log("tokensData", tokens.pushToken);

          await axios
            .post("https://api.expo.dev/v2/push/send", {
              to: tokens.pushToken,
              sound: "default",
              title: "Auction Reminder",
              body: message,
            })
            .then((response) => {
              console.log(response);
            });
        }
      }
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
 

const testNotification = async (req, res) => {
  try {
    const response = await axios.post("https://api.expo.dev/v2/push/send", {
      to: "ExponentPushToken[HxzTvlJmoL_7ZBtU2Pil-R]",
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

module.exports = {
  postAuction,
  bidByBuyer,
  getBidsOfAuction,
  closeAuction,
  getAllAuctions,
  getTodayAuctions,
  getFutureAuctions,
  getAuctionDetailsofProperty,
  auctionById,
  auctionWinner,
  getWinnerData,
  registerPushToken,
  AuctionPushNotification,

  testNotification,
};
