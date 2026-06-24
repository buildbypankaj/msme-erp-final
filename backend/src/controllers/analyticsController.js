const prisma = require('../utils/prisma');

const getAnalytics = async (req, res) => {
  try {
    // Last 7 days sales trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentInvoices = await prisma.invoice.findMany({
      where: { invoiceDate: { gte: sevenDaysAgo } },
    });

    const salesByDay = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      salesByDay[key] = 0;
    }

    recentInvoices.forEach((inv) => {
      const key = new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (salesByDay[key] !== undefined) {
        salesByDay[key] += inv.totalAmount;
      }
    });

    const salesTrend = Object.entries(salesByDay).map(([date, amount]) => ({ date, amount }));

    // Top 5 selling products
    const items = await prisma.invoiceItem.findMany({ include: { product: true } });
    const productMap = {};
    items.forEach((item) => {
      const key = item.product.name;
      if (!productMap[key]) productMap[key] = 0;
      productMap[key] += item.quantity * item.price;
    });
    const topProducts = Object.entries(productMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category-wise sales
    const itemsWithCategory = await prisma.invoiceItem.findMany({
      include: { product: { include: { category: true } } },
    });
    const categoryMap = {};
    itemsWithCategory.forEach((item) => {
      const key = item.product.category?.name || 'Uncategorized';
      if (!categoryMap[key]) categoryMap[key] = 0;
      categoryMap[key] += item.quantity * item.price;
    });
    const categorySales = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Top 5 customers
    const customers = await prisma.customer.findMany({ include: { invoices: true } });
    const topCustomers = customers
      .map((c) => ({ name: c.name, total: c.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Profit estimate (selling - purchase price for sold items)
    const profitItems = await prisma.invoiceItem.findMany({ include: { product: true } });
    let totalRevenue = 0;
    let totalCost = 0;
    profitItems.forEach((item) => {
      totalRevenue += item.quantity * item.price;
      totalCost += item.quantity * item.product.purchasePrice;
    });
    const estimatedProfit = totalRevenue - totalCost;

    res.status(200).json({
      salesTrend,
      topProducts,
      categorySales,
      topCustomers,
      estimatedProfit,
      totalRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAnalytics };