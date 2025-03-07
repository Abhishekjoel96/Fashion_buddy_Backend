const whatsappService = require('../services/whatsappService');

/**
 * Handle incoming WhatsApp webhook
 */
const handleWhatsAppWebhook = async (req, res) => {
  try {
    // Process the incoming Twilio webhook
    const result = await whatsappService.processIncomingMessage(req.body);
    
    // Send a TwiML response
    res.header('Content-Type', 'text/xml');
    res.send('<Response></Response>');
  } catch (error) {
    console.error('Error handling WhatsApp webhook:', error);
    // Still send a 200 response to acknowledge receipt
    res.header('Content-Type', 'text/xml');
    res.send('<Response></Response>');
  }
};

/**
 * Send a WhatsApp message to a user
 */
const sendMessage = async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both to and message fields'
      });
    }
    
    const result = await whatsappService.sendWhatsAppMessage(to, message);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Send a WhatsApp image to a user
 */
const sendImage = async (req, res) => {
  try {
    const { to, imageUrl, caption } = req.body;
    
    if (!to || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both to and imageUrl fields'
      });
    }
    
    const result = await whatsappService.sendWhatsAppImage(to, imageUrl, caption || '');
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error sending WhatsApp image:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  handleWhatsAppWebhook,
  sendMessage,
  sendImage
};