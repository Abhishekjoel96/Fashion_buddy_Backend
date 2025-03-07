const { search } = require('../config/serpapi');
const shoppingModel = require('../models/shoppingModel');

/**
 * Search for clothing items based on color, type, and budget
 */
const searchClothing = async (color, clothingType, budget, material = null) => {
  try {
    // Convert budget range to numbers for filtering
    const budgetRange = parseBudgetRange(budget);
    
    // Build search query
    let query = `${color} ${clothingType}`;
    if (material) {
      query += ` ${material}`;
    }
    query += ' buy online india';
    
    // Search using SerpAPI
    return new Promise((resolve, reject) => {
      search.json({
        engine: 'google_shopping',
        q: query,
        location: 'Mumbai,Maharashtra,India',
        google_domain: 'google.co.in',
        gl: 'in',
        hl: 'en',
        num: 20 // Get more results to filter
      }, (data, error) => {
        if (error) {
          return reject(error);
        }
        
        if (!data.shopping_results || data.shopping_results.length === 0) {
          return resolve([]);
        }
        
        // Filter and format results
        const filteredResults = data.shopping_results
          .filter(item => {
            // Extract price value
            const priceValue = extractPriceValue(item.price);
            
            // Check if within budget range
            return priceValue >= budgetRange.min && priceValue <= budgetRange.max;
          })
          .map(item => ({
            name: item.title,
            brand: extractBrand(item.title, item.source),
            price: item.price,
            url: item.link,
            imageUrl: item.thumbnail,
            color: color,
            source: item.source
          }))
          .slice(0, 4); // Return top 4 results
        
        resolve(filteredResults);
      });
    });
  } catch (error) {
    console.error('Error searching for clothing:', error);
    throw error;
  }
};

/**
 * Save the recommended products to the database
 */
const saveRecommendations = async (sessionId, products) => {
  try {
    const savedProducts = [];
    
    for (const product of products) {
      const saved = await shoppingModel.saveShoppingRecommendation(sessionId, product);
      savedProducts.push(saved);
    }
    
    return savedProducts;
  } catch (error) {
    console.error('Error saving recommendations:', error);
    throw error;
  }
};

/**
 * Parse budget range
 */
const parseBudgetRange = (budget) => {
  // Default budget range (in INR)
  let min = 500;
  let max = 5000;
  
  if (typeof budget === 'string') {
    if (budget.toLowerCase().includes('low') || budget.includes('budget')) {
      min = 500;
      max = 1500;
    } else if (budget.toLowerCase().includes('mid')) {
      min = 1500;
      max = 3000;
    } else if (budget.toLowerCase().includes('high') || budget.toLowerCase().includes('premium')) {
      min = 3000;
      max = 10000;
    } else if (budget.includes('-')) {
      // Try to parse a range like "1000-2000"
      const parts = budget.split('-');
      if (parts.length === 2) {
        const parsedMin = parseFloat(parts[0].replace(/[^0-9.]/g, ''));
        const parsedMax = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
        if (!isNaN(parsedMin)) min = parsedMin;
        if (!isNaN(parsedMax)) max = parsedMax;
      }
    } else {
      // Try to parse a single number as the max budget
      const parsed = parseFloat(budget.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed)) {
        min = 0;
        max = parsed;
      }
    }
  } else if (typeof budget === 'object' && budget.min !== undefined && budget.max !== undefined) {
    min = budget.min;
    max = budget.max;
  }
  
  return { min, max };
};

/**
 * Extract price value from string
 */
const extractPriceValue = (priceStr) => {
  if (!priceStr) return 0;
  
  // Remove currency symbols and commas, keep only numbers and decimal point
  const cleanPrice = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleanPrice) || 0;
};

/**
 * Extract brand from product title or source
 */
const extractBrand = (title, source) => {
  if (!title) return source || '';
  
  // Common brand names to look for
  const commonBrands = [
    'Nike', 'Adidas', 'Puma', 'Levi\'s', 'H&M', 'Zara', 'Mango', 'Uniqlo',
    'Gap', 'Gucci', 'Calvin Klein', 'Louis Vuitton', 'Lacoste', 'Tommy Hilfiger',
    'Ralph Lauren', 'Vans', 'Armani', 'Chanel', 'Dior', 'Fendi', 'Versace',
    'Balenciaga', 'Burberry', 'Prada', 'Hermès', 'Off-White', 'Supreme',
    'Allen Solly', 'Peter England', 'Raymond', 'Van Heusen', 'Wrangler',
    'Arrow', 'Park Avenue', 'Louis Philippe', 'Blackberrys', 'Indian Terrain',
    'Fabindia', 'Biba', 'W', 'Ethnix', 'Manyavar', 'Jockey', 'Pantaloons'
  ];
  
  for (const brand of commonBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  return source || '';
};

/**
 * Format and prepare product results for the WhatsApp message
 */
const formatProductsForWhatsApp = (products) => {
  if (!products || products.length === 0) {
    return 'Sorry, I couldn\'t find any products matching your criteria.';
  }
  
  let message = 'Here are some clothing options that would look great with your skin tone:\n\n';
  
  products.forEach((product, index) => {
    message += `${index + 1}. *${product.name}*\n`;
    message += `💰 ${product.price}\n`;
    if (product.brand) message += `👕 Brand: ${product.brand}\n`;
    message += `🔗 [Shop Now](${product.url})\n\n`;
  });
  
  message += 'Would you like to see more options or try on any of these virtually?';
  
  return message;
};

module.exports = {
  searchClothing,
  saveRecommendations,
  formatProductsForWhatsApp
};