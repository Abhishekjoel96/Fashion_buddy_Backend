/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Check if the error has a specific status code
    const statusCode = err.statusCode || 500;
    
    // Format the error response
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  /**
   * Not found middleware - handle 404 errors
   */
  const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
  };
  
  /**
   * Request logger middleware
   */
  const requestLogger = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
  };
  
  module.exports = {
    errorHandler,
    notFound,
    requestLogger
  };