// /**
//  * @fileoverview Main Express server for Training Company API
//  * @description Sets up Express server with middleware, routes, database, and error handling
//  * @version 1.0.0
//  */

// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const { testConnection } = require('./services/database');
// const routes = require('./routes');
// require('dotenv').config();

// /**
//  * Express application instance
//  * @type {express.Application}
//  */
// const app = express();

// /**
//  * Server port from environment or default
//  * @type {number}
//  */
// const PORT = process.env.PORT || 3001;

// /**
//  * Configure Express middleware
//  */
// // Security middleware
// app.use(helmet({
//     contentSecurityPolicy: {
//         directives: {
//             defaultSrc: ["'self'"],
//             scriptSrc: ["'self'", "'unsafe-inline'"],
//             styleSrc: ["'self'", "'unsafe-inline'"],
//             imgSrc: ["'self'", "data:", "https:"]
//         }
//     }
// }));

// // CORS configuration
// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true
// }));

// // Logging middleware
// app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// /**
//  * Mount API routes
//  */
// app.use('/api', routes);

// /**
//  * Health check endpoint with database connectivity
//  * @route GET /health
//  * @description Returns server health status including database connectivity
//  * @returns {Object} Health status object
//  */
// app.get('/health', async (req, res) => {
//     let dbStatus = 'unknown';
    
//     try {
//         await testConnection();
//         dbStatus = 'connected';
//     } catch (error) {
//         dbStatus = 'disconnected';
//         console.error('Database health check failed:', error.message);
//     }
    
//     res.json({
//         status: 'ok',
//         timestamp: new Date().toISOString(),
//         uptime: process.uptime(),
//         environment: process.env.NODE_ENV || 'development',
//         database: dbStatus
//     });
// });

// /**
//  * Database status endpoint
//  * @route GET /db-status
//  * @description Returns detailed database information
//  * @returns {Object} Database status object
//  */
// app.get('/db-status', async (req, res) => {
//     try {
//         const { prisma } = require('./services/database');
        
//         const [userCount, adminCount, trainingCount, sessionCount] = await Promise.all([
//             prisma.user.count(),
//             prisma.adminUser.count(),
//             prisma.training.count(),
//             prisma.trainingSession.count()
//         ]);
        
//         res.json({
//             status: 'connected',
//             timestamp: new Date().toISOString(),
//             statistics: {
//                 users: userCount,
//                 adminUsers: adminCount,
//                 trainingAssignments: trainingCount,
//                 trainingSessions: sessionCount
//             }
//         });
        
//     } catch (error) {
//         console.error('Database status error:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Database connection failed',
//             error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
//         });
//     }
// });

// /**
//  * Root endpoint - API information
//  * @route GET /
//  * @description Returns basic API information and redirects to /api
//  * @returns {Object} API information object
//  */
// app.get('/', (req, res) => {
//     res.json({
//         name: 'Training Company API Server',
//         version: '1.0.0',
//         description: 'Backend API for Training Company Management Application',
//         status: 'running',
//         endpoints: {
//             api: '/api - Main API endpoints',
//             health: '/health - Server health check',
//             database: '/db-status - Database status and statistics'
//         },
//         documentation: 'Visit /api for endpoint documentation'
//     });
// });

// /**
//  * 404 handler for undefined routes
//  * @param {express.Request} req - Express request object
//  * @param {express.Response} res - Express response object
//  */
// app.use('*', (req, res) => {
//     res.status(404).json({
//         error: 'Endpoint not found',
//         message: `Cannot ${req.method} ${req.originalUrl}`,
//         suggestion: 'Visit /api for available endpoints',
//         availableEndpoints: [
//             'GET /health - Health check',
//             'GET /db-status - Database status', 
//             'GET /api - API documentation',
//             'POST /api/client/verify - Verify API key',
//             'GET /api/client/dashboard/:tornId - User dashboard',
//             'POST /api/admin/login - Admin login',
//             'GET /api/admin/dashboard - Admin dashboard'
//         ]
//     });
// });

// /**
//  * Global error handling middleware
//  * @param {Error} err - Error object
//  * @param {express.Request} req - Express request object
//  * @param {express.Response} res - Express response object
//  * @param {express.NextFunction} next - Express next function
//  */
// app.use((err, req, res, next) => {
//     console.error('Error occurred:', {
//         message: err.message,
//         stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
//         url: req.originalUrl,
//         method: req.method,
//         timestamp: new Date().toISOString()
//     });

//     res.status(err.status || 500).json({
//         error: process.env.NODE_ENV === 'production' 
//             ? 'Internal server error' 
//             : err.message,
//         timestamp: new Date().toISOString()
//     });
// });

// /**
//  * Start the Express server
//  */
// const server = app.listen(PORT, async () => {
//     console.log(`Server Status: Running`);
//     console.log(`Port: ${PORT}`);
//     console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`Health Check: http://localhost:${PORT}/health`);
//     console.log(`Database Status: http://localhost:${PORT}/db-status`);
//     console.log(`API Endpoints: http://localhost:${PORT}/api`);
    
//     // Test database connection on startup
//     try {
//         await testConnection();
//         console.log('Database: Connected and ready');
//     } catch (error) {
//         console.error('Database: Connection failed on startup');
//         console.error('Error:', error.message);
//     }
    
//     // Test services on startup
//     try {
//         const userService = require('./services/userService');
//         await userService.testService();
        
//         const adminService = require('./services/adminService');
//         await adminService.testService();
        
//         const tornAPI = require('./services/tornAPI');
//         await tornAPI.testConnection();
        
//         console.log('Services: All tests passed');
//     } catch (error) {
//         console.error('Services: Some tests failed -', error.message);
//     }
// });

// /**
//  * Graceful shutdown handling
//  */
// process.on('SIGTERM', () => {
//     console.log('SIGTERM received, shutting down gracefully');
//     server.close(() => {
//         console.log('Process terminated');
//     });
// });

// process.on('SIGINT', () => {
//     console.log('SIGINT received, shutting down gracefully');
//     server.close(() => {
//         console.log('Process terminated');
//     });
// });

// module.exports = app;


/**
 * Express Server with Fixed CORS Configuration
 * Allows both Vite dev server (5173) and potential production ports
 * 
 * @file backend/src/server.js
 * @author Training Company App
 * @version 2.0.1 (CORS Fixed)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * CORS Configuration - Fixed to allow Vite development server
 */
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite dev server (default)
    'http://localhost:3000',  // Create React App (backup)
    'http://localhost:4173',  // Vite preview server
    'http://127.0.0.1:5173',  // Alternative localhost
    'http://127.0.0.1:3000',  // Alternative localhost
    'http://127.0.0.1:4173'   // Alternative localhost
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false // Allow CORS requests
}));
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    cors: 'enabled'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Training Company API',
    version: '2.0.1',
    status: 'running',
    endpoints: {
      health: '/health',
      client: '/api/client/*',
      admin: '/api/admin/*'
    },
    cors: {
      enabled: true,
      allowedOrigins: corsOptions.origin
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 API documentation: http://localhost:${PORT}/api`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
});