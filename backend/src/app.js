const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const apiRoutes = require('./routes/apiRoutes');
const { errorHandler, notFound, requestLogger } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// CORS configuration for Vercel deployment
const corsOptions = {
  origin: 'https://fashion-buddy-chat.vercel.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-client-info', 'apikey']
};

// Apply global middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // Enable CORS with specific options
app.use(compression()); // Compress responses
app.use(express.json({ limit: '50mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded request bodies

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Detailed logger for development
} else {
  app.use(morgan('combined')); // Standard Apache combined log format for production
}

// Custom request logger
app.use(requestLogger);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'WhatsApp AI Fashion Buddy API',
    status: 'active',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Handle 404 Not Found
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
