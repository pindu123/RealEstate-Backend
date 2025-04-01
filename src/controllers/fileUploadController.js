const { handleFileUpload } = require('../services/fileUploadService');

const uploadFile = (req, res) => {
    console.log("hdhgh");
    console.log(req.file);
   return res.status(200).json({
    message: 'File uploaded successfully',
    fileName: req.file.filename  
  });
};

module.exports = {
  uploadFile
};
