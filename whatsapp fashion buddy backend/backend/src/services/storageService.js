const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const imageModel = require('../models/imageModel');
const fetch = require('node-fetch');

/**
 * Upload image to Supabase storage
 */
const uploadImage = async (base64Image, userId, sessionId, imageType) => {
  try {
    // Remove base64 prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename
    const fileExt = guessImageExtension(base64Data);
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${imageType}/${fileName}`;
    
    // Upload to Supabase
    const { data, error } = await supabase
      .storage
      .from('user-uploads')
      .upload(filePath, buffer, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600'
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('user-uploads')
      .getPublicUrl(filePath);
    
    // Store reference in database
    await imageModel.storeImageReference(userId, sessionId, filePath, imageType);
    
    return { 
      path: filePath, 
      url: publicUrl 
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Download image from URL and store in Supabase
 */
const downloadAndStoreImage = async (imageUrl, userId, sessionId, imageType) => {
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Get file extension from content-type
    const contentType = response.headers.get('content-type');
    const fileExt = contentType ? contentType.split('/')[1].split(';')[0] : 'jpg';
    
    // Generate a unique filename
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${imageType}/${fileName}`;
    
    // Upload to Supabase
    const { data, error } = await supabase
      .storage
      .from('user-uploads')
      .upload(filePath, buffer, {
        contentType: contentType || 'image/jpeg',
        cacheControl: '3600'
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('user-uploads')
      .getPublicUrl(filePath);
    
    // Store reference in database
    await imageModel.storeImageReference(userId, sessionId, filePath, imageType);
    
    return { 
      path: filePath, 
      url: publicUrl 
    };
  } catch (error) {
    console.error('Error downloading and storing image:', error);
    throw error;
  }
};

/**
 * Delete image from storage
 */
const deleteImage = async (storagePath) => {
  try {
    const { error } = await supabase
      .storage
      .from('user-uploads')
      .remove([storagePath]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Clean up expired images
 */
const cleanupExpiredImages = async () => {
  try {
    const deletedCount = await imageModel.deleteExpiredImages();
    console.log(`Cleaned up ${deletedCount} expired images`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired images:', error);
    throw error;
  }
};

/**
 * Helper function to guess the image extension from base64 data
 */
const guessImageExtension = (base64Data) => {
  // Check the first few characters of the base64 string to determine the image type
  if (base64Data.startsWith('/9j/')) {
    return 'jpg';
  } else if (base64Data.startsWith('iVBORw0K')) {
    return 'png';
  } else if (base64Data.startsWith('R0lGOD')) {
    return 'gif';
  } else if (base64Data.startsWith('UklGR')) {
    return 'webp';
  } else {
    return 'jpg'; // Default to jpg
  }
};

module.exports = {
  uploadImage,
  downloadAndStoreImage,
  deleteImage,
  cleanupExpiredImages
};