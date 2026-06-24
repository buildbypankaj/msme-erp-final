const generateInvoicePDF = require('../utils/generateInvoicePDF');
const prisma = require('../utils/prisma');

// Generate invoice number like INV-0001
const generateInvoiceNumber = async () => {
  const count = await prisma.invoice.count();
  return `INV-${String(count + 1).padStart(4, '0')}`;
};

// CREATE invoice (and decrease stock)
const createInvoice = async (req, res) => {
  try {
    const { customerId, items, discount, paidAmount } = req.body;
    // items = [{ productId, quantity, price }]

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Customer and at least one item are required' });
    }

    // Check stock availability before proceeding
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: parseInt(item.productId) } });
      if (!product) {
        return res.status(404).json({ message: `Product not found` });
      }
      if (product.currentStock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}` });
      }
    }

    const subTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const totalAmount = subTotal - (discount || 0);
    const paid = paidAmount || 0;
    const dueAmount = totalAmount - paid;

    let paymentStatus = 'unpaid';
    if (paid >= totalAmount) paymentStatus = 'paid';
    else if (paid > 0) paymentStatus = 'partial';

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: parseInt(customerId),
          totalAmount,
          discount: discount || 0,
          paidAmount: paid,
          dueAmount,
          paymentStatus,
          items: {
            create: items.map((item) => ({
              productId: parseInt(item.productId),
              quantity: parseInt(item.quantity),
              price: parseFloat(item.price),
            })),
          },
        },
        include: { items: true, customer: true },
      });

      // Decrease stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: parseInt(item.productId) },
          data: { currentStock: { decrement: parseInt(item.quantity) } },
        });
      }

      return newInvoice;
    });

    res.status(201).json({ message: 'Invoice created and stock updated', invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single invoice
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { customer: true, items: { include: { product: true } } },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// DOWNLOAD invoice as PDF
const downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { customer: true, items: { include: { product: true } } },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    generateInvoicePDF(invoice, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { createInvoice, getInvoices, getInvoiceById, downloadInvoicePDF };