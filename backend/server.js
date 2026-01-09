const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const http = require('http');
const { initializeSocket } = require('./src/config/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initializeSocket(server);

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const detailerRoutes = require('./src/routes/detailerRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const customerReviewRoutes = require('./src/routes/customerReviewRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use('/api', limiter);

// More strict rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 auth requests per hour
    message: {
        message: 'Too many login/registration attempts, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/auth', authLimiter);

// Stripe Webhook requires raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/detailer', detailerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/customer-reviews', customerReviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/chat', chatRoutes);

const AppError = require('./src/utils/AppError');
const errorHandler = require('./src/middleware/errorMiddleware');

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Car Detailing API is running', status: 'OK' });
});

// Handle Undefined Routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
