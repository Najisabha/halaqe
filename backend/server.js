import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { testConnection, syncDatabase } from './models/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Halaqe API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Sync database (create tables if they don't exist)
    await syncDatabase(false); // Set to true to drop and recreate tables

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🚀 Halaqe Backend Server Started    ║
║                                        ║
║   📍 Port: ${PORT}                       ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}       ║
║   🗄️  Database: Connected              ║
║                                        ║
║   API: http://localhost:${PORT}/api      ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
