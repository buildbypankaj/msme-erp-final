const prisma = require('../utils/prisma');

// CREATE category
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await prisma.category.create({
      data: { name },
    });

    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Category already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all categories
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, isActive },
    });

    res.status(200).json({ message: 'Category updated', category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };