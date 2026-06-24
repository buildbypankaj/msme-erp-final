const prisma = require('../utils/prisma');

// CREATE expense
const createExpense = async (req, res) => {
  try {
    const { title, category, amount, expenseDate, notes } = req.body;

    if (!title || !category || !amount) {
      return res.status(400).json({ message: 'Title, category and amount are required' });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        category,
        amount: parseFloat(amount),
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        notes,
      },
    });

    res.status(201).json({ message: 'Expense recorded', expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { expenseDate: 'desc' },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.status(200).json({ expenses, totalExpenses, count: expenses.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, amount, expenseDate, notes } = req.body;

    const expense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        title,
        category,
        amount: amount ? parseFloat(amount) : undefined,
        expenseDate: expenseDate ? new Date(expenseDate) : undefined,
        notes,
      },
    });

    res.status(200).json({ message: 'Expense updated', expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'Expense deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createExpense, getExpenses, updateExpense, deleteExpense };