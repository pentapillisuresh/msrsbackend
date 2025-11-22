const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const templeRoutes = require('./routes/temple');
const volunteerRoutes = require('./routes/volunteer');
const invitationRoutes = require('./routes/invitation');
const mediaRoutes = require('./routes/media');
const projectRoutes = require('./routes/project');
const teamRoutes = require('./routes/team');
const governanceRoutes = require('./routes/governance');
const eLibraryRoutes = require('./routes/elibrary');
const uploadRoutes = require('./routes/upload');
const eventCategory = require('./routes/eventCategory');
const AstrologyConsultation = require('./routes/astrologyConsultationRoutes');
const Donation = require('./routes/Donation');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173','http://localhost:5174',],
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
app.use('/api/auth', authRoutes);
app.use('/api/temple', templeRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/invitation', invitationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/elibrary', eLibraryRoutes);
app.use('/api/eventCategory', eventCategory);
app.use('/api/Astrology', AstrologyConsultation);
app.use('/api/upload', uploadRoutes);
app.use('/api/Donation', Donation);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Temple Foundation API is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'Internal Server Error'
  });
});

// 404 handler
app.use(/.*/, (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Temple Foundation API Server is running on port ${PORT}`);
});

module.exports = app;