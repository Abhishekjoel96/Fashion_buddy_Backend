const express = require('express');
const router = express.Router();

// Import other route files
const clientRoutes = require('./clientRoutes');
const whatsappRoutes = require('./whatsappRoutes');
const colorAnalysisRoutes = require('./colorAnalysisRoutes');
const virtualTryOnRoutes = require('./virtualTryOnRoutes');

// Mount routes
router.use('/clients', clientRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/color-analysis', colorAnalysisRoutes);
router.use('/virtual-tryon', virtualTryOnRoutes);

// Basic health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;