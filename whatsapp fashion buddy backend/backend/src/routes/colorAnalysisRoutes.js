const express = require('express');
const router = express.Router();
const colorAnalysisController = require('../controllers/colorAnalysisController');
const { authenticateAdmin, validateFields } = require('../middleware/auth');

// Analyze colors from uploaded images
router.post(
  '/analyze', 
  validateFields(['userId', 'sessionId', 'images']), 
  colorAnalysisController.analyzeColors
);

// Get color analysis result by session ID
router.get(
  '/session/:sessionId', 
  colorAnalysisController.getColorAnalysis
);

// Get all color analyses (admin only)
router.get(
  '/', 
  authenticateAdmin, 
  colorAnalysisController.getAllColorAnalyses
);

module.exports = router;