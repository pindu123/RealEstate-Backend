const express = require('express');
const { handleFileUpload } = require('../services/fileUploadService');
const { uploadFile } = require('../controllers/fileUploadController');

const fileUploadRoutes = express.Router();

fileUploadRoutes.post('/upload', handleFileUpload, uploadFile);

module.exports = fileUploadRoutes;



