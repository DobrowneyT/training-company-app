/**
 * @fileoverview Main Express server for Training Company API
 * @description Sets up Express server with middleware, routes, and error handling
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

/**
 * Server port from environment or default
 * @type {number}
 */
const PORT = process.env.PORT || 3001;

/**
 * Configure Express middleware
 */
// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Health check endpoint
 * @route GET /health
 * @description Returns server health status
 * @returns {Object} Health status object
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * API information endpoint
 * @route GET /
 * @description Returns basic API information
 * @returns {Object} API information object
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Training Company API',
        version: '1.0.0',
        description: 'Backend API for Training Company Management Application',
        status: 'running',
        documentation: '/api/docs'
    });
});

/**
 * 404 handler for undefined routes
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableEndpoints: [
            'GET /health - Health check',
            'GET / - API information'
        ]
    });
});

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next function
 */
app.use((err, req, res, next) => {
    console.error('Error occurred:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        timestamp: new Date().toISOString()
    });
});

/**
 * Start the Express server
 */
const server = app.listen(PORT, () => {
    console.log(`Server Status: Running`);
    console.log(`Port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
    console.log(`API Info: http://localhost:${PORT}/`);
});

/**
 * Graceful shutdown handling
 */
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;
