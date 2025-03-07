require('dotenv').config();
const imageModel = require('../src/models/imageModel');

// Vercel CRON job to clean up expired images
module.exports = async (req, res) => {
  try {
    console.log('Running expired image cleanup...');
    const deletedCount = await imageModel.deleteExpiredImages();
    console.log(`Cleaned up ${deletedCount} expired images`);
    
    return res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount} expired images`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during image cleanup:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clean up expired images',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
