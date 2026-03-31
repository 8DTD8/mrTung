const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { checkAuth, checkAdmin } = require('../middleware/auth');

router.get('/', categoryController.getAll);

router.get('/admin/all', checkAuth, checkAdmin, categoryController.getAllAdmin);
router.get('/:id', categoryController.getById);
router.post('/', checkAuth, checkAdmin, categoryController.create);
router.put('/:id', checkAuth, checkAdmin, categoryController.update);
router.delete('/:id', checkAuth, checkAdmin, categoryController.delete);

module.exports = router;
