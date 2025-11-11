const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Ensure upload directories exist
const createUploadDirectories = () => {
  const directories = [
    'uploads/images',
    'uploads/documents',
    'uploads/media',
    'uploads/profiles',
    'uploads/books'
  ];
  
  directories.forEach(dir => {
    fs.ensureDirSync(dir);
  });
};

createUploadDirectories();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.includes('pdf') || file.mimetype.includes('document') || 
               file.mimetype.includes('sheet') || file.mimetype.includes('excel')) {
      uploadPath += 'documents/';
    } else if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      uploadPath += 'media/';
    } else {
      uploadPath += 'documents/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, name + '_' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  // Allowed document types
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  // Allowed media types
  const mediaTypes = ['video/mp4', 'video/mpeg', 'audio/mpeg', 'audio/wav'];
  
  const allowedTypes = [...imageTypes, ...documentTypes, ...mediaTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

// Different upload configurations
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);
const uploadFields = (fields) => upload.fields(fields);

// Upload middleware with error handling
const uploadWithErrorHandling = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            message: 'File size too large. Maximum allowed size is 10MB.'
          });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            status: 'error',
            message: 'Too many files uploaded.'
          });
        }
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      } else if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadWithErrorHandling
};