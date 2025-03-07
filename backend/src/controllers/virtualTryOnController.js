const sessionModel = require('../models/sessionModel');
const imageModel = require('../models/imageModel');
const storageService = require('../services/storageService');
const shoppingModel = require('../models/shoppingModel');
const fetch = require('node-fetch');
const { fashnApiKey, fashnApiUrl } = require('../config/fashn');

/**
 * Perform virtual try-on
 */
const performVirtualTryOn = async (req, res) => {
  try {
    const { userId, sessionId, bodyImage, clothingImageUrl, clothingId } = req.body;
    
    if (!userId || !sessionId || !bodyImage || (!clothingImageUrl && !clothingId)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide userId, sessionId, bodyImage, and either clothingImageUrl or clothingId'
      });
    }
    
    // Upload body image to storage
    const bodyImageResult = await storageService.uploadImage(
      bodyImage,
      userId,
      sessionId,
      'body'
    );
    
    // Get clothing image - either from URL or from stored recommendations
    let clothingImage;
    if (clothingId) {
      // Get product from database
      const recommendations = await shoppingModel.getRecommendationsBySession(sessionId);
      const product = recommendations.find(r => r.id === clothingId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Clothing item not found'
        });
      }
      
      clothingImage = product.product_image_url;
    } else {
      clothingImage = clothingImageUrl;
    }
    
    // Download clothing image
    const clothingImageResult = await storageService.downloadAndStoreImage(
      clothingImage,
      userId,
      sessionId,
      'clothing'
    );
    
    // Call Fashn API for virtual try-on
    const tryOnResult = await callFashnApi(bodyImageResult.url, clothingImageResult.url);
    
    if (!tryOnResult.success) {
      return res.status(400).json({
        success: false,
        error: tryOnResult.error || 'Virtual try-on failed'
      });
    }
    
    // Store the result image
    const resultImageResult = await storageService.downloadAndStoreImage(
      tryOnResult.resultImageUrl,
      userId,
      sessionId,
      'result'
    );
    
    // Update session type
    await sessionModel.updateSessionStatus(sessionId, 'active');
    
    res.status(200).json({
      success: true,
      data: {
        resultImageUrl: resultImageResult.url,
        originalBodyImageUrl: bodyImageResult.url,
        clothingImageUrl: clothingImageResult.url
      }
    });
  } catch (error) {
    console.error('Error performing virtual try-on:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Call Fashn API for virtual try-on
 */
const callFashnApi = async (bodyImageUrl, clothingImageUrl) => {
  try {
    const response = await fetch(`${fashnApiUrl}/try-on`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fashnApiKey}`
      },
      body: JSON.stringify({
        personImageUrl: bodyImageUrl,
        clothingImageUrl: clothingImageUrl
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Error calling Fashn API'
      };
    }
    
    return {
      success: true,
      resultImageUrl: data.resultImageUrl
    };
  } catch (error) {
    console.error('Error calling Fashn API:', error);
    return {
      success: false,
      error: 'Error calling Fashn API'
    };
  }
};

/**
 * Get virtual try-on results by session
 */
const getTryOnResultsBySession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a session ID'
      });
    }
    
    // Get result images for this session
    const resultImages = await imageModel.getImagesBySession(sessionId, 'result');
    
    if (!resultImages || resultImages.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No virtual try-on results found for this session'
      });
    }
    
    res.status(200).json({
      success: true,
      count: resultImages.length,
      data: resultImages
    });
  } catch (error) {
    console.error('Error getting virtual try-on results:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  performVirtualTryOn,
  getTryOnResultsBySession
};