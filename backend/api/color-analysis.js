require('dotenv').config();
const express = require('express');
const app = express();
const colorAnalysisController = require('../src/controllers/colorAnalysisController');
const { authenticateAdmin, validateFields } = require('../src/middleware/auth');

// Middleware
app.use(express.json({ limit: '50mb' }));

// Analyze colors from uploaded images
app.post(
  '/analyze', 
  validateFields(['userId', 'sessionId', 'images']), 
  colorAnalysisController.analyzeColors
);

// Get color analysis result by session ID
app.get(
  '/session/:sessionId', 
  colorAnalysisController.getColorAnalysis
);

// Get all color analyses (admin only)
app.get(
  '/', 
  authenticateAdmin, 
  colorAnalysisController.getAllColorAnalyses
);

// Export for Vercel
module.exports = (req, res) => {
  app(req, res);
};