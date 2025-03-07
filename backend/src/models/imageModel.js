const supabase = require('../config/supabase');

const storeImageReference = async (userId, sessionId, storagePath, imageType, expiresInHours = 4) => {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    
    const { data, error } = await supabase
      .from('images')
      .insert([
        { 
          user_id: userId, 
          session_id: sessionId, 
          storage_path: storagePath, 
          image_type: imageType,
          expires_at: expiresAt.toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error storing image reference:', error);
    throw error;
  }
};

const getImageById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting image by ID:', error);
    throw error;
  }
};

const getImagesBySession = async (sessionId, imageType = null) => {
  try {
    let query = supabase
      .from('images')
      .select('*')
      .eq('session_id', sessionId);
    
    if (imageType) {
      query = query.eq('image_type', imageType);
    }
    
    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting images by session:', error);
    throw error;
  }
};

const getImagesByUser = async (userId, imageType = null) => {
  try {
    let query = supabase
      .from('images')
      .select('*')
      .eq('user_id', userId);
    
    if (imageType) {
      query = query.eq('image_type', imageType);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting images by user:', error);
    throw error;
  }
};

const deleteExpiredImages = async () => {
  try {
    const now = new Date().toISOString();
    
    // Get expired images
    const { data: expiredImages, error: queryError } = await supabase
      .from('images')
      .select('*')
      .lt('expires_at', now);
    
    if (queryError) throw queryError;
    
    // Delete each image from storage
    for (const image of expiredImages || []) {
      const { error: storageError } = await supabase
        .storage
        .from('user-uploads')
        .remove([image.storage_path]);
        
      if (storageError) {
        console.error(`Failed to delete file ${image.storage_path}:`, storageError);
      }
    }
    
    // Delete all expired image records
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .lt('expires_at', now);
    
    if (deleteError) throw deleteError;
    
    return expiredImages?.length || 0;
  } catch (error) {
    console.error('Error deleting expired images:', error);
    throw error;
  }
};

module.exports = {
  storeImageReference,
  getImageById,
  getImagesBySession,
  getImagesByUser,
  deleteExpiredImages
};