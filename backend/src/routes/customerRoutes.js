const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorize('admin', 'staff'), createCustomer);
router.get('/', protect, getCustomers);
router.get('/:id', protect, getCustomerById);
router.put('/:id', protect, authorize('admin', 'staff'), updateCustomer);
router.delete('/:id', protect, authorize('admin'), deleteCustomer);

module.exports = router;