const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticateAdmin, validateFields } = require('../middleware/auth');

// Get all clients with analytics data
router.get('/', authenticateAdmin, clientController.getAllClients);

// Get analytics data
router.get('/analytics', authenticateAdmin, clientController.getClientAnalytics);

// Get client by ID
router.get('/:id', authenticateAdmin, clientController.getClientById);

// Create new client and initiate conversation
router.post(
  '/', 
  authenticateAdmin, 
  validateFields(['phone_number']), 
  clientController.createClient
);

// Update client details
router.put(
  '/:id', 
  authenticateAdmin, 
  clientController.updateClient
);

// Delete client
router.delete(
  '/:id', 
  authenticateAdmin, 
  clientController.deleteClient
);

module.exports = router;