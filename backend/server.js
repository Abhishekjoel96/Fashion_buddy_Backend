require('dotenv').config();
const app = require('./src/app');
const imageModel = require('./src/models/imageModel');

// Set the port
const PORT = process.env.PORT || 5000;

// Schedule cleanup for expired images
// This is a simple version for the MVP; in production, we'd use a proper
// scheduling library or a separate service
const scheduleImageCleanup = () => {
  console.log('Setting up expired image cleanup schedule...');
  
  // Run cleanup every hour
  setInterval(async () => {
    try {
      console.log('Running expired image cleanup...');
      const deletedCount = await imageModel.deleteExpiredImages();
      console.log(`Cleaned up ${deletedCount} expired images`);
    } catch (error) {
      console.error('Error during image cleanup:', error);
    }
  }, 60 * 60 * 1000); // 1 hour in milliseconds
};

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Schedule the cleanup task
  scheduleImageCleanup();
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