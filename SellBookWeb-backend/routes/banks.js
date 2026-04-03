let express = require('express');
let router = express.Router();
let bankController = require('../controllers/banks');
let { checkLogin, checkAdmin } = require('../utils/authHandler');
let multer = require('multer');
let path = require('path');


let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        let uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

let upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        let filetypes = /jpeg|jpg|png|gif|webp/;
        let mimetype = filetypes.test(file.mimetype);
        let extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file ảnh: jpeg, jpg, png, gif, webp'));
    }
});


router.get('/', async function (req, res, next) {
    try {
        let { active } = req.query;
        let banks = await bankController.getAll(active === 'true' ? true : undefined);
        res.json(banks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async function (req, res, next) {
    try {
        let bank = await bankController.getById(req.params.id);
        if (!bank) {
            return res.status(404).json({ message: 'Bank not found' });
        }
        res.json(bank);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/', checkLogin, checkAdmin, upload.fields([{ name: 'bankLogo', maxCount: 1 }, { name: 'qrCode', maxCount: 1 }]), async function (req, res, next) {
    try {
        let bankData = {
            bankName: req.body.bankName,
            accountNumber: req.body.accountNumber,
            accountHolder: req.body.accountHolder,
            active: req.body.active === 'true' || req.body.active === true
        };

        
        if (req.files) {
            if (req.files.bankLogo) {
                bankData.bankLogo = '/uploads/' + req.files.bankLogo[0].filename;
            }
            if (req.files.qrCode) {
                bankData.qrCode = '/uploads/' + req.files.qrCode[0].filename;
            }
        }

        let bank = await bankController.create(bankData);
        res.status(201).json(bank);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', checkLogin, checkAdmin, upload.fields([{ name: 'bankLogo', maxCount: 1 }, { name: 'qrCode', maxCount: 1 }]), async function (req, res, next) {
    try {
        let bankData = {
            bankName: req.body.bankName,
            accountNumber: req.body.accountNumber,
            accountHolder: req.body.accountHolder,
            active: req.body.active === 'true' || req.body.active === true
        };

        if (req.files) {
            if (req.files.bankLogo) {
                bankData.bankLogo = '/uploads/' + req.files.bankLogo[0].filename;
            }
            if (req.files.qrCode) {
                bankData.qrCode = '/uploads/' + req.files.qrCode[0].filename;
            }
        }

        let bank = await bankController.update(req.params.id, bankData);
        if (!bank) {
            return res.status(404).json({ message: 'Bank not found' });
        }
        res.json(bank);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id/toggle-active', checkLogin, checkAdmin, async function (req, res, next) {
    try {
        let bank = await bankController.toggleActive(req.params.id);
        res.json(bank);
    } catch (error) {
        if (error.message === 'Bank not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', checkLogin, checkAdmin, async function (req, res, next) {
    try {
        let bank = await bankController.delete(req.params.id);
        if (!bank) {
            return res.status(404).json({ message: 'Bank not found' });
        }
        res.json({ message: 'Bank deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
