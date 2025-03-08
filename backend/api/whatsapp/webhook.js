// backend/api/whatsapp/webhook.js
require('dotenv').config();
const whatsappController = require('../../src/controllers/whatsappController');
const express = require('express');
const app = express();
const { corsHeaders } = require('../_shared/cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/', whatsappController.handleWhatsAppWebhook);

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  app(req, res);
};
