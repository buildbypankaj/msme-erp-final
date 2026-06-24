const prisma = require('../utils/prisma');

// CREATE purchase (and increase stock)
const createPurchase = async (req, res) => {
  try {
    const { supplierId, items, paymentStatus } = req.body;
    // items = [{ productId, quantity, price }]

    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Supplier and at least one item are required' });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const purchase = await prisma.$transaction(async (tx) => {
      const newPurchase = await tx.purchase.create({
        data: {
          supplierId: parseInt(supplierId),
          totalAmount,
          paymentStatus: paymentStatus || 'unpaid',
          items: {
            create: items.map((item) => ({
              productId: parseInt(item.productId),
              quantity: parseInt(item.quantity),
              price: parseFloat(item.price),
            })),
          },
        },
        include: { items: true, supplier: true },
      });

      // Increase stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: parseInt(item.productId) },
          data: { currentStock: { increment: parseInt(item.quantity) } },
        });
      }

      return newPurchase;
    });

    res.status(201).json({ message: 'Purchase recorded and stock updated', purchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all purchases
const getPurchases = async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(purchases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single purchase
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt(id) },
      include: { supplier: true, items: { include: { product: true } } },
    });

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.status(200).json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPurchase, getPurchases, getPurchaseById };