// controllers/eventCategoryController.js
const EventCategory = require('../models/EventCategory');
const Invitation = require('../models/Invitation');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await EventCategory.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await EventCategory.findAll({
      include: [{ model: Invitation, as: 'invitations' }]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await EventCategory.findByPk(req.params.id, {
      include: [{ model: Invitation, as: 'invitations' }]
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await EventCategory.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.name = name || category.name;
    category.description = description || category.description;
    category.isActive = isActive ?? category.isActive;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await EventCategory.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
