/**
 * Utility functions for image processing
 */

/**
 * Validates an image's base64 format
 * @param {string} base64String The base64 string to validate
 * @returns {boolean} Whether the string is a valid base64 image format
 */
const isValidBase64Image = (base64String) => {
    if (!base64String) return false;
    
    // Check for data:image format
    if (base64String.startsWith('data:image/')) {
      const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
      if (!matches) return false;
      
      // Extract the base64 content after the prefix
      const base64Content = base64String.replace(/^data:image\/([a-zA-Z0-9]+);base64,/, '');
      
      // Check if the content is valid base64
      try {
        return btoa(atob(base64Content)) === base64Content;
      } catch (err) {
        return false;
      }
    }
    
    // If it doesn't have the data:image prefix, just check if it's valid base64
    try {
      return btoa(atob(base64String)) === base64String;
    } catch (err) {
      return false;
    }
  };
  
  /**
   * Guesses the image format from a base64 string
   * @param {string} base64String The base64 string to analyze
   * @returns {string} The guessed image format (extension)
   */
  const guessImageFormat = (base64String) => {
    if (!base64String) return 'jpg';
    
    // Check for data:image format first
    if (base64String.startsWith('data:image/')) {
      const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
      return matches ? matches[1] : 'jpg';
    }
    
    // If no prefix, try to guess from the content
    const firstChars = base64String.substring(0, 100);
    
    if (firstChars.includes('/9j/')) {
      return 'jpg';
    } else if (firstChars.includes('iVBORw0K')) {
      return 'png';
    } else if (firstChars.includes('R0lGOD')) {
      return 'gif';
    } else if (firstChars.includes('UklGR')) {
      return 'webp';
    }
    
    // Default to jpg
    return 'jpg';
  };
  
  /**
   * Extracts the base64 content from a data URL
   * @param {string} dataUrl The data URL to extract from
   * @returns {string} The extracted base64 content
   */
  const extractBase64FromDataUrl = (dataUrl) => {
    if (!dataUrl || typeof dataUrl !== 'string') {
      return '';
    }
    
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    return matches ? matches[2] : dataUrl;
  };
  
  /**
   * Creates a proper data URL from a base64 string
   * @param {string} base64String The base64 string
   * @param {string} format The image format (defaults to auto-detection)
   * @returns {string} A proper data URL
   */
  const createDataUrl = (base64String, format = null) => {
    // Return if already a data URL
    if (base64String && base64String.startsWith('data:image/')) {
      return base64String;
    }
    
    // Auto-detect format if not provided
    const imageFormat = format || guessImageFormat(base64String);
    
    return `data:image/${imageFormat};base64,${base64String}`;
  };
  
  module.exports = {
    isValidBase64Image,
    guessImageFormat,
    extractBase64FromDataUrl,
    createDataUrl
  };