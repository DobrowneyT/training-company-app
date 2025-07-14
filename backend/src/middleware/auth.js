/**
 * @fileoverview Authentication middleware for admin routes
 * @description Provides JWT-based authentication and authorization
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const { prisma } = require('../services/database');

/**
 * JWT secret from environment
 * @type {string}
 */
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Authenticate admin user middleware
 * @function authenticateAdmin
 * @description Verifies JWT token and loads admin user data
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next function
 * @returns {void}
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token.',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Load admin user from database
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        username: true, 
        email: true,
        role: true, 
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    });

    if (!admin) {
      return res.status(401).json({ 
        success: false,
        error: 'Admin user not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({ 
        success: false,
        error: 'Admin account is inactive.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Attach admin data to request
    req.admin = admin;
    
    console.log(`Admin authenticated: ${admin.username} [${admin.id}]`);
    next();
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authentication failed.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Authorize admin role middleware
 * @function authorizeRole
 * @description Checks if admin has required role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
const authorizeRole = (allowedRoles = ['admin']) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.admin.role
      });
    }

    next();
  };
};

/**
 * Generate JWT token for admin user
 * @function generateToken
 * @param {Object} admin - Admin user object
 * @param {string} admin.id - Admin user ID
 * @param {string} admin.username - Admin username
 * @param {string} admin.role - Admin role
 * @returns {string} JWT token
 */
function generateToken(admin) {
  const payload = {
    id: admin.id,
    username: admin.username,
    role: admin.role
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'training-company-api',
    audience: 'training-company-admin'
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify JWT token without middleware (for testing)
 * @function verifyToken
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

module.exports = {
  authenticateAdmin,
  authorizeRole,
  generateToken,
  verifyToken
};
