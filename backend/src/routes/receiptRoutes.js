const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

router.post('/scan', receiptController.scanReceipt);

module.exports = router;
