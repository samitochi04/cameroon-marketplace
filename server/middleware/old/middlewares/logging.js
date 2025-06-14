const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
  write: (message) => logger.info(message.trim()),
};

// Setup morgan middleware
module.exports = morgan(
  // Use predefined format for non-production environments
  process.env.NODE_ENV !== 'production' ? 'dev' : 'combined',
  { stream }
);