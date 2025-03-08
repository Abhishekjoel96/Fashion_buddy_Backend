// backend/api/clients.js
require('dotenv').config();
const express = require('express');
const { authenticateAdmin, validateFields } = require('../src/middleware/auth');
const clientController = require('../src/controllers/clientController');
const { corsHeaders } = require('./_shared/cors');

const app = express();

// Middleware
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
  res.setHeader('Access-Control-Max-Age', corsHeaders['Access-Control-Max-Age']);
  next();
});

// Routes
app.get('/', authenticateAdmin, clientController.getAllClients);
app.get('/analytics', authenticateAdmin, clientController.getClientAnalytics);
app.get('/:id', authenticateAdmin, clientController.getClientById);
app.post('/', authenticateAdmin, validateFields(['phone_number']), clientController.createClient);
app.put('/:id', authenticateAdmin, clientController.updateClient);
app.delete('/:id', authenticateAdmin, clientController.deleteClient);

// OPTIONS Handling in the middleware.
app.options('*', (req, res) => {
  res.status(204).end();
});

// Vercel handler
module.exports = (req, res) => {
  app(req, res);
};
