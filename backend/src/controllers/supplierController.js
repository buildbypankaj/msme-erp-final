const prisma = require('../utils/prisma');

// CREATE supplier
const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, gstNumber } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const supplier = await prisma.supplier.create({
      data: { name, phone, email, address, gstNumber },
    });

    res.status(201).json({ message: 'Supplier created', supplier });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Phone number already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single supplier
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE supplier
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, gstNumber, isActive } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: { name, phone, email, address, gstNumber, isActive },
    });

    res.status(200).json({ message: 'Supplier updated', supplier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE supplier
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.supplier.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Supplier deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createSupplier, getSuppliers, getSupplierById, updateSupplier, deleteSupplier };