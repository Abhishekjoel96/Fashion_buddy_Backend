require('dotenv').config();
const whatsappController = require('../../src/controllers/whatsappController');
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle Twilio webhook
app.post('/', whatsappController.handleWhatsAppWebhook);

// Export for Vercel
module.exports = (req, res) => {
  app(req, res);
};