const prisma = require('../utils/prisma');

// CREATE product
const createProduct = async (req, res) => {
  try {
    const { name, sku, categoryId, purchasePrice, sellingPrice, currentStock, minStock } = req.body;

    if (!name || !sku || !categoryId || !purchasePrice || !sellingPrice) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        categoryId: parseInt(categoryId),
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        currentStock: currentStock ? parseInt(currentStock) : 0,
        minStock: minStock ? parseInt(minStock) : 5,
      },
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all products
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, categoryId, purchasePrice, sellingPrice, currentStock, minStock, isActive } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        sku,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
        currentStock: currentStock !== undefined ? parseInt(currentStock) : undefined,
        minStock: minStock !== undefined ? parseInt(minStock) : undefined,
        isActive,
      },
    });

    res.status(200).json({ message: 'Product updated', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };