const prisma = require('../utils/prisma');

// GET settings (creates default if none exist)
const getSettings = async (req, res) => {
  try {
    let settings = await prisma.businessSettings.findFirst();

    if (!settings) {
      settings = await prisma.businessSettings.create({ data: {} });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE settings
const updateSettings = async (req, res) => {
  try {
    const { businessName, address, phone, email, gstNumber, currency, invoicePrefix, defaultTaxRate, lowStockAlert } = req.body;

    let settings = await prisma.businessSettings.findFirst();

    if (!settings) {
      settings = await prisma.businessSettings.create({
        data: { businessName, address, phone, email, gstNumber, currency, invoicePrefix, defaultTaxRate: parseFloat(defaultTaxRate) || 0, lowStockAlert: parseInt(lowStockAlert) || 5 },
      });
    } else {
      settings = await prisma.businessSettings.update({
        where: { id: settings.id },
        data: { businessName, address, phone, email, gstNumber, currency, invoicePrefix, defaultTaxRate: parseFloat(defaultTaxRate) || 0, lowStockAlert: parseInt(lowStockAlert) || 5 },
      });
    }

    res.status(200).json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSettings, updateSettings };