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
      complaintData.attachment = req.file.path; // Assuming you save the file on the server
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
    let com = [];
    for (const user of userData) {
      let userId = user.id;
      const complaintData = await complaintModel.find({ userId: userId });
      let complaints = [];
      for (const complaint of complaintData) {
        complaints.push({
          message: complaint.message,
          time: complaint.createdAt,
          attachment: complaint.attachment,
          category: complaint.category,
        });
      }

      let data = {
        name: user.firstName,
        profile: user.profilePicture,
        contact: user.phoneNumber,
        email: user.email,
        city: user.city,
        state: user.state,
        district: user.district,
        userId: user.id,
        messages: complaints,
      };
      com.push(data);
    }

    // const complaintData = await complaintModel.find();
    // let data = [];
    // for (const item of complaintData) {
    //   console.log(1, item, item.userId);
    //   let userId = item.userId;
    //   const user = await userModel.findById({ _id: userId });
    //   let complaint = {
    //     message: item.message,
    //     firstName: user.firstName,
    //     userId: item.userId,
    //   };
    //   data.push(complaint);
    // }

    res.status(200).json(com);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
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
