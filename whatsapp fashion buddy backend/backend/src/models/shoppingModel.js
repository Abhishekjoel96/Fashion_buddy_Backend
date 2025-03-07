const supabase = require('../config/supabase');

const saveShoppingRecommendation = async (sessionId, productData) => {
  try {
    // Ensure required fields are present
    if (!productData.url) {
      throw new Error('Product URL is required');
    }

    const { data, error } = await supabase
      .from('shopping_recommendations')
      .insert([
        { 
          session_id: sessionId, 
          product_url: productData.url,
          product_image_url: productData.imageUrl || null, 
          product_name: productData.name || null,
          price: productData.price || null,
          color: productData.color || null,
          brand: productData.brand || null
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving shopping recommendation:', error);
    throw error;
  }
};

const getRecommendationById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('shopping_recommendations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting recommendation by ID:', error);
    throw error;
  }
};

const getRecommendationsBySession = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('shopping_recommendations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting recommendations by session:', error);
    throw error;
  }
};

const deleteRecommendation = async (id) => {
  try {
    const { error } = await supabase
      .from('shopping_recommendations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    throw error;
  }
};

module.exports = {
  saveShoppingRecommendation,
  getRecommendationById,
  getRecommendationsBySession,
  deleteRecommendation
};