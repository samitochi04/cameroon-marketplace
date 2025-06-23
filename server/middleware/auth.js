const jwt = require('jsonwebtoken');
const supabase = require('../supabase/supabaseClient');

// Middleware to verify Supabase JWT tokens
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Invalid token format.' 
      });
    }
      // Verify the JWT token with Supabase's JWT secret
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    
    console.log('JWT decoded:', decoded); // Debug log
    
    // Additional verification: check if user exists and is active
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', decoded.sub)
      .single();
    
    console.log('User from database:', user); // Debug log
    
    if (error || !user) {
      console.log('User lookup error:', error); // Debug log
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. User not found.' 
      });
    }
    
    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired.' 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Authentication error.' 
    });
  }
};

// Middleware to check if user is a vendor
const requireVendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. Vendor role required.'
  });
};

// Middleware to check if user is a customer
const requireCustomer = (req, res, next) => {
  // In development mode, be more permissive
  if (process.env.DEVELOPMENT_MODE === 'true') {
    return next(); // Allow all authenticated users in development
  }
  
  if (req.user && (req.user.role === 'customer' || req.user.role === 'vendor')) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. Customer role required.'
  });
};

module.exports = {
  authenticateUser,
  requireVendor,
  requireCustomer
};