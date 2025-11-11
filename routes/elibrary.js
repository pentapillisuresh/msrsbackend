const express = require('express');
const { ELibrary } = require('../models');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const elibraryValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('category')
    .isIn(['puranas', 'vedic_texts', 'spiritual_books', 'social_welfare', 'economics', 'philosophy', 'others'])
    .withMessage('Invalid category'),
  body('format')
    .isIn(['pdf', 'epub', 'audio', 'video'])
    .withMessage('Invalid format'),
  body('filePath')
    .trim()
    .notEmpty()
    .withMessage('File path is required')
];

// Get all books (public)
router.get('/', async (req, res) => {
  try {
    const { category, format, language, isActive = true } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const whereClause = { isActive };
    if (category) whereClause.category = category;
    if (format) whereClause.format = format;
    if (language) whereClause.language = language;

    const books = await ELibrary.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['sortOrder', 'ASC'], ['title', 'ASC']]
    });

    res.json({
      status: 'success',
      data: {
        books: books.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(books.count / limit),
          totalItems: books.count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get books by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const books = await ELibrary.findAll({
      where: { 
        category,
        isActive: true 
      },
      order: [['sortOrder', 'ASC'], ['title', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { books }
    });
  } catch (error) {
    console.error('Get books by category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Search books
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { Op } = require('sequelize');

    const books = await ELibrary.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { author: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['downloadCount', 'DESC'], ['title', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { books }
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get popular books
router.get('/popular', async (req, res) => {
  try {
    const books = await ELibrary.findAll({
      where: { isActive: true },
      order: [['downloadCount', 'DESC']],
      limit: 10
    });

    res.json({
      status: 'success',
      data: { books }
    });
  } catch (error) {
    console.error('Get popular books error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await ELibrary.findByPk(id);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    res.json({
      status: 'success',
      data: { book }
    });
  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Download book (increment download count)
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await ELibrary.findByPk(id);
    if (!book || !book.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found or inactive'
      });
    }

    // Increment download count
    await book.increment('downloadCount');

    // Return download URL or file info
    res.json({
      status: 'success',
      message: 'Download initiated',
      data: {
        book,
        downloadUrl: `/uploads/${require('path').relative('uploads', book.filePath).replace(/\\/g, '/')}`
      }
    });
  } catch (error) {
    console.error('Download book error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Create book entry
router.post('/', elibraryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const book = await ELibrary.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Book created successfully',
      data: { book }
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update book
router.put('/:id', elibraryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const book = await ELibrary.findByPk(id);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    await book.update(req.body);

    res.json({
      status: 'success',
      message: 'Book updated successfully',
      data: { book }
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await ELibrary.findByPk(id);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    // Delete file from filesystem
    const fs = require('fs-extra');
    try {
      await fs.remove(book.filePath);
      if (book.thumbnailPath) {
        await fs.remove(book.thumbnailPath);
      }
    } catch (fileError) {
      console.error('Error deleting book files:', fileError);
    }

    await book.destroy();

    res.json({
      status: 'success',
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;