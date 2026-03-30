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

const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const { auditLogger } = require('./middleware/audit');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://your-app.vercel.app' // Replace with your actual Vercel URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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