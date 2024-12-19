const { date } = require("joi");
const meetingsModel = require("../models/meetingsModel");
const nodemailer = require("nodemailer");
const userModel = require("../models/userModel");

const getAllScheduledMeetings = async (req, res) => {
  try {
    let data = [];
    if (req.user.user.role === 1) {
      data = await meetingsModel.find({ agentId: req.user.user.userId });
      console.log(data);
    } else if (req.user.user.role === 3 || req.user.user.role === 2) {
      data = await meetingsModel.find({ customerId: req.user.user.userId });
    }else if (req.user.user.role === 5) {
      data = await meetingsModel.find({ csrId: req.user.user.userId });
      console.log(data);
      }

let data1=[]
  for(let d of data)
  {
    let scheduledBy=d.scheduledBy

    const scheduleDetails=await userModel.find({_id:scheduledBy},{password:0})

    console.log("scheduleDetails",d,d._doc.scheduledBy,scheduledBy,scheduleDetails)
       let result={
        ...d._doc,
        "scheduledByName":scheduleDetails[0].firstName +" "+ scheduleDetails[0].lastName
       }

       data1.push(result)
  }



    if (data1.length > 0) {
      res.status(200).json({ data: data1 });
    } else {
      res.status(404).json({ message: "No Scheduled Meetings", data: data1 });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

// const scheduleMeeting = async (req, res) => {
//   try {
//   const {
//   meetingTitle,
//   meetingType,
//   propertyName,
//   customerMail,
//   meetingInfo,
//   meetingStartTime,
//   meetingEndTime,
//   scheduledBy,
//   agentId,
//   dealingId,
//   propertyId,
//   } = req.body;

//   if (!meetingTitle || !meetingType || !propertyName || !customerMail) {
//   return res.status(400).json({ error: "All required fields must be provided." });
//   }

//   // Check if the agent is available
//   const overlappingMeeting = await meetingsModel.findOne({
//   agentId,
//   $or: [
//   {
//   meetingStartTime: { $lt: new Date(meetingEndTime), $gte: new Date(meetingStartTime) }
//   },
//   {
//   meetingEndTime: { $gt: new Date(meetingStartTime), $lte: new Date(meetingEndTime) }
//   },
//   {
//   meetingStartTime: { $lte: new Date(meetingStartTime) },
//   meetingEndTime: { $gte: new Date(meetingEndTime) }
//   }
//   ]
//   });

//   if (overlappingMeeting) {
//   return res.status(400).json({
//   error: "The agent is not available during the selected time period.",
//   conflictingMeeting: overlappingMeeting,
//   });
//   }

//   // Create the new meeting
//   const newMeeting = new meetingsModel({
//   meetingTitle,
//   meetingType,
//   propertyName,
//   customerMail,
//   meetingInfo,
//   meetingStartTime,
//   meetingEndTime,
//   scheduledBy,
//   agentId,
//   dealingId,
//   propertyId,
//   });

//   const savedMeeting = await newMeeting.save();

//   // Send a response
//   res.status(201).json({ message: "Meeting created successfully.", data: savedMeeting });
//   } catch (error) {
//   console.error("Error creating meeting:", error);
//   res.status(500).json({ error: "Internal Server Error" });
//   }
//   };

// const scheduleMeeting = async (req, res) => {
//   try {
//     const {
//       meetingTitle,
//       meetingType,
//       propertyName,
//       customerMail,
//       meetingInfo,
//       meetingStartTime,
//       meetingEndTime,
//       scheduledBy,
//       agentId,
//       dealingId,
//       propertyId,
//       customerId,
//       location

//     } = req.body;
//     console.log(req.body)

//     if ( !propertyName || !customerMail) {
//       return res
//         .status(400)
//         .json({ error: "All required fields must be provided." });
//     }

//     const newMeeting = new meetingsModel({
//       propertyName,
//       customerMail,
//       meetingInfo,
//       meetingStartTime,
//       meetingEndTime,
//       scheduledBy,
//       agentId,
//       dealingId,
//       propertyId,
//       customerId,
//       location
//     });

//     const savedMeeting = await newMeeting.save();

//     res
//       .status(201)
//       .json({ message: "Meeting created successfully.", data: savedMeeting });
//   } catch (error) {
//     console.error("Error creating meeting:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
// // reschedule meeting

const scheduleMeeting = async (req, res) => {
  try {
 
   let {
       
       propertyName,
      customerMail,
      meetingInfo,
      meetingStartTime,
      meetingEndTime,
      scheduledBy,
      csrId,
      agentId,
      dealingId,
      propertyId,
      customerId,
      location,
    } = req.body;
    scheduledBy=req.user.user.userId;
    if (   !propertyName || !customerMail) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }

    const newMeeting = new meetingsModel({
 
      propertyName,
      customerMail,
      meetingInfo,
      meetingStartTime,
      meetingEndTime,
      scheduledBy,
      agentId,
      dealingId,
      propertyId,
      customerId,
      csrId
    });
console.log(meetingEndTime)
    const savedMeeting = await newMeeting.save();

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      // tls: {
      //   rejectUnauthorized: false,  // Optional: allow insecure connections
      // },

      port: 465,
      tls: false,
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: customerMail,
      subject: `Meeting Scheduled: ${propertyName}`,
      text: `Dear Customer,

We have scheduled the following meeting:

Title: ${propertyName}
Property: ${propertyName}
Start Time: ${meetingStartTime}
End Time: ${meetingEndTime}
Meeting Info: ${meetingInfo}

Best regards,
Bhumi.India Bazar`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send email." });
      }
      console.log("Email sent: " + info.response);
    });

    res
      .status(201)
      .json({ message: "Meeting created successfully.", data: savedMeeting });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const rescheduleMeeting = async (req, res) => {
  try {
    const {
      meetingId,
      meetingStartTime,
      meetingEndTime,
      meetingTitle,
      meetingInfo,
      customerMail,
    } = req.body;

    if (new Date(meetingStartTime) >= new Date(meetingEndTime)) {
      return res
        .status(400)
        .json({ error: "Start time must be before end time." });
    }

    const updatedMeeting = await meetingsModel.findOneAndUpdate(
      { _id: meetingId },
      {
        meetingStartTime,
        meetingEndTime,
        meetingTitle: meetingTitle || undefined,
        meetingInfo: meetingInfo || undefined,
        customerMail: Array.isArray(customerMail) ? customerMail : undefined,
      },
      { new: true }
    );

    if (!updatedMeeting) {
      return res.status(404).json({ error: "Meeting not found." });
    }

    res.status(200).json({
      message: "Meeting rescheduled successfully.",
      data: updatedMeeting,
    });
  } catch (error) {
    console.error("Error rescheduling meeting:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const currentDayMeetings = async (req, res) => {
  try {
    const meetings = await meetingsModel.find({
      agentId: req.user.user.userId,
    });
    let currentDay = [];
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    console.log(meetings);
    for (let meeting of meetings) {
      const startTime = meeting.meetingStartTime.toISOString().split("T")[0];
      console.log(meeting.meetingStartTime, startTime);
      if (startTime === formattedDate) {
        currentDay.push(meeting);
      }
    }
    if (currentDay.length > 0) {
      res.status(200).json(currentDay);
    } else {
      res.status(404).json("No Scheduled Meetings Today");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const checkUserAvailability = async (req, res) => {
  try {
    const { customerMail, meetingStartTime, meetingEndTime } = req.query;

    if (!customerMail || !meetingStartTime || !meetingEndTime) {
      return res
        .status(400)
        .json({
          error: "Customer email, start time, and end time are required.",
        });
    }

    // Validate time range
    const startTime = new Date(meetingStartTime);
    const endTime = new Date(meetingEndTime);

    if (startTime >= endTime) {
      return res
        .status(400)
        .json({ error: "Start time must be before end time." });
    }

    // Check if there's any meeting for the email within the given time range
    const existingMeeting = await meetingsModel.findOne({
      customerMail,
      $or: [
        {
          meetingStartTime: { $lt: endTime },
          meetingEndTime: { $gt: startTime },
        },
      ],
    });

    if (existingMeeting) {
      return res.status(200).json({
        message:
          "Customer is not avilable at the given time range.",
        available: false,
      });
    }

    res.status(200).json({
      message:
        "Customer is avilable at the given time range.",
      available: true,
    });
  } catch (error) {
    console.error("Error checking user availability:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllScheduledMeetings,
  scheduleMeeting,
  rescheduleMeeting,
  currentDayMeetings,
  checkUserAvailability,
};
