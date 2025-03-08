// backend/api/virtual-tryon.js
require('dotenv').config();
const express = require('express');
const app = express();
const virtualTryOnController = require('../src/controllers/virtualTryOnController');
const { validateFields } = require('../src/middleware/auth');
const { corsHeaders } = require('./_shared/cors');

app.use(express.json({ limit: '50mb' }));
app.post('/try-on', validateFields(['userId', 'sessionId', 'bodyImage']), virtualTryOnController.performVirtualTryOn);
app.get('/session/:sessionId', virtualTryOnController.getTryOnResultsBySession);

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  app(req, res);
};
