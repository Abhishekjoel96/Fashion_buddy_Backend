// server.js - Modified for Vercel compatibility
require('dotenv').config();
const app = require('./src/app');
const imageModel = require('./src/models/imageModel');

// This conditional allows the file to be used for both local development
// and as a reference in the Vercel environment
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === undefined) {
  // Only run the server when in local development, not on Vercel
  const PORT = process.env.PORT || 5000;
  
  // Start the server for local development
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Schedule the cleanup task locally
    console.log('Setting up expired image cleanup schedule...');
    setInterval(async () => {
      try {
        console.log('Running expired image cleanup...');
        const deletedCount = await imageModel.deleteExpiredImages();
        console.log(`Cleaned up ${deletedCount} expired images`);
      } catch (error) {
        console.error('Error during image cleanup:', error);
      }
    }, 60 * 60 * 1000); // 1 hour in milliseconds
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
}

// This allows Vercel to import the app without starting a server
module.exports = app;
