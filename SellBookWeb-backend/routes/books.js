const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { checkAuth, checkAdmin } = require('../middleware/auth');
const { bookValidation } = require('../middleware/validation');

router.get('/', bookController.getAll);
router.get('/search', bookController.search);
router.get('/category/:categoryId', bookController.getByCategory);
router.get('/:id', bookController.getById);

router.post('/', checkAuth, checkAdmin, bookValidation.create, bookController.create);
router.put('/:id', checkAuth, checkAdmin, bookController.update);
router.delete('/:id', checkAuth, checkAdmin, bookController.delete);

module.exports = router;
