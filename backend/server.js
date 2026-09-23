require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const autoSeed = require('./seed/autoSeed');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'VaultX API is running 🚀', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/insurance', require('./routes/insurance'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/support', require('./routes/support'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Error:', err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;

// Connect DB, seed if needed, and start listening
connectDB().then(async () => {
  await autoSeed();
  app.listen(PORT, () => {
    console.log(`\n🚀 VaultX API running on port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
  });
}).catch(err => {
  console.error('Fatal database initialization error:', err);
  process.exit(1);
});

module.exports = app;
