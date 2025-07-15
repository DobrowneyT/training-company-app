/**
 * Global BigInt Serialization Solution
 * Handles BigInt values in JSON serialization for API responses
 * 
 * @file backend/src/utils/bigIntSerializer.js
 * @author Training Company App
 * @version 1.0.0
 */

/**
 * Configure global BigInt serialization
 * Call this once at application startup
 */
function setupBigIntSerialization() {
  // Override BigInt prototype to add toJSON method
  if (!BigInt.prototype.toJSON) {
    BigInt.prototype.toJSON = function() {
      return this.toString();
    };
  }

  // Store original JSON.stringify for debugging
  const originalStringify = JSON.stringify;
  
  // Override JSON.stringify to handle BigInt properly
  JSON.stringify = function(value, replacer, space) {
    const bigIntReplacer = function(key, val) {
      if (typeof val === 'bigint') {
        return val.toString();
      }
      if (replacer && typeof replacer === 'function') {
        return replacer(key, val);
      }
      return val;
    };
    
    const finalReplacer = replacer ? 
      function(key, val) {
        const processed = bigIntReplacer(key, val);
        return replacer(key, processed);
      } : 
      bigIntReplacer;
    
    return originalStringify.call(this, value, finalReplacer, space);
  };

  console.log('✅ BigInt serialization configured globally');
}

/**
 * Convert BigInt fields to strings in an object
 * @param {Object} obj - Object that may contain BigInt values
 * @returns {Object} Object with BigInt values converted to strings
 */
function serializeBigInt(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }
  
  return obj;
}

/**
 * Express middleware to handle BigInt serialization in responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function bigIntMiddleware(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    const serializedData = serializeBigInt(data);
    return originalJson.call(this, serializedData);
  };
  
  next();
}

/**
 * Parse string values back to numbers where appropriate
 * Useful for converting string representations back to numbers for calculations
 * @param {Object} obj - Object with string number values
 * @param {Array<string>} fields - Fields to convert back to numbers
 * @returns {Object} Object with specified fields converted to numbers
 */
function parseStringNumbers(obj, fields) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      const parsed = parseInt(result[field], 10);
      if (!isNaN(parsed)) {
        result[field] = parsed;
      }
    }
  }
  
  return result;
}

/**
 * Format large numbers for display
 * @param {string|number} value - Number to format
 * @returns {string} Formatted number string
 */
function formatLargeNumber(value) {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(num)) {
    return 'N/A';
  }
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toLocaleString();
  }
}

module.exports = {
  setupBigIntSerialization,
  serializeBigInt,
  bigIntMiddleware,
  parseStringNumbers,
  formatLargeNumber
};