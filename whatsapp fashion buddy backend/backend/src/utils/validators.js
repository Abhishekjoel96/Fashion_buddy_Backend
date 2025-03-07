/**
 * Validate phone number format
 * @param {string} phoneNumber The phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
const isValidPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return false;
    
    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Basic validation - check length and starting digits
    // Most international phone numbers are between 8 and 15 digits
    return digits.length >= 8 && digits.length <= 15;
  };
  
  /**
   * Validate email format
   * @param {string} email The email to validate
   * @returns {boolean} Whether the email is valid
   */
  const isValidEmail = (email) => {
    if (!email) return false;
    
    // Basic email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  /**
   * Validate URL format
   * @param {string} url The URL to validate
   * @returns {boolean} Whether the URL is valid
   */
  const isValidUrl = (url) => {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Validate UUID format
   * @param {string} uuid The UUID to validate
   * @returns {boolean} Whether the UUID is valid
   */
  const isValidUuid = (uuid) => {
    if (!uuid) return false;
    
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return re.test(uuid);
  };
  
  /**
   * Validate price format
   * @param {number|string} price The price to validate
   * @returns {boolean} Whether the price is valid
   */
  const isValidPrice = (price) => {
    if (price === undefined || price === null) return false;
    
    // If string, parse to number
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Check if it's a valid number and not negative
    return !isNaN(numPrice) && numPrice >= 0;
  };
  
  /**
   * Format phone number to E.164 format
   * @param {string} phoneNumber The phone number to format
   * @param {string} defaultCountryCode Default country code if not present
   * @returns {string} Formatted phone number
   */
  const formatPhoneNumber = (phoneNumber, defaultCountryCode = '91') => {
    if (!phoneNumber) return '';
    
    // Strip all non-digits
    let digits = phoneNumber.replace(/\D/g, '');
    
    // If the number doesn't start with a +, add the default country code
    if (!phoneNumber.startsWith('+')) {
      // If it doesn't already have the country code, add it
      if (digits.length <= 10) {
        digits = defaultCountryCode + digits;
      }
    }
    
    return '+' + digits;
  };
  
  module.exports = {
    isValidPhoneNumber,
    isValidEmail,
    isValidUrl,
    isValidUuid,
    isValidPrice,
    formatPhoneNumber
  };