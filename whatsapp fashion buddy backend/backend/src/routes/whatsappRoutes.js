const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { authenticateAdmin, validateFields } = require('../middleware/auth');

// Handle incoming Twilio webhook
router.post('/webhook', whatsappController.handleWhatsAppWebhook);

// Manually send a message (used by dashboard)
router.post(
  '/send', 
  authenticateAdmin, 
  validateFields(['to', 'message']), 
  whatsappController.sendMessage
);

// Manually send an image (used by dashboard)
router.post(
  '/send-image', 
  authenticateAdmin, 
  validateFields(['to', 'imageUrl']), 
  whatsappController.sendImage
);

module.exports = router;