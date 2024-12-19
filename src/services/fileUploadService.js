const multer = require('multer');
const path = require('path');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Estate_Management_fileuploads/'); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer middleware setup for single file upload
const upload = multer({ storage: storage }).single('document');

// Function to handle file upload and return file details
const handleFileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to upload file', error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Pass file path to the next middleware or controller
    req.filePath = req.file.path;
    next();
  });
};

module.exports = {
  handleFileUpload
};
