/**
 * Standard success response formatter
 * @param {string} message Success message
 * @param {any} data Data to include in response
 * @param {number} statusCode HTTP status code
 * @returns {object} Formatted success response
 */
const successResponse = (message = 'Operation successful', data = null, statusCode = 200) => {
    return {
      success: true,
      message,
      statusCode,
      data,
      timestamp: new Date().toISOString()
    };
  };
  
  /**
   * Standard error response formatter
   * @param {string} message Error message
   * @param {number} statusCode HTTP status code
   * @param {any} error Error details
   * @returns {object} Formatted error response
   */
  const errorResponse = (message = 'An error occurred', statusCode = 500, error = null) => {
    const response = {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString()
    };
    
    // Include error details if in development mode
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = error.message || error;
      response.stack = error.stack;
    }
    
    return response;
  };
  
  /**
   * Format WhatsApp message for response
   * @param {string} body Message body
   * @param {array} media Array of media URLs (optional)
   * @returns {object} Formatted WhatsApp message
   */
  const formatWhatsAppMessage = (body, media = []) => {
    const message = { body };
    
    if (media && media.length > 0) {
      message.media = media;
    }
    
    return message;
  };
  
  /**
   * Format pagination metadata
   * @param {number} page Current page number
   * @param {number} limit Items per page
   * @param {number} total Total number of items
   * @returns {object} Pagination metadata
   */
  const paginationMeta = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    
    return {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  };
  
  module.exports = {
    successResponse,
    errorResponse,
    formatWhatsAppMessage,
    paginationMeta
  };