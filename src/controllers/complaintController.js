const { complaintSchema } = require("../helpers/complaintValidation");
const complaintModel = require("../models/complaintModel");
const userModel = require("../models/userModel");

const postComplaint = async (req, res) => {
  try {
    const result = await complaintSchema.validateAsync(req.body);
    console.log(result);

    const complaintData = {
      userId: req.body.userId,
      role: req.body.role,
      message: req.body.message,
      category: req.body.category,
    };

    if (req.file) {
      complaintData.attachment = req.file.path;  
    }
    const complaint = new complaintModel(complaintData);

    await complaint.save();

    res.status(200).json("Complaint Raised Successfully");
  } catch (error) {
    if (error.isJoi) {
      console.log(error);
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }
    res.status(500).json({ message: error.message });
  }
};
 

const getCompliants = async (req, res) => {
  try {
    
    const userData = await userModel.find({ role: req.params.role });
    console.log(userData)
    if (!userData.length) {
      return res.status(409).json({ message: "No users found with the specified role" });
    }

    const complaintsPromises = userData.map(async (user) => {
      const complaintData = await complaintModel.find({ userId: user.id });
      const complaints = complaintData.map((complaint) => ({
        message: complaint.message,
        time: complaint.createdAt,
        attachment: complaint.attachment,
        category: complaint.category,
      }));

      return {
        name: `${user.firstName} ${user.lastName}`,
        profile: user.profilePicture,
        contact: user.phoneNumber,
        email: user.email,
        city: user.city,
        state: user.state,
        district: user.district,
        userId: user.id,
        messages: complaints,
      };
    });

    const com = await Promise.all(complaintsPromises);
    res.status(200).json(com);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getUserCompliants = async (req, res) => {
  try {
    const complaints = await complaintModel.find({ userId: req.params.userId });
    const userData = await userModel.findById(req.params.userId);

    const enhancedComplaints = complaints.map((complaint) => ({
      message: complaint.message,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      category: complaint.category,
      issueId: complaint.id,
      attachment: complaint.attachment,
      name: `${userData.firstName} ${userData.lastName}`,
      phoneNumber: userData.phoneNumber,
      profileImage: userData.profilePicture,
      state: userData.state,
      district: userData.district,
      city: userData.city,
      email: userData.email,
    }));

    res.status(200).json(enhancedComplaints);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

module.exports = { postComplaint, getCompliants, getUserCompliants };
