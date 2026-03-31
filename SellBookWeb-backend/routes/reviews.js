const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { checkAuth, checkAdmin } = require('../middleware/auth');

router.get('/book/:bookId', reviewController.getByBook);
router.get('/user/:userId', checkAuth, reviewController.getByUser);
router.post('/', checkAuth, reviewController.create);
router.delete('/:id', checkAuth, reviewController.delete);

router.get('/admin/pending', checkAuth, checkAdmin, reviewController.getPending);
router.put('/:id/approve', checkAuth, checkAdmin, reviewController.approve);

module.exports = router;
