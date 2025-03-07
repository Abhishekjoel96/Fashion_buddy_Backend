
require('dotenv').config();
const express = require('express');
const app = express();
const virtualTryOnController = require('../src/controllers/virtualTryOnController');
const { validateFields } = require('../src/middleware/auth');

// Middleware
app.use(express.json({ limit: '50mb' }));

// Perform virtual try-on
app.post(
  '/try-on', 
  validateFields(['userId', 'sessionId', 'bodyImage']), 
  virtualTryOnController.performVirtualTryOn
);

// Get virtual try-on results by session
app.get(
  '/session/:sessionId', 
  virtualTryOnController.getTryOnResultsBySession
);

// Export for Vercel
module.exports = (req, res) => {
  app(req, res);
};
