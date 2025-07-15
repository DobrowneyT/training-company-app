# Training Company Management Application

A comprehensive full-stack web application for managing Torn City training companies with real-time progress tracking, client dashboards, and admin management tools.

## Live Deployment
- **Production URL**: https://training-company-app-production.up.railway.app/
- **Platform**: Railway.app (PostgreSQL + Node.js)
- **Status**: ✅ FULLY OPERATIONAL

## Current Status

### ✅ **COMPLETED (Phase 1)**
- **Client Dashboard**: Fully functional with Torn API key authentication
- **Backend API**: Complete Express.js server with PostgreSQL database
- **Database Schema**: Production-ready with user, training, and admin models
- **Frontend/Backend Integration**: Network configuration resolved, production deployment working
- **Smart Environment Detection**: Automatic local/production configuration switching
- **Security Implementation**: JWT authentication, API key encryption, comprehensive error handling
- **Admin Backend Routes**: Complete REST API for admin functionality

### 🔄 **IN PROGRESS (Phase 2)**
- **Admin Panel Frontend**: Implementing admin dashboard UI and authentication

### 📋 **IMMEDIATE NEXT STEPS**
1. **Admin Authentication UI**: Login page with JWT token management
2. **Admin Dashboard**: Overview of all trainees and company statistics  
3. **User Management Interface**: View, add, edit trainee assignments
4. **Training Management**: Create/update training assignments, track progress

### 🎯 **FUTURE PHASES**
- **Phase 3**: Enhanced Features (payment tracking, advanced analytics)
- **Phase 4**: Discord Bot Integration
- **Phase 5**: Multi-company Support

## Architecture Overview

### Technology Stack
- **Backend**: Node.js 20 LTS, Express.js, Prisma ORM
- **Database**: PostgreSQL (production), SQLite (local development)
- **Frontend**: React 18, Vite 5.x, Tailwind CSS
- **Authentication**: JWT tokens, encrypted API key storage
- **Deployment**: Railway.app with automatic CI/CD

### Application Structure
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │───▶│  Express API    │───▶│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Torn City     │
                    │      API        │
                    └─────────────────┘
```

## Project Structure

```
training-company-app/
├── 📁 backend/                    # Express.js API server
│   ├── 📁 src/
│   │   ├── 📁 controllers/        # Route handlers
│   │   ├── 📁 middleware/         # Auth, validation, CORS
│   │   ├── 📁 routes/             # API routes (client + admin)
│   │   ├── 📁 services/           # Business logic & integrations
│   │   └── 📄 server.js           # Main server (serves frontend in production)
│   ├── 📁 prisma/                 # Database schema & migrations
│   │   ├── 📄 schema.prisma       # Complete database model
│   │   └── 📄 seed.js             # Initial data seeding
│   ├── 📁 scripts/                # Smart database setup
│   └── 📄 package.json            # Backend dependencies
│
├── 📁 frontend/                   # React client application
│   ├── 📁 src/
│   │   ├── 📁 components/         # React components
│   │   │   ├── 📁 client/         # Client dashboard components
│   │   │   ├── 📁 admin/          # Admin panel components (in development)
│   │   │   ├── 📁 common/         # Shared components
│   │   │   └── 📁 layout/         # Layout components
│   │   ├── 📁 pages/              # Page components
│   │   ├── 📁 context/            # React Context providers
│   │   ├── 📁 services/           # API communication
│   │   └── 📄 App.jsx             # Main application
│   └── 📄 package.json            # Frontend dependencies
│
├── 📄 package.json                # Root deployment configuration
├── 📄 README.md                   # This documentation
└── 📄 railway.json                # Railway deployment config
```

## Development Setup

### Prerequisites
- Node.js 20+ LTS
- Git
- Visual Studio Code (recommended)

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd training-company-app

# Install dependencies
npm install

# Setup environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Start development servers
npm run dev:backend    # Backend API (port 3001)
npm run dev:frontend   # Frontend dev server (port 5173)
```

### Environment Variables

**Backend (.env):**
```bash
DATABASE_URL="file:./dev.db"                    # SQLite for local development
JWT_SECRET="your-super-secret-jwt-key"
ENCRYPTION_KEY="your-32-character-encryption-key"
TORN_API_RATE_LIMIT=1000
NODE_ENV=development
```

**Frontend (.env.development):**
```bash
VITE_API_URL=/api
VITE_DEBUG_MODE=true
```

## API Documentation

### Client Endpoints
- `POST /api/client/verify` - Verify Torn API key and register user
- `GET /api/client/dashboard/:tornId` - Get user training data and stats

### Admin Endpoints (JWT Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard` - Admin dashboard with all users and statistics
- `GET /api/admin/users` - List all registered users
- `POST /api/admin/users/:id/training` - Assign training to user
- `PUT /api/admin/users/:id/training/progress` - Update training progress

### Debug Endpoints
- `GET /api/debug/test-connectivity` - Test network connectivity
- `GET /api/debug/test-http` - Test HTTP connections
- `POST /api/debug/test-api-key` - Test Torn API key verification

## Database Schema

### Core Models
- **User**: Torn City integration with encrypted API keys
- **Training**: Assignment tracking with progress monitoring
- **TrainingSession**: Complete audit trail of activities
- **AdminUser**: Secure admin authentication and authorization

### Features
- **Smart Environment Switching**: Automatic SQLite (local) ↔ PostgreSQL (production)
- **Encrypted API Storage**: AES-256 encryption for sensitive data
- **Comprehensive Logging**: Full audit trail of all operations
- **Rate Limiting**: Protection against API abuse

## Security Features

- **API Key Encryption**: AES-256 for Torn API keys in database
- **JWT Authentication**: Secure admin sessions with token expiration
- **Password Hashing**: bcrypt with salt rounds for admin accounts
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Comprehensive data sanitization
- **Environment Variables**: Secure secrets management
- **Rate Limiting**: Torn API abuse prevention

## Deployment

### Production Deployment (Railway.app)
```bash
# Deploy to Railway
git push origin main    # Automatic deployment
```

### Local Production Testing
```bash
# Build and preview
npm run build
npm run preview
```

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure all tests pass locally
4. Submit pull request for review
5. Deploy via Railway after approval

### Code Standards
- **JavaScript**: ES6+ with JSDoc comments
- **React**: Functional components with hooks
- **API**: RESTful design with comprehensive error handling
- **Database**: Prisma schema-first approach
- **Testing**: Jest for unit tests, Playwright for E2E

## Support

### Troubleshooting
- **Network Issues**: Check `/api/debug/test-connectivity`
- **Database Issues**: Run `npm run db:setup` in backend
- **API Integration**: Test endpoints with `/api/debug/test-api-key`

### Logs and Monitoring
- **Development**: Console logs with detailed debugging
- **Production**: Railway dashboard for application logs
- **Database**: Prisma query logging in development mode

## Project History

- **v1.0.0**: Initial release with client dashboard and backend API
- **v1.1.0**: Production deployment and network configuration fixes
- **v1.2.0**: Admin panel backend implementation (current)
- **v1.3.0**: Admin panel frontend (in development)

## License

Private - All rights reserved