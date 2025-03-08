// backend/api/clients.js
require('dotenv').config();
const express = require('express');
const app = express();
const clientController = require('../src/controllers/clientController');
const { authenticateAdmin, validateFields } = require('../src/middleware/auth');
const { corsHeaders } = require('./_shared/cors');

// Middleware
app.use(express.json());

// Routes
app.get('/', authenticateAdmin, clientController.getAllClients);
app.get('/analytics', authenticateAdmin, clientController.getClientAnalytics);
app.get('/:id', authenticateAdmin, clientController.getClientById);
app.post('/', authenticateAdmin, validateFields(['phone_number']), clientController.createClient);
app.put('/:id', authenticateAdmin, clientController.updateClient);
app.delete('/:id', authenticateAdmin, clientController.deleteClient);

// For Vercel - main handler function
module.exports = (req, res) => {
  // Handle OPTIONS directly for preflight requests
  if (req.method === 'OPTIONS') {
    // Send correct headers and status 204
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  
  // Forward to Express app for non-OPTIONS requests
  app(req, res);
};
