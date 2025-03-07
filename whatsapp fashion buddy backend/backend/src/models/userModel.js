const supabase = require('../config/supabase');

const createUser = async (phoneNumber, name = null) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        { phone_number: phoneNumber, name: name }
      ])
      .select()
      .single();

    if (error) {
      // If the error is due to a duplicate, fetch the existing user
      if (error.code === '23505') {
        return getUserByPhone(phoneNumber);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const getUserByPhone = async (phoneNumber) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

const updateUser = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updateData,
        last_active: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByPhone,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers
};