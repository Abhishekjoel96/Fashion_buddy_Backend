// backend/api/clients.js
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

// Export for Vercel - Add OPTIONS handling
module.exports = (req, res) => {
  // CRITICAL FIX: Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  app(req, res);
};
