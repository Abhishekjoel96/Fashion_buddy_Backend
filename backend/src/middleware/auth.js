/**
 * Simple authentication middleware for admin routes
 */
const authenticateAdmin = (req, res, next) => {
    // Skip authentication for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Check for API key in headers
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid API key'
      });
    }
    
    next();
  };
  
  /**
   * Validate that required fields are present in request body
   */
  const validateFields = (requiredFields) => {
    return (req, res, next) => {
      // Skip validation for OPTIONS requests
      if (req.method === 'OPTIONS') {
        return next();
      }

      const missingFields = [];
      
      for (const field of requiredFields) {
        if (!req.body[field]) {
          missingFields.push(field);
        }
      }
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
      
      next();
    };
  };
  
  module.exports = {
    authenticateAdmin,
    validateFields
  };
