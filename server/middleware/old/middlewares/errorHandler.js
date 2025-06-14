const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  // Log error
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);

  // Default error status is 500
  const statusCode = err.statusCode || 500;
  
  // Response
  res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};