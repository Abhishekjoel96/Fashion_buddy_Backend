// backend/api/clients.js
require('dotenv').config();
const express = require('express');
const app = express();
const clientController = require('../src/controllers/clientController');
const { authenticateAdmin, validateFields } = require('../src/middleware/auth');

// Import CORS headers - create this folder and file
const { corsHeaders } = require('./_shared/cors');

// Middleware
app.use(express.json());

// Handle OPTIONS preflight requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://fashion-buddy-chat.vercel.app/');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Get all clients with analytics data
app.get('/', authenticateAdmin, clientController.getAllClients);

// Get analytics data
app.get('/analytics', authenticateAdmin, clientController.getClientAnalytics);

// Get client by ID
app.get('/:id', authenticateAdmin, clientController.getClientById);

// Create new client and initiate conversation
app.post(
  '/', 
  authenticateAdmin, 
  validateFields(['phone_number']), 
  clientController.createClient
);

// Update client details
app.put(
  '/:id', 
  authenticateAdmin, 
  clientController.updateClient
);

// Delete client
app.delete(
  '/:id', 
  authenticateAdmin, 
  clientController.deleteClient
);

// For Vercel - main handler function
module.exports = (req, res) => {
  // Handle OPTIONS directly for preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  
  // Forward to Express app
  app(req, res);
};
