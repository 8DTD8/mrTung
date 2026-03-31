const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { userValidation } = require('../middleware/validation');
const { checkAuth } = require('../middleware/auth');

router.post('/register', userValidation.register, authController.register);
router.post('/login', userValidation.login, authController.login);
router.get('/me', checkAuth, authController.getProfile);
router.post('/logout', checkAuth, authController.logout);

module.exports = router;
