const prisma = require('../utils/prisma');

// CREATE customer
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, gstNumber } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const customer = await prisma.customer.create({
      data: { name, phone, email, address, gstNumber },
    });

    res.status(201).json({ message: 'Customer created', customer });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Phone number already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single customer
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, gstNumber, isActive } = req.body;

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { name, phone, email, address, gstNumber, isActive },
    });

    res.status(200).json({ message: 'Customer updated', customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Customer deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer };