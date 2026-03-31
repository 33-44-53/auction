require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = require('./prisma');

const authRoutes = require('./routes/auth');
const tenderRoutes = require('./routes/tender');
const groupRoutes = require('./routes/group');
const bidderRoutes = require('./routes/bidder');
const exportRoutes = require('./routes/export');
const auditRoutes = require('./routes/audit');
const statsRoutes = require('./routes/stats');
const usersRoutes = require('./routes/users');
const seedRoutes = require('./routes/seed');

const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const { auditLogger } = require('./middleware/audit');

const app = express();

// Middleware - CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://auction-diredawa.vercel.app'
];

// Add FRONTEND_URL from environment if it exists
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // In production, if FRONTEND_URL is not set, allow the Vercel domain
    if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
      console.warn('⚠️ FRONTEND_URL not set, allowing Vercel domain by default');
      if (origin.includes('vercel.app') || origin.includes('auction-diredawa')) {
        return callback(null, true);
      }
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make prisma available to routes
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenders', authenticate, tenderRoutes);
app.use('/api/groups', authenticate, groupRoutes);
app.use('/api/bidders', authenticate, bidderRoutes);
app.use('/api/export', authenticate, exportRoutes);
app.use('/api/audit', authenticate, auditRoutes);
app.use('/api/stats', authenticate, statsRoutes);
app.use('/api/users', authenticate, usersRoutes);
app.use('/api/seed', seedRoutes); // TEMPORARY - Remove after seeding production

// Root route - API info
app.get('/', (req, res) => {
  res.json({
    name: 'Dire Dawa Customs Tender Management API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tenders: '/api/tenders',
      groups: '/api/groups',
      bidders: '/api/bidders',
      export: '/api/export',
      audit: '/api/audit',
      stats: '/api/stats',
      users: '/api/users'
    },
    frontend: process.env.FRONTEND_URL || 'Not configured',
    documentation: 'See README.md for API documentation'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('\n🚀 ====================================');
  console.log(`   Tender Management API`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   CORS Allowed Origins:`);
  allowedOrigins.forEach(origin => console.log(`     - ${origin}`));
  console.log('======================================\n');
});

// Handle port already in use and other server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Run: npx kill-port ${PORT}  (or change PORT in .env)\n`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});

// Graceful shutdown on SIGTERM (production) and SIGINT (Ctrl+C)
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Bye!\n');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;