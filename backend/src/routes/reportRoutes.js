const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getPurchaseReport,
  getLowStockReport,
  getPendingPaymentsReport,
  getCustomerWiseSales,
  getProductWiseSales,
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/sales', protect, getSalesReport);
router.get('/purchases', protect, getPurchaseReport);
router.get('/low-stock', protect, getLowStockReport);
router.get('/pending-payments', protect, getPendingPaymentsReport);
router.get('/customer-wise', protect, getCustomerWiseSales);
router.get('/product-wise', protect, getProductWiseSales);

module.exports = router;