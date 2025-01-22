const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");

const path = require("path");
const {
  getUnAssignedAgents,
  getAssignedAgents,
  getAgentByPhone,
  assignAgentToCSR,
  getDataFromExcel,
  getCsrDataFromExcel,
  getPropsByCsr,
  getAssignedCsr,
  assignCustomerToAgent,
  assignPropertyToAgent,
} = require("../controllers/csrController");
const csrRoutes = express.Router();

csrRoutes.get("/getUnAssignedAgents/:csrId", getUnAssignedAgents);

csrRoutes.get("/getAssignedAgents/:csrId", getAssignedAgents);
csrRoutes.get("/getAgentByPhone/:contact", getAgentByPhone);
csrRoutes.put("/assignAgentToCSR", assignAgentToCSR);

csrRoutes.get("/getPropsByCsr/:csrId", getPropsByCsr);

csrRoutes.get("/getAssignedCsr/:agentId",getAssignedCsr)
csrRoutes.post("/assignCustomer", assignCustomerToAgent);
csrRoutes.post("/assigneProperty",assignPropertyToAgent);
csrRoutes.get("/abc",async(req,res)=>{
  console.log("abc")
  console.log(req.query)
})
 

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create uploads directory  if it doesn't exist
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Adding unique name to avoid conflicts
  },
});

const upload = multer({ storage: storage });  

csrRoutes.post("/upload-excel", upload.single("file"), getCsrDataFromExcel);
module.exports = csrRoutes;
