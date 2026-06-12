const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();
const { createAdminIfNotExists, createCustomAdminFromEnv } = require('./utils/adminSetup');

// Import database connection
const db = require('./config/database');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const documentRoutes = require('./routes/documentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const donationRoutes = require('./routes/donationRoutes');
const eLibraryRoutes = require('./routes/eLibraryRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const boardRoutes = require('./routes/boardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reportRoutes = require('./routes/reportRoutes');
const messageRoutes = require('./routes/messageRoutes');
const accessLogRoutes = require('./routes/accessLogRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const blogRoutes = require('./routes/blogRoutes');

const { Error } = require('sequelize');

const app = express();

// Security middleware
// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174',],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files middleware for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test database connection and sync models
const initializeDatabase = async () => {
  try {
    await db.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    await db.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Initialize database
initializeDatabase();

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/e-library', eLibraryRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/access-logs', accessLogRoutes);
app.use('/api/blogs', blogRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Temple Foundation API is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);


// 404 handler
app.use(/.*/, (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Function to initialize application
const initializeApp = async () => {
  try {
    // Create admin user based on environment
    if (process.env.USE_CUSTOM_ADMIN === 'true') {
      await createCustomAdminFromEnv();
    } else {
      await createAdminIfNotExists();
    }
  } catch (err) {
    console.error("server Error:::", err)
  }
}

initializeApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Temple Foundation API Server is running on port ${PORT}`);
});

module.exports = app;