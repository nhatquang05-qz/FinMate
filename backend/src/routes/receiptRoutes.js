const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

// Route: POST /api/receipts/scan
router.post('/scan', receiptController.scanReceipt);

module.exports = router;