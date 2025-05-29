const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const routes = require('./routes');
const loggingMiddleware = require('./middleware/logging');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create logs directory
const fs = require('fs');
const path = require('path');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(loggingMiddleware); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cameroon Marketplace API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});