// backend/api/color-analysis.js
require('dotenv').config();
const express = require('express');
const app = express();
const colorAnalysisController = require('../src/controllers/colorAnalysisController');
const { authenticateAdmin, validateFields } = require('../src/middleware/auth');

// Middleware
app.use(express.json({ limit: '50mb' }));

// Routes
app.post('/analyze', validateFields(['userId', 'sessionId', 'images']), colorAnalysisController.analyzeColors);
app.get('/session/:sessionId', colorAnalysisController.getColorAnalysis);
app.get('/', authenticateAdmin, colorAnalysisController.getAllColorAnalyses);

// Export for Vercel
module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://fashion-buddy-chat.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).end();
    return;
  }
  app(req, res);
};
