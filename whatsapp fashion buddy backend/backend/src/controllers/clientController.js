const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const whatsappService = require('../services/whatsappService');

/**
 * Get all clients
 */
const getAllClients = async (req, res) => {
  try {
    const clients = await userModel.getAllUsers();
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Error getting all clients:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Get client by ID
 */
const getClientById = async (req, res) => {
  try {
    const client = await userModel.getUserById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error getting client by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Create new client and initiate WhatsApp conversation
 */
const createClient = async (req, res) => {
  try {
    const { name, phone_number } = req.body;
    
    if (!phone_number) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a phone number'
      });
    }
    
    // Check if client already exists
    const existingClient = await userModel.getUserByPhone(phone_number);
    
    if (existingClient) {
      return res.status(400).json({
        success: false,
        error: 'Client with this phone number already exists'
      });
    }
    
    // Create new client
    const client = await userModel.createUser(phone_number, name);
    
    // Initiate WhatsApp conversation
    const conversation = await whatsappService.initiateConversation(phone_number, name);
    
    res.status(201).json({
      success: true,
      data: client,
      conversation: conversation
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Update client details
 */
const updateClient = async (req, res) => {
  try {
    const updates = req.body;
    const clientId = req.params.id;
    
    // Check if client exists
    const existingClient = await userModel.getUserById(clientId);
    
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    // Update client
    const client = await userModel.updateUser(clientId, updates);
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Delete client
 */
const deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    
    // Check if client exists
    const existingClient = await userModel.getUserById(clientId);
    
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    // Delete client
    await userModel.deleteUser(clientId);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Get client analytics
 */
const getClientAnalytics = async (req, res) => {
  try {
    // Get total number of clients
    const clients = await userModel.getAllUsers();
    
    // Get session stats
    const sessions = await sessionModel.getSessionsStats();
    
    // Calculate analytics
    const totalClients = clients.length;
    const activeClientsLastMonth = clients.filter(client => {
      const lastActiveDate = new Date(client.last_active);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return lastActiveDate > monthAgo;
    }).length;
    
    // Count session types
    const colorAnalysisSessions = sessions.filter(session => session.session_type === 'color_analysis').length;
    const virtualTryonSessions = sessions.filter(session => session.session_type === 'virtual_tryon').length;
    
    // Get daily activity for the past 30 days
    const dailyActivity = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];
      
      const sessionsOnDay = sessions.filter(session => {
        const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
        return sessionDate === formattedDate;
      }).length;
      
      dailyActivity.push({
        date: formattedDate,
        count: sessionsOnDay
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalClients,
        activeClientsLastMonth,
        sessionBreakdown: {
          colorAnalysis: colorAnalysisSessions,
          virtualTryon: virtualTryonSessions
        },
        dailyActivity: dailyActivity.reverse()
      }
    });
  } catch (error) {
    console.error('Error getting client analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientAnalytics
};