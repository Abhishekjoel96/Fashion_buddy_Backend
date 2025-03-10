// backend/api/clients.js
require('dotenv').config();
const express = require('express');
const app = express();
const clientController = require('../src/controllers/clientController');
const { authenticateAdmin, validateFields } = require('../src/middleware/auth');

// Middleware
app.use(express.json());

// Routes
app.get('/', authenticateAdmin, clientController.getAllClients);
app.get('/analytics', authenticateAdmin, clientController.getClientAnalytics);
app.get('/:id', authenticateAdmin, clientController.getClientById);
app.post('/', authenticateAdmin, validateFields(['phone_number']), clientController.createClient);
app.put('/:id', authenticateAdmin, clientController.updateClient);
app.delete('/:id', authenticateAdmin, clientController.deleteClient);

// Export for Vercel
module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://fashion-buddy-chat.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).end();
    return;
  }
  app(req, res);
};
