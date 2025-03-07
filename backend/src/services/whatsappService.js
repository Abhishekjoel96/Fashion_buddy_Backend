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
 * Send a WhatsApp message with interactive options
 */
const sendWhatsAppInteractiveMessage = async (to, message, options) => {
  try {
    // Format the number for WhatsApp
    const formattedNumber = formatWhatsAppNumber(to);
    
    // Format the message with options as a list
    let formattedMessage = message + '\n\n';
    
    // Add options in a numbered list
    options.forEach((option, index) => {
      formattedMessage += `${index + 1}️⃣ ${option}\n`;
    });
    
    const response = await client.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to: formattedNumber,
      body: formattedMessage
    });
    
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp interactive message:', error);
    throw error;
  }
};

/**
 * Create a message with quick reply buttons as text
 */
const createQuickReplyMessage = (message, quickReplies) => {
  let fullMessage = message + '\n\n';
  
  // Add quick reply options
  quickReplies.forEach((reply, index) => {
    // Use emoji number indicators
    const emoji = getNumberEmoji(index + 1);
    fullMessage += `${emoji} ${reply}\n`;
  });
  
  return fullMessage;
};

/**
 * Get number emoji for options
 */
const getNumberEmoji = (number) => {
  const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  
  if (number >= 1 && number <= 10) {
    return numberEmojis[number - 1];
  }
  
  return number.toString();
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
    
    // Check if this is a button selection (options are usually just numbers 1, 2, etc.)
    const isOptionSelection = /^[1-9]$/.test(message.text.trim());
    
    // If this is an option selection, translate it to what the option means
    if (isOptionSelection && message.type === 'text') {
      const optionNumber = parseInt(message.text.trim());
      
      // Depending on the current session, map the number to an action
      if (session.session_type === 'welcome' || session.session_type === 'new') {
        if (optionNumber === 1) {
          message.text = "I want Color Analysis & Shopping Recommendations";
          message.isOptionSelection = true;
          message.selectedOption = 1;
        } else if (optionNumber === 2) {
          message.text = "I want Virtual Try-On";
          message.isOptionSelection = true;
          message.selectedOption = 2;
        }
      } else if (session.session_type === 'color_analysis') {
        // Handle options for color analysis session
        if (optionNumber === 1) {
          message.text = "Budget range ₹500-₹1500";
          message.isOptionSelection = true;
          message.selectedOption = 1;
        } else if (optionNumber === 2) {
          message.text = "Budget range ₹1500-₹3000";
          message.isOptionSelection = true;
          message.selectedOption = 2;
        } else if (optionNumber === 3) {
          message.text = "Budget range ₹3000+";
          message.isOptionSelection = true;
          message.selectedOption = 3;
        }
      } else if (session.session_type === 'virtual_tryon') {
        // Handle options for virtual try-on session
        // Map numbers to product selection, confirmation, etc.
      }
      // Add more mappings based on other session types and states
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
    
    // Check if the AI's response should include interactive options
    let responseMessage = aiResponse.reply;
    
    // If the reply contains special markers, convert them to interactive options
    if (responseMessage.includes('[INTERACTIVE_OPTIONS]')) {
      const parts = responseMessage.split('[INTERACTIVE_OPTIONS]');
      const messageContent = parts[0].trim();
      const optionsStr = parts[1].trim();
      const options = optionsStr.split('|').map(opt => opt.trim());
      
      await sendWhatsAppInteractiveMessage(message.from, messageContent, options);
    } else {
      // Send regular response
      await sendWhatsAppMessage(message.from, responseMessage);
    }
    
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
    
    // Send welcome message with interactive options
    const welcomeMessage = `👋 Hello${name ? ' ' + name : ''}! Welcome to WhatsApp Fashion Buddy!\n\nI can help you find clothes that match your skin tone or try on clothes virtually. What would you like to do today?`;
    
    const options = [
      'Color Analysis & Shopping Recommendations',
      'Virtual Try-On'
    ];
    
    await sendWhatsAppInteractiveMessage(phoneNumber, welcomeMessage, options);
    
    return { success: true, user, session };
  } catch (error) {
    console.error('Error initiating conversation:', error);
    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppImage,
  sendWhatsAppInteractiveMessage,
  createQuickReplyMessage,
  processIncomingMessage,
  initiateConversation,
  formatWhatsAppNumber,
  extractMessageFromTwilioWebhook
};
