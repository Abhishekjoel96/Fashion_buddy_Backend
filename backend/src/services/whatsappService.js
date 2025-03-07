const { client, whatsappNumber } = require('../config/twilio');
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const { processWhatsAppMessage } = require('./aiService');

/**
 * Send a message to a WhatsApp number
 */
const sendWhatsAppMessage = async (to, message) => {
  try {
    // Format the number for WhatsApp (Twilio requires whatsapp: prefix)
    const formattedNumber = formatWhatsAppNumber(to);
    
    const response = await client.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to: formattedNumber,
      body: message
    });
    
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

/**
 * Send an image to a WhatsApp number
 */
const sendWhatsAppImage = async (to, imageUrl, caption = '') => {
  try {
    // Format the number for WhatsApp
    const formattedNumber = formatWhatsAppNumber(to);
    
    const response = await client.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to: formattedNumber,
      body: caption,
      mediaUrl: [imageUrl]
    });
    
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp image:', error);
    throw error;
  }
};

/**
 * Process incoming WhatsApp webhook
 */
const processIncomingMessage = async (body) => {
  try {
    // Extract message details from Twilio webhook
    const message = extractMessageFromTwilioWebhook(body);
    
    if (!message) {
      return { error: 'Invalid message format' };
    }
    
    // Get or create user
    let user = await userModel.getUserByPhone(message.from);
    
    if (!user) {
      user = await userModel.createUser(message.from);
    }
    
    // Update last active timestamp
    await userModel.updateUser(user.id, { last_active: new Date().toISOString() });
    
    // Get active session or create new one
    let session = await sessionModel.getActiveSessionByUser(user.id);
    
    if (!session) {
      session = await sessionModel.createSession(user.id, 'new', 'active');
    }
    
    // Process message with AI
    const aiResponse = await processWhatsAppMessage(message, {
      session_type: session.session_type,
      status: session.status
    });
    
    // Update session if needed
    if (Object.keys(aiResponse.session_updates).length > 0) {
      await sessionModel.updateSessionStatus(
        session.id, 
        aiResponse.session_updates.status || session.status
      );
      
      if (aiResponse.session_updates.session_type && aiResponse.session_updates.session_type !== session.session_type) {
        // Create a new session with the updated type
        await sessionModel.updateSessionStatus(session.id, 'completed');
        session = await sessionModel.createSession(
          user.id, 
          aiResponse.session_updates.session_type, 
          'active'
        );
      }
    }
    
    // Send response back to user
    await sendWhatsAppMessage(message.from, aiResponse.reply);
    
    return { 
      success: true, 
      user, 
      session,
      message: aiResponse.reply
    };
  } catch (error) {
    console.error('Error processing incoming message:', error);
    throw error;
  }
};

/**
 * Extract message from Twilio webhook
 */
const extractMessageFromTwilioWebhook = (body) => {
  if (!body.From || !body.To) {
    return null;
  }
  
  // Strip 'whatsapp:' prefix
  const from = body.From.replace('whatsapp:', '');
  const to = body.To.replace('whatsapp:', '');
  
  // Determine message type and content
  if (body.Body) {
    return {
      from,
      to,
      type: 'text',
      text: body.Body
    };
  } else if (body.NumMedia && parseInt(body.NumMedia) > 0) {
    return {
      from,
      to,
      type: 'image',
      imageUrl: body.MediaUrl0,
      caption: body.Body || ''
    };
  }
  
  return null;
};

/**
 * Format WhatsApp number
 */
const formatWhatsAppNumber = (number) => {
  // Strip any non-numeric characters
  const cleaned = number.replace(/\D/g, '');
  
  // Ensure it has the proper format
  if (!cleaned.startsWith('whatsapp:')) {
    return `whatsapp:${cleaned}`;
  }
  
  return number;
};

/**
 * Initiate a conversation with a new client
 */
const initiateConversation = async (phoneNumber, name = null) => {
  try {
    // Get or create user
    let user = await userModel.getUserByPhone(phoneNumber);
    
    if (!user) {
      user = await userModel.createUser(phoneNumber, name);
    } else if (name && !user.name) {
      // Update name if it wasn't set before
      user = await userModel.updateUser(user.id, { name });
    }
    
    // Create a new welcome session
    const session = await sessionModel.createSession(user.id, 'welcome', 'active');
    
    // Send welcome message
    const welcomeMessage = `👋 Hello${name ? ' ' + name : ''}! Welcome to WhatsApp Fashion Buddy!\n\nI can help you find clothes that match your skin tone or try on clothes virtually. What would you like to do today?\n\n1️⃣ Color Analysis & Shopping Recommendations\n2️⃣ Virtual Try-On\n\nReply with 1 or 2 to get started.`;
    
    await sendWhatsAppMessage(phoneNumber, welcomeMessage);
    
    return { success: true, user, session };
  } catch (error) {
    console.error('Error initiating conversation:', error);
    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppImage,
  processIncomingMessage,
  initiateConversation
};