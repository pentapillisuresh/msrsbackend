const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const imagesDir = path.join(uploadDir, 'images');
const documentsDir = path.join(uploadDir, 'documents');
const tempDir = path.join(uploadDir, 'temp');

[uploadDir, imagesDir, documentsDir, tempDir].forEach(dir => {
  fs.ensureDirSync(dir);
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    if (file.fieldname === 'image' || file.fieldname === 'images' || file.mimetype.startsWith('image/')) {
      uploadPath = imagesDir;
    } else if (file.fieldname === 'document' || file.fieldname === 'documents' || 
               file.mimetype === 'application/pdf' || 
               file.mimetype === 'application/vnd.ms-excel' ||
               file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      uploadPath = documentsDir;
    } else {
      uploadPath = tempDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocumentTypes = /pdf|doc|docx|xls|xlsx|txt/;
  
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedDocumentTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/') ||
                   file.mimetype === 'application/pdf' ||
                   file.mimetype === 'application/msword' ||
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.mimetype === 'application/vnd.ms-excel' ||
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed'));
  }
};

// Create multer instances for different upload scenarios
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Single file upload
const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload (same field)
const uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);

// Multiple files upload (different fields)
const uploadFields = (fields) => upload.fields(fields);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
};