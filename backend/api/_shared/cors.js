// backend/api/_shared/cors.js
module.exports = {
  corsHeaders: {
    'Access-Control-Allow-Origin': 'https://fashion-buddy-chat.vercel.app',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    'Access-Control-Max-Age': '86400'
  }
};
