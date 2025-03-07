require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const apiRoutes = require('../src/routes/apiRoutes');
const { errorHandler, notFound } = require('../src/middleware/errorHandler');

// Create Express instance for Vercel
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'WhatsApp AI Fashion Buddy API',
    status: 'active',
    version: '1.0.0'
  });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export for Vercel
module.exports = app;

// Handle as serverless function
module.exports = (req, res) => {
  app(req, res);
};