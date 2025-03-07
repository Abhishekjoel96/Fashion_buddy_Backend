const express = require('express');
const router = express.Router();
const virtualTryOnController = require('../controllers/virtualTryOnController');
const { validateFields } = require('../middleware/auth');

// Perform virtual try-on
router.post(
  '/try-on', 
  validateFields(['userId', 'sessionId', 'bodyImage']), 
  virtualTryOnController.performVirtualTryOn
);

// Get virtual try-on results by session
router.get(
  '/session/:sessionId', 
  virtualTryOnController.getTryOnResultsBySession
);

module.exports = router;