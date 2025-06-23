const express = require('express');
const cors = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/payment.routes');
const vendorRoutes = require('./routes/vendorRoutes');
const cronJobService = require('./services/cronJobService');

const app = express();

// CORS configuration based on StackOverflow solutions
app.use(cors({
  origin: ['http://ts4880w8k0kkok8ow4kg8os4.31.97.68.94.sslip.io', 'http://wc8ckowgg08wk40og04kwk4o.31.97.68.94.sslip.io'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add additional headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/vendor', vendorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cronJobs: cronJobService.getJobsStatus()
  });
});

// Admin endpoint to manually trigger stock check (for testing)
app.post('/api/admin/stock-check', async (req, res) => {
  try {
    const result = await cronJobService.manualStockCheck();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Admin endpoint to manually trigger delayed order check (for testing)
app.post('/api/admin/delayed-order-check', async (req, res) => {
  try {
    const result = await cronJobService.manualDelayedOrderCheck();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start cron jobs
  setTimeout(() => {
    cronJobService.startJobs();
  }, 2000); // Wait 2 seconds for server to fully start
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  cronJobService.stopJobs();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  cronJobService.stopJobs();
  process.exit(0);
});