// backend/api/color-analysis.js
require('dotenv').config();
const express = require('express');
const app = express();
const colorAnalysisController = require('../src/controllers/colorAnalysisController');
const { authenticateAdmin, validateFields } = require('../src/middleware/auth');
const { corsHeaders } = require('./_shared/cors');

app.use(express.json({ limit: '50mb' }));
app.post('/analyze', validateFields(['userId', 'sessionId', 'images']), colorAnalysisController.analyzeColors);
app.get('/session/:sessionId', colorAnalysisController.getColorAnalysis);
app.get('/', authenticateAdmin, colorAnalysisController.getAllColorAnalyses);

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  app(req, res);
};
