let express = require('express');
let router = express.Router();
let supplierController = require('../controllers/suppliers');
let { checkAuth, checkAdmin } = require('../utils/authHandler');

router.get('/', checkAuth, checkAdmin, async function (req, res, next) {
    try {
        let { page = 0, size = 10, active, search } = req.query;
        let result = await supplierController.getAll(page, size, active, search);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', checkAuth, checkAdmin, async function (req, res, next) {
    try {
        let supplier = await supplierController.getById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', checkAuth, checkAdmin, async function (req, res, next) {
    try {
        let supplier = await supplierController.create(req.body);
        res.status(201).json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', checkAuth, checkAdmin, async function (req, res, next) {
    try {
        let supplier = await supplierController.update(req.params.id, req.body);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id/toggle-active', checkAuth, checkAdmin, async function (req, res, next) {
    try {
        let supplier = await supplierController.toggleActive(req.params.id);
        res.json(supplier);
    } catch (error) {
        if (error.message === 'Supplier not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', checkAuth, checkAdmin, async function (req, res, next) {
    try {
        let supplier = await supplierController.delete(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
