const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { checkAuth, checkAdmin } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validation');

router.get('/my-orders', checkAuth, orderController.getMyOrders);
router.post('/', checkAuth, orderValidation.create, orderController.create);
router.post('/:id/cancel', checkAuth, orderController.cancel);

router.get('/', checkAuth, checkAdmin, orderController.getAll);
router.get('/:id', checkAuth, checkAdmin, orderController.getById);
router.put('/:id/status', checkAuth, checkAdmin, orderController.updateStatus);

module.exports = router;
