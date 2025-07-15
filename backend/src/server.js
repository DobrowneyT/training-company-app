/**
 * @fileoverview Enhanced Express server with BigInt serialization support and frontend serving
 * @description Main server file with global BigInt handling and React app serving
 * @version 2.1.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const { setupBigIntSerialization, bigIntMiddleware } = require('./utils/bigIntSerializer');
require('dotenv').config();

// Setup global BigInt serialization before anything else
setupBigIntSerialization();

const app = express();
const PORT = process.env.PORT || 3001;

// Security and basic middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://training-company-app-production.up.railway.app'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global BigInt serialization middleware
app.use(bigIntMiddleware);

// Serve static files from React build (frontend/dist)
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    environment: process.env.NODE_ENV || 'development',
    bigIntSupport: 'enabled',
    staticFiles: 'enabled',
    frontendPath: frontendPath
  });
});

// Catch-all handler for React Router (must be after API routes)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method
    });
  }
  
  // Serve React app for all other routes
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle BigInt serialization errors specifically
  if (err.message && err.message.includes('BigInt')) {
    console.error('BigInt serialization error:', err);
    return res.status(500).json({ 
      error: 'Data serialization error',
      message: 'Large number formatting issue'
    });
  }
  
  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    console.error('Prisma error:', err.code, err.message);
    return res.status(500).json({ 
      error: 'Database error',
      message: 'Database operation failed'
    });
  }
  
  // Generic error response
  res.status(err.status || 500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Enhanced server running on port ${PORT}`);
  console.log(`📋 API documentation: http://localhost:${PORT}/api`);
  console.log(`🔢 BigInt serialization: enabled`);
  console.log(`📁 Frontend static files: ${frontendPath}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});