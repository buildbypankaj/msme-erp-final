const prisma = require('../utils/prisma');

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({ products: [], customers: [], invoices: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceNumber: { contains: q, mode: 'insensitive' },
      },
      include: { customer: true },
      take: 5,
    });

    res.status(200).json({ products, customers, invoices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { globalSearch };