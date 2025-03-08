// backend/api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const apiRoutes = require('../src/routes/apiRoutes');
const { errorHandler, notFound } = require('../src/middleware/errorHandler');
const { corsHeaders } = require('./_shared/cors');

const app = express();

app.use(helmet());
app.use(cors());
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

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  app(req, res);
};
