const supabase = require('../config/supabase');

const saveColorAnalysis = async (sessionId, skinTone, recommendedColors, avoidColors) => {
  try {
    // Format the colors data properly
    let recommendedColorsData = recommendedColors;
    let avoidColorsData = avoidColors;

    // If colors are provided as strings, convert to arrays
    if (typeof recommendedColors === 'string') {
      recommendedColorsData = recommendedColors.split(',').map(color => color.trim());
    }
    
    if (typeof avoidColors === 'string') {
      avoidColorsData = avoidColors.split(',').map(color => color.trim());
    }

    const { data, error } = await supabase
      .from('color_analysis_results')
      .insert([
        { 
          session_id: sessionId, 
          skin_tone: skinTone, 
          recommended_colors: recommendedColorsData, 
          avoid_colors: avoidColorsData 
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving color analysis:', error);
    throw error;
  }
};

const getColorAnalysisById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('color_analysis_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting color analysis by ID:', error);
    throw error;
  }
};

const getColorAnalysisBySession = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('color_analysis_results')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting color analysis by session:', error);
    throw error;
  }
};

const getAllColorAnalyses = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('color_analysis_results')
      .select('*, sessions(*, users(*))')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all color analyses:', error);
    throw error;
  }
};

module.exports = {
  saveColorAnalysis,
  getColorAnalysisById,
  getColorAnalysisBySession,
  getAllColorAnalyses
};