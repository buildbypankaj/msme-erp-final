const prisma = require('../utils/prisma');

// CREATE payment (and update invoice paid/due amount)
const createPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentMode, notes } = req.body;

    if (!invoiceId || !amount) {
      return res.status(400).json({ message: 'Invoice and amount are required' });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(invoiceId) } });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (parseFloat(amount) > invoice.dueAmount) {
      return res.status(400).json({ message: `Amount exceeds due amount of ₹${invoice.dueAmount}` });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          invoiceId: parseInt(invoiceId),
          amount: parseFloat(amount),
          paymentMode: paymentMode || 'cash',
          notes,
        },
      });

      const newPaidAmount = invoice.paidAmount + parseFloat(amount);
      const newDueAmount = invoice.totalAmount - newPaidAmount;
      let newStatus = 'unpaid';
      if (newDueAmount <= 0) newStatus = 'paid';
      else if (newPaidAmount > 0) newStatus = 'partial';

      await tx.invoice.update({
        where: { id: parseInt(invoiceId) },
        data: {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          paymentStatus: newStatus,
        },
      });

      return newPayment;
    });

    res.status(201).json({ message: 'Payment recorded successfully', payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all payments
const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { invoice: { include: { customer: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPayment, getPayments };