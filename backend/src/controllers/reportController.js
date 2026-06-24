const prisma = require('../utils/prisma');

// Sales report with date range
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.invoiceDate = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { invoiceDate: 'desc' },
    });

    const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalDue = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);

    res.status(200).json({ invoices, totalSales, totalCollected, totalDue, count: invoices.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Purchase report with date range
const getPurchaseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.purchaseDate = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { purchaseDate: 'desc' },
    });

    const totalPurchase = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

    res.status(200).json({ purchases, totalPurchase, count: purchases.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Low stock report
const getLowStockReport = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
    });

    const lowStock = products.filter((p) => p.currentStock <= p.minStock);

    res.status(200).json(lowStock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Pending payments report
const getPendingPaymentsReport = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { dueAmount: { gt: 0 } },
      include: { customer: true },
      orderBy: { dueAmount: 'desc' },
    });

    const totalPending = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);

    res.status(200).json({ invoices, totalPending, count: invoices.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Customer-wise sales report
const getCustomerWiseSales = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { invoices: true },
    });

    const report = customers
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        totalInvoices: c.invoices.length,
        totalSpent: c.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        totalDue: c.invoices.reduce((sum, inv) => sum + inv.dueAmount, 0),
      }))
      .filter((c) => c.totalInvoices > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent);

    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Product-wise sales report
const getProductWiseSales = async (req, res) => {
  try {
    const items = await prisma.invoiceItem.findMany({
      include: { product: true },
    });

    const grouped = {};
    items.forEach((item) => {
      const key = item.productId;
      if (!grouped[key]) {
        grouped[key] = {
          productId: key,
          name: item.product.name,
          sku: item.product.sku,
          totalQuantitySold: 0,
          totalRevenue: 0,
        };
      }
      grouped[key].totalQuantitySold += item.quantity;
      grouped[key].totalRevenue += item.quantity * item.price;
    });

    const report = Object.values(grouped).sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSalesReport,
  getPurchaseReport,
  getLowStockReport,
  getPendingPaymentsReport,
  getCustomerWiseSales,
  getProductWiseSales,
};