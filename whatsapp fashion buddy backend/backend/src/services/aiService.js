const openai = require('../config/openai');
const skinToneData = require('../data/skinTones');

/**
 * Analyze skin tone from photos using GPT-4o Vision with RAG
 */
const analyzeSkinTone = async (imageUrls) => {
  try {
    // Create a system prompt that includes all the skin tone options for RAG
    const skinToneOptions = JSON.stringify(skinToneData.map(item => item.skin_tone_undertone));
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional skin tone analyzer for fashion recommendations. 
          You will be shown facial photos of a person, and you need to determine their skin tone category.
          Analyze the photos carefully and categorize the skin tone from the following options: ${skinToneOptions}
          You must select EXACTLY one skin tone from the list above. Do not create new categories.
          
          After selecting the skin tone, use that determination to find the appropriate color recommendations
          from your dataset. The output should be in JSON format with the following structure:
          {
            "skinTone": "selected skin tone from the list",
            "undertone": "warm/cool/neutral extracted from skin tone",
            "recommendedColors": ["color1", "color2", "color3", "color4", "color5", "color6"],
            "avoidColors": ["color1", "color2", "color3", "color4"]
          }`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze these facial photos and determine the skin tone category." },
            ...imageUrls.map(url => ({ type: "image_url", image_url: { url } }))
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // If skin tone is found but colors aren't properly populated, fetch them from our dataset
    if (result.skinTone && (!result.recommendedColors || !result.avoidColors)) {
      const matchingTone = skinToneData.find(item => 
        item.skin_tone_undertone.toLowerCase() === result.skinTone.toLowerCase()
      );
      
      if (matchingTone) {
        result.recommendedColors = matchingTone.recommended_colors.split(', ');
        result.avoidColors = matchingTone.avoid_colors.split(', ');
      }
    }

    return result;
  } catch (error) {
    console.error('Error in skin tone analysis:', error);
    throw error;
  }
};

/**
 * Process WhatsApp messages using GPT-4o with RAG
 */
const processWhatsAppMessage = async (message, sessionData) => {
  try {
    // Format skin tone data for RAG
    const skinToneInfo = skinToneData.map(item => ({
      tone: item.skin_tone_undertone,
      recommended: item.recommended_colors,
      avoid: item.avoid_colors
    }));
    
    // Build conversation history for context
    const messages = [
      {
        role: "system",
        content: `You are a WhatsApp Fashion Buddy, an AI assistant specializing in fashion advice based on skin tones. 
        You help users find clothing that suits their skin tone and allows them to virtually try on clothes.
        
        You guide users through two main paths:
        1. Color Analysis & Shopping: Analyze skin tone from photos, recommend colors, and suggest clothing items
        2. Virtual Try-On: Allow users to see how specific clothing items would look on them
        
        You have access to the following skin tone data for color recommendations:
        ${JSON.stringify(skinToneInfo.slice(0, 5))}... (and more)
        
        You should always be helpful, friendly, and conversational. Use emojis and keep messages concise for WhatsApp.
        Prices should be shown in Indian Rupees (₹).
        
        The user's current session type is: ${sessionData?.session_type || 'new_session'}
        The user's current session status is: ${sessionData?.status || 'none'}`
      }
    ];
    
    // Add session history if available
    if (sessionData?.history) {
      messages.push(...sessionData.history);
    }
    
    // Add current message
    if (message.type === 'text') {
      messages.push({
        role: "user",
        content: message.text
      });
    } else if (message.type === 'image') {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: message.caption || "I've sent you an image." },
          { type: "image_url", image_url: { url: message.imageUrl } }
        ]
      });
    }
    
    // Generate response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages
    });
    
    return {
      reply: response.choices[0].message.content,
      session_updates: detectSessionUpdates(response.choices[0].message.content)
    };
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    throw error;
  }
};

/**
 * Helper function to detect session updates from AI response
 */
const detectSessionUpdates = (message) => {
  const updates = {};
  
  // Detect if session type should change
  if (message.includes("color analysis") || message.includes("skin tone")) {
    updates.session_type = "color_analysis";
  } else if (message.includes("virtual try-on") || message.includes("try on")) {
    updates.session_type = "virtual_tryon";
  }
  
  // Detect session completion
  if (message.includes("session complete") || message.includes("thank you for using") || message.includes("have a stylish day")) {
    updates.status = "completed";
  }
  
  return updates;
};

module.exports = {
  analyzeSkinTone,
  processWhatsAppMessage
};