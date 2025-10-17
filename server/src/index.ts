import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

// Import database connection
import connectDatabase from './lib/database';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import favoriteRoutes from './routes/favorites';
import orderRoutes from './routes/orders';
import reviewRoutes from './routes/reviews';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDatabase();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to API routes, but with different limits for different routes
app.use('/api/auth', rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // limit each IP to 1000 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api/products', rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '2000'), // limit each IP to 2000 requests per windowMs
  message: 'Too many requests to products, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api', limiter);

// Allow requests from specific origins
app.use(cors({
  origin: ['https://crm.dvberry.ru', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'X-HTTP-Method-Override', 'X-CSRF-Token'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Apply CORS to static file routes specifically
app.use('/uploads', cors({
  origin: ['https://crm.dvberry.ru', 'http://localhost:3001'],
  credentials: false, // Don't require credentials for static files
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add a pre-flight middleware for all routes
app.options('*', cors({
  origin: ['https://crm.dvberry.ru', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'X-HTTP-Method-Override', 'X-CSRF-Token'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add headers middleware to ensure CORS headers are set for all responses
app.use((req, res, next) => {
  const allowedOrigins = ['https://crm.dvberry.ru', 'http://localhost:3001'];
  const origin = req.headers.origin;
  
  // Set CORS headers for all responses
  if (allowedOrigins.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept, X-HTTP-Method-Override, X-CSRF-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files with custom headers for CORS
app.use('/uploads', (req, res, next) => {
  const allowedOrigins = ['https://crm.dvberry.ru', 'http://localhost:3001'];
  const origin = req.headers.origin;
  
  // Set CORS headers for static files
  if (allowedOrigins.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    // Set cache control headers for images
    res.header('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    const allowedOrigins = ['https://crm.dvberry.ru', 'http://localhost:3001'];
    const origin = res.req.headers.origin;
    if (allowedOrigins.includes(origin as string)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }
}));

app.use('/uploads/thumbnails', (req, res, next) => {
  const allowedOrigins = ['https://crm.dvberry.ru', 'http://localhost:3001'];
  const origin = req.headers.origin;
  
  // Set CORS headers for static files
  if (allowedOrigins.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
}, express.static(path.join(__dirname, '../uploads/thumbnails'), {
  setHeaders: (res, path) => {
    // Set cache control headers for thumbnails
    res.header('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    const allowedOrigins = ['https://crm.dvberry.ru', 'http://localhost:3001'];
    const origin = res.req.headers.origin;
    if (allowedOrigins.includes(origin as string)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
// Removed userRoutes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

export default app;