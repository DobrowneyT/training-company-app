/**
 * @fileoverview Encryption service for sensitive data protection
 * @description Provides AES encryption/decryption for API keys and sensitive data
 * @version 1.0.0
 */

const crypto = require('crypto-js');

/**
 * Encryption key from environment variables
 * @type {string}
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

/**
 * Validate encryption key on module load
 */
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

if (ENCRYPTION_KEY.length < 32) {
  console.warn('WARNING: ENCRYPTION_KEY should be at least 32 characters for security');
}

/**
 * Encrypt text using AES encryption
 * @function encrypt
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted text
 * @throws {Error} If encryption fails
 */
function encrypt(text) {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Text to encrypt must be a non-empty string');
    }
    
    const encrypted = crypto.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error.message);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text using AES decryption
 * @function decrypt
 * @param {string} encryptedText - Encrypted text to decrypt
 * @returns {string} Decrypted plain text
 * @throws {Error} If decryption fails
 */
function decrypt(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== 'string') {
      throw new Error('Encrypted text must be a non-empty string');
    }
    
    const bytes = crypto.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(crypto.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Failed to decrypt - invalid encrypted text or key');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Test encryption/decryption functionality
 * @function testEncryption
 * @returns {boolean} True if test passes
 */
function testEncryption() {
  try {
    const testText = 'test-api-key-12345678';
    const encrypted = encrypt(testText);
    const decrypted = decrypt(encrypted);
    
    const success = testText === decrypted;
    if (success) {
      console.log('Encryption service test: PASSED');
    } else {
      console.error('Encryption service test: FAILED - text mismatch');
    }
    
    return success;
  } catch (error) {
    console.error('Encryption service test: FAILED -', error.message);
    return false;
  }
}

module.exports = {
  encrypt,
  decrypt,
  testEncryption
};
