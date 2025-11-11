const { Media } = require('../models');
const path = require('path');
const fs = require('fs-extra');

const uploadSinglePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const { title, description, category, tags } = req.body;

    const media = await Media.create({
      title: title || req.file.originalname,
      description: description || '',
      type: 'image',
      fileName: req.file.filename,
      filePath: req.file.path.replace(/\\/g, '/'),
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category: category || 'general',
      tags: tags ? JSON.parse(tags) : [],
      metadata: {
        originalName: req.file.originalname,
        encoding: req.file.encoding,
        uploadDate: new Date()
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Photo uploaded successfully',
      data: {
        media,
        url: `/uploads/${path.relative('uploads', req.file.path).replace(/\\/g, '/')}`
      }
    });
  } catch (error) {
    console.error('Upload single photo error:', error);
    
    // Clean up uploaded file if database save fails
    if (req.file && req.file.path) {
      fs.remove(req.file.path).catch(console.error);
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const uploadMultiplePhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded'
      });
    }

    const { category, tags } = req.body;
    const uploadedMedia = [];

    for (const file of req.files) {
      try {
        const media = await Media.create({
          title: file.originalname,
          description: '',
          type: 'image',
          fileName: file.filename,
          filePath: file.path.replace(/\\/g, '/'),
          fileSize: file.size,
          mimeType: file.mimetype,
          category: category || 'general',
          tags: tags ? JSON.parse(tags) : [],
          metadata: {
            originalName: file.originalname,
            encoding: file.encoding,
            uploadDate: new Date()
          }
        });

        uploadedMedia.push({
          media,
          url: `/uploads/${path.relative('uploads', file.path).replace(/\\/g, '/')}`
        });
      } catch (error) {
        console.error('Error saving file to database:', error);
        // Clean up the file if database save fails
        fs.remove(file.path).catch(console.error);
      }
    }

    res.status(201).json({
      status: 'success',
      message: `${uploadedMedia.length} photos uploaded successfully`,
      data: { uploadedMedia }
    });
  } catch (error) {
    console.error('Upload multiple photos error:', error);
    
    // Clean up uploaded files if error occurs
    if (req.files) {
      req.files.forEach(file => {
        fs.remove(file.path).catch(console.error);
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const { title, description, category, tags } = req.body;
    
    let fileType = 'document';
    if (req.file.mimetype.startsWith('video/')) {
      fileType = 'video';
    } else if (req.file.mimetype.startsWith('audio/')) {
      fileType = 'audio';
    }

    const media = await Media.create({
      title: title || req.file.originalname,
      description: description || '',
      type: fileType,
      fileName: req.file.filename,
      filePath: req.file.path.replace(/\\/g, '/'),
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category: category || 'general',
      tags: tags ? JSON.parse(tags) : [],
      metadata: {
        originalName: req.file.originalname,
        encoding: req.file.encoding,
        uploadDate: new Date()
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'File uploaded successfully',
      data: {
        media,
        url: `/uploads/${path.relative('uploads', req.file.path).replace(/\\/g, '/')}`
      }
    });
  } catch (error) {
    console.error('Upload single file error:', error);
    
    // Clean up uploaded file if database save fails
    if (req.file && req.file.path) {
      fs.remove(req.file.path).catch(console.error);
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded'
      });
    }

    const { category, tags } = req.body;
    const uploadedMedia = [];

    for (const file of req.files) {
      try {
        let fileType = 'document';
        if (file.mimetype.startsWith('video/')) {
          fileType = 'video';
        } else if (file.mimetype.startsWith('audio/')) {
          fileType = 'audio';
        } else if (file.mimetype.startsWith('image/')) {
          fileType = 'image';
        }

        const media = await Media.create({
          title: file.originalname,
          description: '',
          type: fileType,
          fileName: file.filename,
          filePath: file.path.replace(/\\/g, '/'),
          fileSize: file.size,
          mimeType: file.mimetype,
          category: category || 'general',
          tags: tags ? JSON.parse(tags) : [],
          metadata: {
            originalName: file.originalname,
            encoding: file.encoding,
            uploadDate: new Date()
          }
        });

        uploadedMedia.push({
          media,
          url: `/uploads/${path.relative('uploads', file.path).replace(/\\/g, '/')}`
        });
      } catch (error) {
        console.error('Error saving file to database:', error);
        // Clean up the file if database save fails
        fs.remove(file.path).catch(console.error);
      }
    }

    res.status(201).json({
      status: 'success',
      message: `${uploadedMedia.length} files uploaded successfully`,
      data: { uploadedMedia }
    });
  } catch (error) {
    console.error('Upload multiple files error:', error);
    
    // Clean up uploaded files if error occurs
    if (req.files) {
      req.files.forEach(file => {
        fs.remove(file.path).catch(console.error);
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findByPk(id);
    if (!media) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.remove(media.filePath);
    } catch (fileError) {
      console.error('Error deleting file from filesystem:', fileError);
    }

    // Delete from database
    await media.destroy();

    res.json({
      status: 'success',
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const getFileInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findByPk(id);
    if (!media) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        media,
        url: `/uploads/${path.relative('uploads', media.filePath).replace(/\\/g, '/')}`
      }
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  uploadSinglePhoto,
  uploadMultiplePhotos,
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  getFileInfo
};