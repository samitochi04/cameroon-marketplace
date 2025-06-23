const express = require('express');
const cors = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/payment.routes');
const vendorRoutes = require('./routes/vendorRoutes');
const cronJobService = require('./services/cronJobService');

const app = express();

// Simplified CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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