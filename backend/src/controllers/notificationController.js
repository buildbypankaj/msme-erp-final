const prisma = require('../utils/prisma');

const getNotifications = async (req, res) => {
  try {
    const notifications = [];

    // Low stock products
    const products = await prisma.product.findMany({ where: { isActive: true } });
    const lowStock = products.filter((p) => p.currentStock <= p.minStock);
    lowStock.forEach((p) => {
      notifications.push({
        id: `stock-${p.id}`,
        type: 'low_stock',
        message: `${p.name} is low on stock (${p.currentStock} left)`,
        createdAt: p.updatedAt,
      });
    });

    // Pending payments
    const dueInvoices = await prisma.invoice.findMany({
      where: { dueAmount: { gt: 0 } },
      include: { customer: true },
      take: 10,
    });
    dueInvoices.forEach((inv) => {
      notifications.push({
        id: `due-${inv.id}`,
        type: 'pending_payment',
        message: `₹${inv.dueAmount} due from ${inv.customer.name} (${inv.invoiceNumber})`,
        createdAt: inv.updatedAt,
      });
    });

    // Pending user approvals (only for admin)
    if (req.user.role === 'admin') {
      const pendingUsers = await prisma.user.findMany({
        where: { isVerified: true, isApproved: false, approvalStatus: 'pending' },
      });
      pendingUsers.forEach((u) => {
        notifications.push({
          id: `user-${u.id}`,
          type: 'pending_user',
          message: `New user "${u.name}" is waiting for approval`,
          createdAt: u.createdAt,
        });
      });
    }

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ notifications, count: notifications.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getNotifications };