const prisma = require('../utils/prisma');

const getDashboardSummary = async (req, res) => {
  try {
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalCustomers = await prisma.customer.count({ where: { isActive: true } });
    const totalSuppliers = await prisma.supplier.count({ where: { isActive: true } });

    // Today's sales
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayInvoices = await prisma.invoice.findMany({
      where: { invoiceDate: { gte: startOfDay, lte: endOfDay } },
    });
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Pending payments (sum of dueAmount across all invoices)
    const allInvoices = await prisma.invoice.findMany();
    const pendingPayments = allInvoices.reduce((sum, inv) => sum + inv.dueAmount, 0);

    // Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: { isActive: true },
    });
    const lowStockCount = lowStockProducts.filter((p) => p.currentStock <= p.minStock).length;

    // Recent invoices count
    const totalInvoices = await prisma.invoice.count();

    // Recent invoices list (latest 5)
    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });

    res.status(200).json({
      totalProducts,
      totalCustomers,
      totalSuppliers,
      todaySales,
      pendingPayments,
      lowStockCount,
      totalInvoices,
      recentInvoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardSummary };
