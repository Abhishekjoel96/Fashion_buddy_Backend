require('dotenv').config();
const express = require('express');
const app = express();
const clientController = require('../src/controllers/clientController');
const { authenticateAdmin, validateFields } = require('../src/middleware/auth');

// Middleware
app.use(express.json());

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

// Export the Express API
module.exports = app;

// For Vercel
module.exports = (req, res) => {
  app(req, res);
};