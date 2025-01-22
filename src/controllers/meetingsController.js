const { date } = require("joi");
const meetingsModel = require("../models/meetingsModel");
const nodemailer = require("nodemailer");
const userModel = require("../models/userModel");
const customerModel = require("../models/customerModel");


const getAllScheduledMeetings = async (req, res) => {
  try {
    let data = [];
    if (req.user.user.role === 1) {
      data = await meetingsModel.find({ agentId: req.user.user.userId });
    } else if (req.user.user.role === 3 || req.user.user.role === 2) {
      data = await meetingsModel.find({ customerId: req.user.user.userId });
    } else if (req.user.user.role === 5) {
      data = await meetingsModel.find({ csrId: req.user.user.userId });
    }

    let data1 = [];
    for (let d of data) {
      let scheduledBy = d.scheduledBy;
      
      // Fetch the user who scheduled the meeting (scheduleByName)
      const scheduleDetails = await userModel.find({ _id: scheduledBy }, { password: 0 });

      // Fetch the customer details for the meeting (e.g., customer name, phone number)
      const customer = await userModel.findById(d.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
      const phoneNumber = customer ? customer.phoneNumber : 'Unknown Number';

      const agent=await userModel.findById(d.agentId);
       let result = {
        ...d._doc,
        "scheduledByName": scheduleDetails[0].firstName + " " + scheduleDetails[0].lastName,
        "customerName": customerName,
        "agentName":agent.firstName+ " "+agent.lastName,
        "phoneNumber": phoneNumber
      };

      data1.push(result);
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



const scheduleMeetingNew = async (req, res) => {
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

    scheduledBy = req.user.user.userId;

    if (!propertyName || !customerMail) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided." });
    }

    // Check for conflicts with customerId or agentId in meetings model
    const existingMeeting = await meetingsModel.findOne({
      $or: [
        {
          $and: [
            { scheduledBy },
            { $or: [{ customerId }, { agentId }] },
            {
              $or: [
                { meetingStartTime: { $lt: meetingEndTime } },
                { meetingEndTime: { $gt: meetingStartTime } },
              ],
            },
          ],
        },
        {
          $and: [
            { scheduledBy },
            {
              $or: [
                { agentId: { $exists: true } },
                { customerId: { $exists: true } },
              ],
            },
            {
              $or: [
                { meetingStartTime: { $lt: meetingEndTime } },
                { meetingEndTime: { $gt: meetingStartTime } },
              ],
            },
          ],
        },
      ],
    });

    if (existingMeeting) {
      return res.status(409).json({ error: "Meeting conflicts with existing schedules." });
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
      csrId,
      location,
    });

    const savedMeeting = await newMeeting.save();

    if (customerMail) {
      const EMAIL_USER = process.env.EMAIL_USER;
      const EMAIL_PASS = process.env.EMAIL_PASS;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
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
    }

    res.status(201).json({ message: "Meeting created successfully.", data: savedMeeting, status: true });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
//uncomment this if above has any problem
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
    //customerId , meetingEndTime, meetingEndTime check these fields in meetings model where the
    // scheduledBy
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
      csrId,
      location,
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
if(customerMail)
{
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
  }
    res
      .status(201)
      .json({ message: "Meeting created successfully.", data: savedMeeting ,status:true});
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Internal Server Error" ,status:false});
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


// const currentWeekMeetings = async (req, res) => {
//   try {
//     const currentDate = new Date();
//     const startOfWeek = new Date(currentDate);
//     const endOfWeek = new Date(currentDate);
//     const currentDay = currentDate.getDay();

//     startOfWeek.setDate(currentDate.getDate() - currentDay);
//     startOfWeek.setHours(0, 0, 0, 0);

//     endOfWeek.setDate(currentDate.getDate() + (6 - currentDay));
//     endOfWeek.setHours(23, 59, 59, 999);

//     const agentId = req.user.user.userId;

//     const meetings = await meetingsModel.find({
//       agentId: agentId,
//       meetingStartTime: { $gte: startOfWeek, $lte: endOfWeek }
//     });

//     const meetingDetails = [];

//     for (const meeting of meetings) {
//       const customer = await customerModel.findById(meeting.customerId);
//       const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
      
//       meetingDetails.push({
//         ...meeting.toObject(),
//         customerName
//       });
//     }

//     if (meetingDetails.length > 0) {
//       res.status(200).json(meetingDetails);
//     } else {
//       res.status(409).json("No Scheduled Meetings This Week");
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json("Internal Server Error");
//   }
// };

// const currentDayMeetings = async (req, res) => {
//   try {
//     const meetings = await meetingsModel.find({
//       agentId: req.user.user.userId,
//     });

//     const currentDay = [];
//     const currentDate = new Date();
//     const formattedDate = currentDate.toISOString().split("T")[0];

//     for (const meeting of meetings) {
//       const startTime = meeting.meetingStartTime.toISOString().split("T")[0];

//       // If the meeting is today, add it to the currentDay array
//       if (startTime === formattedDate) {
//         const customer = await customerModel.findById(meeting.customerId);
//         const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';

//         currentDay.push({
//           ...meeting.toObject(),
//           customerName
//         });
//       }
//     }

//     if (currentDay.length > 0) {
//       res.status(200).json(currentDay);
//     } else {
//       res.status(409).json("No Scheduled Meetings Today");
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json("Internal Server Error");
//   }
// };

const currentWeekMeetings = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    const endOfWeek = new Date(currentDate);
    const currentDay = currentDate.getDay();

    startOfWeek.setDate(currentDate.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    endOfWeek.setDate(currentDate.getDate() + (6 - currentDay));
    endOfWeek.setHours(23, 59, 59, 999);

    const agentId = req.user.user.userId;

    const meetings = await meetingsModel.find({
      agentId: agentId,
      meetingStartTime: { $gte: startOfWeek, $lte: endOfWeek }
    }).sort({ meetingStartTime: 1 }); // Sorting by meetingStartTime in ascending order

    // Manually fetching customer names
    const meetingDetails = [];

    for (const meeting of meetings) {
      const customer = await userModel.findById(meeting.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
      console.log("customerName",customer)
      meetingDetails.push({
        ...meeting.toObject(),
        customerName,
        phoneNumber:customer.phoneNumber
      });
    }

    if (meetingDetails.length > 0) {
      res.status(200).json(meetingDetails);
    } else {
      res.status(409).json("No Scheduled Meetings This Week");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

// const currentDayMeetings = async (req, res) => {
//   try {
//     const meetings = await meetingsModel.find({
//       agentId: req.user.user.userId,
//     }).sort({ meetingStartTime: 1 }); // Sorting by meetingStartTime in ascending order

//     const currentDay = [];
//     const currentDate = new Date();
//     const formattedDate = currentDate.toISOString().split("T")[0];

//     for (const meeting of meetings) {
//       const startTime = meeting.meetingStartTime.toISOString().split("T")[0];

//       // If the meeting is today, add it to the currentDay array
//       if (startTime === formattedDate) {
//         const customer = await customerModel.findById(meeting.customerId);
//         const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';

//         currentDay.push({
//           ...meeting.toObject(),
//           customerName,
//           phoneNumber:customer.phoneNumber||'NA'
//         });
//       }
//     }

//     if (currentDay.length > 0) {
//       res.status(200).json(currentDay);
//     } else {
//       res.status(409).json("No Scheduled Meetings Today");
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json("Internal Server Error");
//   }
// };

const currentDayMeetings = async (req, res) => {
  try {
    const meetings = await meetingsModel.find({
      agentId: req.user.user.userId,
    }).sort({ meetingStartTime: 1 }); // Sorting by meetingStartTime in ascending order

    const currentDay = [];
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];

    for (const meeting of meetings) {
      const startTime = meeting.meetingStartTime.toISOString().split("T")[0];

      // If the meeting is today, add it to the currentDay array
      if (startTime === formattedDate) {
        const customer = await userModel.findById(meeting.customerId);
        
        // Check if customer is not null
        if (customer) {
          const customerName = `${customer.firstName} ${customer.lastName}`;
          const phoneNumber = customer.phoneNumber || 'NA';
          
          currentDay.push({
            ...meeting.toObject(),
            customerName,
            phoneNumber
          });
        }
      }
    }

    if (currentDay.length > 0) {
      res.status(200).json(currentDay);
    } else {
      res.status(409).json("No Scheduled Meetings Today");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const meetingOnDate = async (req, res) => {
  try {
    
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // date format is (YYYY-MM-DD)
    const providedDate = new Date(date);
    
    if (isNaN(providedDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const startOfDay = new Date(providedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(providedDate.setHours(23, 59, 59, 999));

    const meetings = await meetingsModel.find({
      agentId: req.user.user.userId,
      meetingStartTime: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ meetingStartTime: 1 }); // asc
    const dayMeetings = [];

    for (const meeting of meetings) {
      const customer = await customerModel.findById(meeting.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
      const phoneNumber = customer ? customer.phoneNumber : 'Unknown Number';

      dayMeetings.push({
        ...meeting.toObject(),
        customerName,
        phoneNumber,
      });
    }

    if (dayMeetings.length > 0) {
      res.status(200).json(dayMeetings);
    } else {
      res.status(409).json("No Scheduled Meetings for the Given Date");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

//customerId , meetingEndTime, meetingEndTime check these fields in meetings model where the
    // scheduledBy
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
  currentWeekMeetings,
  meetingOnDate,

};
