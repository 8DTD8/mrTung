const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { checkAuth } = require('../middleware/auth');

router.get('/', checkAuth, cartController.getMyCart);
router.post('/items', checkAuth, cartController.addItem);
router.put('/items/:bookId', checkAuth, cartController.updateItem);
router.delete('/items/:bookId', checkAuth, cartController.removeItem);
router.delete('/', checkAuth, cartController.clearCart);

module.exports = router;
