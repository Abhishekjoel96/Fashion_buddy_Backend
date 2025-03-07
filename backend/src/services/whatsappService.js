// Add these new functions to whatsappService.js

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

// Update the initiateConversation function to use the new format

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

// Update the processIncomingMessage function to recognize option selections

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
    // This would require modifying the aiService to provide structured responses
    let responseMessage = aiResponse.reply;
    
    // Example: if the reply contains special markers, convert them to interactive options
    if (responseMessage.includes('[INTERACTIVE_OPTIONS]')) {
      const parts = responseMessage.split('[INTERACTIVE_OPTIONS]');
      const message = parts[0].trim();
      const optionsStr = parts[1].trim();
      const options = optionsStr.split('|').map(opt => opt.trim());
      
      await sendWhatsAppInteractiveMessage(message.from, message, options);
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

// Make sure to export the new functions
module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppImage,
  sendWhatsAppInteractiveMessage,
  createQuickReplyMessage,
  processIncomingMessage,
  initiateConversation
};
