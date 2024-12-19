const { handleFileUpload } = require('../services/fileUploadService');

const uploadFile = (req, res) => {
    console.log("hdhgh");
    console.log(req.file);
  // The handleFileUpload middleware has already processed the file upload
  return res.status(200).json({
    message: 'File uploaded successfully',
    fileName: req.file.filename // This can be stored in a database as needed
  });
};

module.exports = {
  uploadFile
};
