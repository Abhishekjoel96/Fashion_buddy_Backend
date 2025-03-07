const supabase = require('../config/supabase');

const createSession = async (userId, sessionType, status = 'active') => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert([
        { 
          user_id: userId, 
          session_type: sessionType, 
          status: status 
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

const updateSessionStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
};

const getSessionById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting session by ID:', error);
    throw error;
  }
};

const getActiveSessionByUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting active session by user:', error);
    throw error;
  }
};

const getSessionsByUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting sessions by user:', error);
    throw error;
  }
};

const getSessionsStats = async (days = 30) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const { data, error } = await supabase
      .from('sessions')
      .select('session_type, created_at')
      .gte('created_at', date.toISOString());

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting sessions stats:', error);
    throw error;
  }
};

module.exports = {
  createSession,
  updateSessionStatus,
  getSessionById,
  getActiveSessionByUser,
  getSessionsByUser,
  getSessionsStats
};