# 🏋️ Training Company Management Dashboard

A professional web application for managing Torn City training companies with real-time progress tracking, client dashboards, and admin management tools.

## 🌐 Live Application

**Production URL**: [Your Railway URL Here]

- **Client Dashboard**: Access with your Torn City API key
- **Admin Panel**: JWT-based secure authentication
- **Mobile Optimized**: Responsive design for all devices

## 🚀 Features

### Client Features
- ✅ **Secure API Key Authentication** - Torn City API integration
- ✅ **Real-time Training Status** - Current assignments and progress
- ✅ **Work Statistics Display** - Manual Labor, Intelligence, Endurance
- ✅ **Auto-refresh Capability** - Live data updates every 5 minutes
- ✅ **Mobile-First Design** - Professional responsive interface
- ✅ **Session Persistence** - Automatic login state management

### Admin Features (Planned)
- 📋 **User Management** - View and manage all trainees
- 📋 **Training Assignment** - Assign specific stat training with targets
- 📋 **Progress Tracking** - Monitor completion and payment status
- 📋 **Analytics Dashboard** - Performance insights and reporting
- 📋 **Discord Integration** - Automated notifications and commands

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL (Railway managed)
- **ORM**: Prisma
- **Authentication**: JWT tokens + API key encryption
- **Security**: CORS, Helmet, rate limiting

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5.x (enhanced performance)
- **Styling**: Tailwind CSS
- **State Management**: React Context + hooks
- **HTTP Client**: Axios with interceptors

### Deployment
- **Platform**: Railway.app
- **Database**: PostgreSQL (managed)
- **Domain**: Custom Railway domain
- **CI/CD**: Automatic deployment from GitHub

## 🏗️ Project Structure

```
training-company-app/
├── 📁 backend/                 # Express.js API server
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Route handlers
│   │   ├── 📁 middleware/      # Authentication & validation
│   │   ├── 📁 routes/          # API route definitions
│   │   ├── 📁 services/        # Business logic & integrations
│   │   └── 📄 server.js        # Main server file
│   ├── 📁 prisma/              # Database schema & migrations
│   └── 📄 package.json
│
├── 📁 frontend/                # React client application
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable React components
│   │   ├── 📁 pages/           # Page-level components
│   │   ├── 📁 context/         # React Context providers
│   │   ├── 📁 services/        # API communication
│   │   └── 📄 App.jsx          # Main application component
│   └── 📄 package.json
│
├── 📄 README.md                # This file
├── 📄 package.json             # Root deployment configuration
└── 📄 railway.json             # Railway deployment settings
```

## 🔧 Development Setup

### Prerequisites
- **Node.js**: 20.11.0+ LTS
- **npm**: 10.2.4+
- **Git**: Latest version
- **nvm**: For Node version management (recommended)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/training-company-app.git
   cd training-company-app
   ```

2. **Use correct Node version**
   ```bash
   nvm use 20
   # or nvm use (if .nvmrc exists)
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your values:
   # JWT_SECRET=your-jwt-secret
   # ENCRYPTION_KEY=your-encryption-key
   # DATABASE_URL="file:./dev.db"
   ```

5. **Set up database**
   ```bash
   # Run migrations
   npx prisma migrate dev
   
   # Seed with sample data
   npx prisma db seed
   
   # Open Prisma Studio (optional)
   npx prisma studio
   ```

6. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

7. **Start development servers**
   ```bash
   # Terminal 1: Backend (from backend/ directory)
   npm run dev
   
   # Terminal 2: Frontend (from frontend/ directory)  
   npm run dev
   ```

8. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3001
   - **API Health**: http://localhost:3001/health

## 🔄 Development Workflow

### Feature Development
```bash
# 1. Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. Develop and test locally
# ... make changes ...
# Test: http://localhost:5173

# 3. Commit changes
git add .
git commit -m "Add: describe your feature"

# 4. Push feature branch
git push -u origin feature/your-feature-name

# 5. Create Pull Request on GitHub
# Base: main ← Compare: feature/your-feature-name

# 6. Merge PR to trigger deployment
# Railway automatically deploys on push to main
```

### Testing Checklist
- ✅ **Local Testing**: Both servers running correctly
- ✅ **API Endpoints**: Health check and authentication working
- ✅ **Frontend Features**: All UI components functional
- ✅ **Mobile Responsive**: Test on different screen sizes
- ✅ **Cross-browser**: Chrome, Firefox, Safari compatibility
- ✅ **Error Handling**: Proper error messages and recovery

## 🚀 Deployment

### Automatic Deployment
- **Trigger**: Push to `main` branch
- **Platform**: Railway.app
- **Duration**: ~3-5 minutes
- **Monitoring**: Railway dashboard shows real-time logs

### Environment Variables (Railway)
```bash
# Required environment variables:
JWT_SECRET=your-generated-jwt-secret
ENCRYPTION_KEY=your-generated-encryption-key
NODE_ENV=production
PORT=3001
TORN_API_RATE_LIMIT=100

# Auto-provided by Railway:
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Manual Deployment
If needed, trigger manual deployment:
1. Go to Railway dashboard
2. Select your service
3. Go to "Settings" → "Redeploy"

## 📊 API Documentation

### Client Endpoints
```bash
# Authentication
POST /api/client/verify
Body: { "apiKey": "16-character-key" }

# Dashboard Data  
GET /api/client/dashboard/:tornId

# Current Stats
GET /api/client/stats/:tornId

# Health Check
GET /api/health
```

### Admin Endpoints (Planned)
```bash
# Authentication
POST /api/admin/login
Body: { "username": "admin", "password": "password" }

# User Management
GET /api/admin/users
POST /api/admin/users/:id/training
PUT /api/admin/users/:id/training/progress

# Analytics
GET /api/admin/stats
```

## 🗄️ Database Schema

### Core Tables
- **Users**: Torn City user data with encrypted API keys
- **Training**: Training assignments and progress tracking
- **TrainingSession**: Audit trail of all training activities
- **AdminUser**: Secure admin authentication and roles

### Relationships
- User → Training (one-to-many)
- Training → TrainingSession (one-to-many)
- User → TrainingSession (one-to-many)

## 🔒 Security Features

- **API Key Encryption**: AES-256 encryption for Torn API keys
- **JWT Authentication**: Secure admin sessions with expiration
- **Password Hashing**: bcrypt with salt rounds for admin accounts
- **CORS Protection**: Configured for specific origins only
- **Rate Limiting**: Torn API request throttling
- **Input Validation**: Comprehensive data sanitization
- **HTTPS Enforced**: SSL certificates in production

## 📱 Mobile Support

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Touch Optimization**: Large tap targets and smooth interactions
- **Performance**: Optimized for slower mobile connections
- **PWA Ready**: Service worker and manifest prepared

## 🧪 Testing

### Local Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test

# E2E tests
npm run test:e2e
```

### Production Testing
- **Live URL Testing**: Verify all features work on deployed site
- **Mobile Testing**: Test on actual mobile devices
- **Load Testing**: Monitor performance under usage
- **Security Testing**: Verify authentication and data protection

## 📈 Monitoring

### Railway Monitoring
- **Deployment Logs**: Real-time build and runtime logs
- **Resource Usage**: CPU, memory, and bandwidth monitoring
- **Uptime Tracking**: Service availability metrics
- **Cost Monitoring**: Track usage against $5 monthly limit

### Application Monitoring
- **Error Tracking**: Console errors and API failures
- **Performance Metrics**: Page load times and API response times
- **User Analytics**: Usage patterns and feature adoption

## 🔧 Troubleshooting

### Common Issues

**Deployment Failures**
```bash
# Check Railway logs for specific errors
# Common fixes:
- Verify environment variables are set
- Check for dependency conflicts
- Ensure port configuration is correct
```

**Local Development Issues**
```bash
# Backend not starting
- Check Node version (use nvm use 20)
- Verify database connection
- Check environment variables

# Frontend not loading
- Clear browser cache
- Check if backend is running
- Verify proxy configuration
```

**API Connection Issues**
```bash
# CORS errors
- Verify frontend URL in backend CORS config
- Check environment variables
- Confirm ports are correct
```

## 🚧 Roadmap

### Phase 1: Admin System (Next)
- [ ] Admin authentication and dashboard
- [ ] User management interface  
- [ ] Training assignment workflow
- [ ] Progress tracking and updates

### Phase 2: Enhanced Features
- [ ] Advanced analytics and reporting
- [ ] Discord bot integration
- [ ] Automated notifications
- [ ] Bulk operations and CSV export

### Phase 3: Advanced Features
- [ ] Multi-company support
- [ ] Advanced user roles and permissions
- [ ] API rate limiting and quotas
- [ ] Advanced security features

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`  
5. **Open Pull Request**

### Code Standards
- **ESLint**: Follow configured linting rules
- **Prettier**: Use consistent code formatting
- **JSDoc**: Document all functions with proper comments
- **Testing**: Include tests for new features
- **Security**: Follow secure coding practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/yourusername/training-company-app/issues)
- **Documentation**: Check this README and code comments
- **Railway Support**: [Railway Documentation](https://docs.railway.app)

### Development Environment
- **Node.js**: 20.11.0+ LTS required
- **Railway**: Free tier provides $5 monthly credit
- **GitHub**: Repository and CI/CD integration
- **VS Code**: Recommended IDE with extensions

## 📊 Project Status

- ✅ **Backend API**: Complete with authentication and data management
- ✅ **Client Dashboard**: Functional with real-time data
- ✅ **Database**: PostgreSQL with comprehensive schema
- ✅ **Deployment**: Automated Railway deployment working
- 🔄 **Admin Panel**: In development
- 📋 **Discord Integration**: Planned
- 📋 **Advanced Analytics**: Planned

---

**Last Updated**: July 2025  
**Version**: 1.0.0  
**Deployment**: Railway.app  
**Status**: 🟢 Production Ready