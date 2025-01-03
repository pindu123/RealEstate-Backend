const activityModel = require("../models/activityModel");
const dealsModel = require("../models/propertyDealsModel");
const { ObjectId } = require("mongodb");
const userModel = require("../models/userModel");
const notifyModel = require("../models/notificationModel");
const { message } = require("../helpers/taskValidation");

// api to post activity by the agent
const getActivities = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
console.log(role)
    let activities = [];
    if (role === 1) {
      activities = await activityModel.find({ agentId: userId }).sort({ createdAt: -1 });
    } 
    if (role === 5) {
      activities = await activityModel.find({ csrId: userId }).sort({ createdAt: -1 });
    } 
    if(role === 0)
      {
        activities = await activityModel.find( ).sort({ createdAt: -1 });
      }
    if (!activities.length) {
      return res.status(404).json({ message: "No activities found for the provided criteria." });
    }

    const userIds = activities.map(activity => activity.activityBy).filter(id => id); // Filter out undefined or null IDs
    const users = await userModel.find({ _id: { $in: userIds } }, "firstName lastName");

    const dealIds = activities.map(activity => activity.dealingId).filter(id => id); // Filter out undefined or null IDs
    const deals = await dealsModel.find({ _id: { $in: dealIds } }, "propertyName");

    const activitiesWithDetails = activities.map(activity => {
      const user = activity.activityBy
        ? users.find(u => u._id.toString() === activity.activityBy.toString())
        : null;

      const deal = activity.dealingId
        ? deals.find(d => d._id.toString() === activity.dealingId.toString())
        : null;

      return {
        ...activity._doc,
        activityByName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
        propertyName: deal ? deal.propertyName : "Unknown Property"
      };
    });

    res
      .status(200)
      .json({ message: "Activities retrieved successfully.", data: activitiesWithDetails });
  } catch (error) {
    console.error("Error retrieving activities:", error.message, error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
 

// api to get all activity based on dealing or agentId
const getAllActivities = async (req, res) => {
  try {
    const { agentId, dealingId } = req.query;
    let activities = [];
   if (dealingId) {
      activities = await activityModel.find({ dealingId }).sort({ createdAt: -1 });
    }

    console.log(dealingId)
    if (!activities || activities.length === 0) {
      return res.status(404).json({ message: "No activities found for the provided criteria." });
    }

    const userIds = activities
      .map((activity) => activity.activityBy)
      .filter((id) => id); 

    const users = await userModel.find({ _id: { $in: userIds } }, "firstName lastName");

    const activitiesWithNames = activities.map((activity) => {
      const user = activity.activityBy
        ? users.find((u) => u._id.toString() === activity.activityBy.toString())
        : null;
      return {
        ...activity._doc,
        activityByName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
      };
    });

    res.status(200).json({ message: "Activities retrieved successfully.", data: activitiesWithNames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// get specific activity based on activity id
const getSpecificActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await activityModel.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    res.status(200).json({ message: "Activity retrieved successfully.", data: activity });
  } catch (error) {
    console.error("Error retrieving activity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// update specific Activity
const updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { dealingId, agentId, comment, meetingDate } = req.body;

    // Build an update object
    let updateFields = {};

    if (dealingId !== undefined) updateFields.dealingId = dealingId;
    if (agentId !== undefined) updateFields.agentId = agentId;
    if (comment !== undefined) updateFields.comment = comment;
    if (meetingDate !== undefined) updateFields.meetingDate = meetingDate;

    // If no fields to update, return a response
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    // Find and update the activity by ID
    const updatedActivity = await activityModel.findByIdAndUpdate(
      activityId,
      { $set: updateFields }, // Update only the fields that are present
      { new: true } // Return the updated document
    );

    // If the activity is not found
    if (!updatedActivity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    // Respond with the updated activity data
    res.status(200).json({ message: "Activity updated successfully.", data: updatedActivity });
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
 





  const createActivity = async (req, res) => {
    try {
    const { dealingId, agentId, comment, startDate, endDate, location, csrId } = req.body;
    const activityBy = req.user.user.userId;
    if (!dealingId || !agentId || !comment || !startDate) {
    return res.status(400).json({ error: "All required fields must be provided." });
    }
    
    const newActivity = new activityModel({
    dealingId,
    agentId,
    csrId,
    comment,
    startDate,
    endDate,
    location,
    activityBy
    });
    
    // Save the activity in the database
    const savedActivity = await newActivity.save();
    
    res.status(201).json({ message: "Activity created successfully.", data: savedActivity });
    } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Internal Server Error" });
    }
    };
  //get all the activities based on the user role


const getNotification=async(req,res)=>{
  try
  {
    const userId=req.user.user.userId

    const notification= await notifyModel.find({receiverId:userId,status:"unSeen"});
    let notifications=[]

    for(let notify of notification )
    {
       const userData=await userModel.findById({_id:notify.senderId})

       notifications.push({
        message:notify.message,
        senderId:notify.senderId,
        receiverId:notify.receiverId,
        notifyType:notify.notifyType,
         senderName:`${userData.firstName} ${userData.lastName}`,
         profilePicture:userData.profilePicture     
       })
    }
     
    if(notifications.length==0)
    {
      res.status(409).json("No Notifications")
    }
    else{
      res.status(200).json(notifications)
    }
  

  }
  catch(error)
  {
    console.log(error)
   res.status(500).json("Internal Server Error")
  }
}



module.exports = {
  createActivity,
  updateActivity,
  getSpecificActivity,
  getAllActivities,
  getActivities,createActivity,
  getNotification
};