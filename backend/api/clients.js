// backend/api/clients.js
const express = require('express');
const app = express();
const clientController = require('../src/controllers/clientController');
const { authenticateAdmin, validateFields } = require('../src/middleware/auth');
const { corsHeaders } = require('./_shared/cors');

// Middleware
app.use(express.json());

// Apply CORS for all requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
  res.setHeader('Access-Control-Max-Age', corsHeaders['Access-Control-Max-Age']);
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Routes
app.get('/', authenticateAdmin, clientController.getAllClients);
app.get('/analytics', authenticateAdmin, clientController.getClientAnalytics);
app.get('/:id', authenticateAdmin, clientController.getClientById);
app.post('/', authenticateAdmin, validateFields(['phone_number']), clientController.createClient);
app.put('/:id', authenticateAdmin, clientController.updateClient);
app.delete('/:id', authenticateAdmin, clientController.deleteClient);

// Export for Vercel
module.exports = (req, res) => {
  app(req, res);
};
