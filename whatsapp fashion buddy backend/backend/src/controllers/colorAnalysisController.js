const aiService = require('../services/aiService');
const colorAnalysisModel = require('../models/colorAnalysisModel');
const sessionModel = require('../models/sessionModel');
const storageService = require('../services/storageService');

/**
 * Perform color analysis on uploaded images
 */
const analyzeColors = async (req, res) => {
  try {
    const { userId, sessionId, images } = req.body;
    
    if (!userId || !sessionId || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide userId, sessionId, and at least one image'
      });
    }
    
    // Upload images to storage and get URLs
    const imageUrls = [];
    for (const imageBase64 of images) {
      const uploadResult = await storageService.uploadImage(
        imageBase64,
        userId,
        sessionId,
        'face'
      );
      imageUrls.push(uploadResult.url);
    }
    
    // Perform color analysis with OpenAI
    const analysisResult = await aiService.analyzeSkinTone(imageUrls);
    
    // Update session type
    await sessionModel.updateSessionStatus(sessionId, 'active');
    
    // Save color analysis results
    const colorAnalysis = await colorAnalysisModel.saveColorAnalysis(
      sessionId,
      analysisResult.skinTone,
      analysisResult.recommendedColors,
      analysisResult.avoidColors
    );
    
    res.status(200).json({
      success: true,
      data: {
        skinTone: analysisResult.skinTone,
        undertone: analysisResult.undertone,
        recommendedColors: analysisResult.recommendedColors,
        avoidColors: analysisResult.avoidColors,
        id: colorAnalysis.id
      }
    });
  } catch (error) {
    console.error('Error performing color analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Get color analysis result by session ID
 */
const getColorAnalysis = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a session ID'
      });
    }
    
    const colorAnalysis = await colorAnalysisModel.getColorAnalysisBySession(sessionId);
    
    if (!colorAnalysis) {
      return res.status(404).json({
        success: false,
        error: 'Color analysis not found for this session'
      });
    }
    
    res.status(200).json({
      success: true,
      data: colorAnalysis
    });
  } catch (error) {
    console.error('Error getting color analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Get all color analyses with pagination
 */
const getAllColorAnalyses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const colorAnalyses = await colorAnalysisModel.getAllColorAnalyses(limit);
    
    res.status(200).json({
      success: true,
      count: colorAnalyses.length,
      data: colorAnalyses
    });
  } catch (error) {
    console.error('Error getting all color analyses:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  analyzeColors,
  getColorAnalysis,
  getAllColorAnalyses
};