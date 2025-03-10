// backend/api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const apiRoutes = require('../src/routes/apiRoutes');
const { errorHandler, notFound } = require('../src/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: 'https://fashion-buddy-chat.vercel.app',
  methods: ['GET', 'POST', PUT, 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'WhatsApp AI Fashion Buddy API',
    status: 'active',
    version: '1.0.0'
  });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

// Export for Vercel
module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    // CORS handling
    res.setHeader('Access-Control-Allow-Origin', 'https://fashion-buddy-chat.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).end();
    return;
  }
  app(req, res);
};
