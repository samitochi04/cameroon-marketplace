# Step 2: Backend Development

This document provides detailed instructions for setting up and developing the backend of our multi-vendor e-commerce platform using Express.js, Supabase, and JavaScript.

## Prerequisites

Ensure you have the following installed on your system:
- Node.js (v16 or newer)
- npm or yarn
- Git
- Supabase account (https://supabase.com)

## 1. Setup Express.js Server Structure with JavaScript

### 1.1 Initialize a Node.js project in the server directory

```bash
# Navigate to the server directory
cd server

# Initialize a new Node.js project
npm init -y

# Install core dependencies
npm install express dotenv cors helmet express-validator

# Install development dependencies
npm install -D nodemon eslint prettier eslint-config-prettier eslint-plugin-prettier
```

### 1.2 Create the basic server structure

Create a `server.js` file in the root of your server directory:

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cameroon Marketplace API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 1.3 Create a .env file for the server

```bash
touch .env
```

Add the following to the `.env` file:

```
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret_key
```

### 1.4 Create an appropriate folder structure

```bash
# For Windows Command Prompt
mkdir config routes controllers middleware services utils models

# For PowerShell
New-Item -ItemType Directory -Force -Path config, routes, controllers, middleware, services, utils, models

# For Git Bash
mkdir -p config routes controllers middleware services utils models
```

### 1.5 Configure package.json scripts

Update the `package.json` in the server directory:

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\package.json
{
  "name": "cameroon-marketplace-api",
  "version": "1.0.0",
  "description": "Backend API for Cameroon Marketplace",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  // ...rest of the package.json
}
```

## 2. Design and Implement RESTful API Architecture

### 2.1 Create a versioned API structure

Create a folder for API versioning:

```bash
mkdir -p routes/v1
```

### 2.2 Create index.js for API routes

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\routes\index.js
const express = require('express');
const v1Routes = require('./v1');

const router = express.Router();

router.use('/v1', v1Routes);

module.exports = router;
```

### 2.3 Create the routes file for v1

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\routes\v1\index.js
const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const vendorRoutes = require('./vendor.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const categoryRoutes = require('./category.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
```

### 2.4 Create individual route files for each resource

Example for auth routes:

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\routes\v1\auth.routes.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../../controllers/auth.controller');
const validate = require('../../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    validate,
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
```

### 2.5 Create controllers for handling business logic

Example for auth controller:

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\controllers\auth.controller.js
const supabase = require('../config/supabase');
const { generateTokens } = require('../utils/auth');

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Register user using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in user using Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: error.message,
      });
    }

    // Generate access and refresh tokens
    const tokens = generateTokens(data.user);

    // Return success response with tokens
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata.role || 'customer',
        },
        tokens,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// Other auth controller methods...
exports.refreshToken = async (req, res) => {
  // Implementation
};

exports.logout = async (req, res) => {
  // Implementation
};

exports.forgotPassword = async (req, res) => {
  // Implementation
};

exports.resetPassword = async (req, res) => {
  // Implementation
};
```

### 2.6 Update the main server.js file to use the routes

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const routes = require('./routes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 3. Configure Middleware (CORS, Authentication, Logging, Error Handling)

### 3.1 Create a validation middleware

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\middleware\validate.js
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
```

### 3.2 Create an authentication middleware

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\middleware\auth.js
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Token is invalid' });
    }

    // Set user to req object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Token is invalid' });
  }
};
```

### 3.3 Create a role-based authorization middleware

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\middleware\authorize.js
// Middleware to check if user has required role
module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized - User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden - You do not have permission to access this resource',
      });
    }

    next();
  };
};
```

### 3.4 Set up logging with Morgan and Winston

First, install the dependencies:

```bash
npm install morgan winston
```

Create a logger utility:

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\utils\logger.js
const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Write logs to console
    new winston.transports.Console(),
    // Write errors to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;
```

Set up Morgan for HTTP request logging:

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\middleware\logging.js
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
```

### 3.5 Create an error handling middleware

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\middleware\errorHandler.js
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
```

### 3.6 Update server.js to use the middleware

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\server.js
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
```

## 4. Setup Supabase Connection and Integration

### 4.1 Install Supabase client:

```bash
npm install @supabase/supabase-js
```

### 4.2 Create Supabase configuration file:

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\config\supabase.js
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service key for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;
```

### 4.3 Create database service modules:

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\services\user.service.js
const supabase = require('../config/supabase');

class UserService {
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'customer',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('User service - Create user error:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('User service - Get user error:', error);
      throw error;
    }
  }

  // Other user-related database operations
}

module.exports = new UserService();
```

### 4.4 Set up utilities for token generation and authentication:

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\utils\auth.js
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  // Generate access token
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.user_metadata.role || 'customer',
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

module.exports = {
  generateTokens,
};
```

## 5. Implement Role-based Access Control (Vendors, Customers, Admins)

### 5.1 Create the database schema for users with roles

First, create these tables in Supabase:

**Users Table**:
- id (uuid, primary key)
- email (text, unique)
- name (text)
- role (text, default: 'customer')
- created_at (timestamp)
- updated_at (timestamp)

**Roles Table**:
- id (uuid, primary key)
- name (text, unique) - e.g., 'customer', 'vendor', 'admin'
- permissions (json array)
- created_at (timestamp)

### 5.2 Create a user model

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\models\user.model.js
const supabase = require('../config/supabase');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role || 'customer';
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new User(data);
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return new User(data);
  }

  async save() {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: this.id,
        email: this.email,
        name: this.name,
        role: this.role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new User(data);
  }

  hasRole(role) {
    return this.role === role;
  }

  // Additional methods as needed
}

module.exports = User;
```

### 5.3 Update the auth controller to handle roles

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\controllers\auth.controller.js
const supabase = require('../config/supabase');
const { generateTokens } = require('../utils/auth');
const userService = require('../services/user.service');

exports.register = async (req, res) => {
  try {
    const { email, password, name, role = 'customer' } = req.body;

    // Validate role (only allow customer or vendor during registration)
    if (role !== 'customer' && role !== 'vendor') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    // Register user using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Create user record in our database
    await userService.createUser({
      id: data.user.id,
      email: data.user.email,
      name,
      role,
    });

    // Create vendor profile if role is vendor
    if (role === 'vendor') {
      // We'll implement this later in the vendor management section
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          role,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// ... other controller methods
```

## 6. Develop Vendor Management System

### 6.1 Create vendor tables in Supabase

**Vendors Table**:
- id (uuid, primary key, references users.id)
- store_name (text)
- description (text)
- logo_url (text)
- banner_url (text)
- status (text) - 'pending', 'approved', 'rejected'
- commission_rate (decimal)
- created_at (timestamp)
- updated_at (timestamp)

### 6.2 Create a vendor model

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\models\vendor.model.js
const supabase = require('../config/supabase');

class Vendor {
  constructor(data) {
    this.id = data.id;
    this.storeName = data.store_name;
    this.description = data.description;
    this.logoUrl = data.logo_url;
    this.bannerUrl = data.banner_url;
    this.status = data.status || 'pending';
    this.commissionRate = data.commission_rate || 10.0; // Default 10%
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new Vendor(data);
  }

  static async findByStatus(status) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', status);

    if (error) throw error;
    return data.map(vendor => new Vendor(vendor));
  }

  async save() {
    const { data, error } = await supabase
      .from('vendors')
      .upsert({
        id: this.id,
        store_name: this.storeName,
        description: this.description,
        logo_url: this.logoUrl,
        banner_url: this.bannerUrl,
        status: this.status,
        commission_rate: this.commissionRate,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new Vendor(data);
  }

  async updateStatus(status) {
    this.status = status;
    return this.save();
  }

  // Additional methods as needed
}

module.exports = Vendor;
```

### 6.3 Create vendor service

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\services\vendor.service.js
const supabase = require('../config/supabase');
const Vendor = require('../models/vendor.model');

class VendorService {
  async createVendor(vendorData) {
    try {
      const vendor = new Vendor({
        id: vendorData.id,
        store_name: vendorData.storeName,
        description: vendorData.description,
        logo_url: vendorData.logoUrl,
        banner_url: vendorData.bannerUrl,
        created_at: new Date().toISOString(),
      });
      
      return await vendor.save();
    } catch (error) {
      console.error('Vendor service - Create vendor error:', error);
      throw error;
    }
  }

  async getVendorById(id) {
    try {
      return await Vendor.findById(id);
    } catch (error) {
      console.error('Vendor service - Get vendor error:', error);
      throw error;
    }
  }

  async updateVendor(id, data) {
    try {
      const vendor = await Vendor.findById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      // Update vendor properties
      Object.assign(vendor, {
        storeName: data.storeName || vendor.storeName,
        description: data.description || vendor.description,
        logoUrl: data.logoUrl || vendor.logoUrl,
        bannerUrl: data.bannerUrl || vendor.bannerUrl,
      });

      return await vendor.save();
    } catch (error) {
      console.error('Vendor service - Update vendor error:', error);
      throw error;
    }
  }

  async approveVendor(id) {
    try {
      const vendor = await Vendor.findById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      return await vendor.updateStatus('approved');
    } catch (error) {
      console.error('Vendor service - Approve vendor error:', error);
      throw error;
    }
  }

  async rejectVendor(id) {
    try {
      const vendor = await Vendor.findById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      return await vendor.updateStatus('rejected');
    } catch (error) {
      console.error('Vendor service - Reject vendor error:', error);
      throw error;
    }
  }

  async getPendingVendors() {
    try {
      return await Vendor.findByStatus('pending');
    } catch (error) {
      console.error('Vendor service - Get pending vendors error:', error);
      throw error;
    }
  }

  // Additional methods as needed
}

module.exports = new VendorService();
```

### 6.4 Create vendor controller

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\controllers\vendor.controller.js
const vendorService = require('../services/vendor.service');

exports.registerVendor = async (req, res) => {
  try {
    const { storeName, description } = req.body;
    const userId = req.user.id;

    // Create vendor
    const vendor = await vendorService.createVendor({
      id: userId,
      storeName,
      description,
      logoUrl: req.body.logoUrl || null,
      bannerUrl: req.body.bannerUrl || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Vendor registered successfully, awaiting approval',
      data: vendor,
    });
  } catch (error) {
    console.error('Register vendor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Vendor registration failed',
      error: error.message,
    });
  }
};

exports.getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const vendor = await vendorService.getVendorById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get vendor profile',
      error: error.message,
    });
  }
};

exports.updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const vendor = await vendorService.updateVendor(vendorId, {
      storeName: req.body.storeName,
      description: req.body.description,
      logoUrl: req.body.logoUrl,
      bannerUrl: req.body.bannerUrl,
    });

    return res.status(200).json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: vendor,
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update vendor profile',
      error: error.message,
    });
  }
};

// Admin endpoints for vendor management
exports.getPendingVendors = async (req, res) => {
  try {
    const vendors = await vendorService.getPendingVendors();

    return res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error('Get pending vendors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get pending vendors',
      error: error.message,
    });
  }
};

exports.approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await vendorService.approveVendor(id);

    return res.status(200).json({
      success: true,
      message: 'Vendor approved successfully',
      data: vendor,
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve vendor',
      error: error.message,
    });
  }
};

exports.rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await vendorService.rejectVendor(id);

    return res.status(200).json({
      success: true,
      message: 'Vendor rejected successfully',
      data: vendor,
    });
  } catch (error) {
    console.error('Reject vendor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject vendor',
      error: error.message,
    });
  }
};
```

### 6.5 Create vendor routes

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\routes\v1\vendor.routes.js
const express = require('express');
const vendorController = require('../../controllers/vendor.controller');
const authMiddleware = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Vendor registration and profile management
router.post('/register', authMiddleware, authorize('customer'), vendorController.registerVendor);
router.get('/profile', authMiddleware, authorize('vendor'), vendorController.getVendorProfile);
router.put('/profile', authMiddleware, authorize('vendor'), vendorController.updateVendorProfile);

// Admin vendor management
router.get('/pending', authMiddleware, authorize('admin'), vendorController.getPendingVendors);
router.post('/:id/approve', authMiddleware, authorize('admin'), vendorController.approveVendor);
router.post('/:id/reject', authMiddleware, authorize('admin'), vendorController.rejectVendor);

module.exports = router;
```

## 7. Build Product Catalog Management

### 7.1 Create products and categories tables in Supabase

**Categories Table**:
- id (uuid, primary key)
- name (text)
- slug (text, unique)
- description (text)
- parent_id (uuid, references categories.id)
- created_at (timestamp)
- updated_at (timestamp)

**Products Table**:
- id (uuid, primary key)
- vendor_id (uuid, references vendors.id)
- name (text)
- slug (text, unique)
- description (text)
- price (decimal)
- sale_price (decimal, nullable)
- stock_quantity (integer)
- status (text) - 'draft', 'published', 'archived'
- category_id (uuid, references categories.id)
- images (json array)
- created_at (timestamp)
- updated_at (timestamp)

### 7.2 Create category model

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\models\category.model.js
const supabase = require('../config/supabase');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.parentId = data.parent_id;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new Category(data);
  }

  static async findBySlug(slug) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return new Category(data);
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data.map(category => new Category(category));
  }

  static async findByParentId(parentId) {
    const query = parentId 
      ? supabase.from('categories').select('*').eq('parent_id', parentId) 
      : supabase.from('categories').select('*').is('parent_id', null);
    
    const { data, error } = await query;

    if (error) throw error;
    return data.map(category => new Category(category));
  }

  async save() {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        id: this.id,
        name: this.name,
        slug: this.slug,
        description: this.description,
        parent_id: this.parentId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new Category(data);
  }

  // Additional methods as needed
}

module.exports = Category;
```

### 7.3 Create product model

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\models\product.model.js
const supabase = require('../config/supabase');

class Product {
  constructor(data) {
    this.id = data.id;
    this.vendorId = data.vendor_id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.price = data.price;
    this.salePrice = data.sale_price;
    this.stockQuantity = data.stock_quantity;
    this.status = data.status || 'draft';
    this.categoryId = data.category_id;
    this.images = data.images || [];
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new Product(data);
  }

  static async findBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return new Product(data);
  }

  static async findByVendor(vendorId, status = 'published') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('status', status);

    if (error) throw error;
    return data.map(product => new Product(product));
  }

  static async findByCategory(categoryId, status = 'published') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('status', status);

    if (error) throw error;
    return data.map(product => new Product(product));
  }

  static async search(query, status = 'published') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', status)
      .ilike('name', `%${query}%`);

    if (error) throw error;
    return data.map(product => new Product(product));
  }

  async save() {
    const { data, error } = await supabase
      .from('products')
      .upsert({
        id: this.id,
        vendor_id: this.vendorId,
        name: this.name,
        slug: this.slug,
        description: this.description,
        price: this.price,
        sale_price: this.salePrice,
        stock_quantity: this.stockQuantity,
        status: this.status,
        category_id: this.categoryId,
        images: this.images,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new Product(data);
  }

  async updateStock(quantity) {
    this.stockQuantity = quantity;
    return this.save();
  }

  async publish() {
    this.status = 'published';
    return this.save();
  }

  async archive() {
    this.status = 'archived';
    return this.save();
  }

  // Additional methods as needed
}

module.exports = Product;
```

### 7.4 Create product and category services

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\services\category.service.js
const { v4: uuidv4 } = require('uuid');
const Category = require('../models/category.model');
const slugify = require('../utils/slugify');

class CategoryService {
  async createCategory(data) {
    try {
      const category = new Category({
        id: uuidv4(),
        name: data.name,
        slug: slugify(data.name),
        description: data.description,
        parent_id: data.parentId || null,
        created_at: new Date().toISOString(),
      });

      return await category.save();
    } catch (error) {
      console.error('Category service - Create category error:', error);
      throw error;
    }
  }

  async updateCategory(id, data) {
    try {
      const category = await Category.findById(id);
      if (!category) {
        throw new Error('Category not found');
      }

      // Update category properties
      Object.assign(category, {
        name: data.name || category.name,
        slug: data.name ? slugify(data.name) : category.slug,
        description: data.description || category.description,
        parentId: data.parentId !== undefined ? data.parentId : category.parentId,
      });

      return await category.save();
    } catch (error) {
      console.error('Category service - Update category error:', error);
      throw error;
    }
  }

  async getCategoryById(id) {
    try {
      return await Category.findById(id);
    } catch (error) {
      console.error('Category service - Get category error:', error);
      throw error;
    }
  }

  async getCategoryBySlug(slug) {
    try {
      return await Category.findBySlug(slug);
    } catch (error) {
      console.error('Category service - Get category by slug error:', error);
      throw error;
    }
  }

  async getAllCategories() {
    try {
      return await Category.findAll();
    } catch (error) {
      console.error('Category service - Get all categories error:', error);
      throw error;
    }
  }

  async getTopLevelCategories() {
    try {
      return await Category.findByParentId(null);
    } catch (error) {
      console.error('Category service - Get top level categories error:', error);
      throw error;
    }
  }

  async getSubcategories(parentId) {
    try {
      return await Category.findByParentId(parentId);
    } catch (error) {
      console.error('Category service - Get subcategories error:', error);
      throw error;
    }
  }

  // Additional methods as needed
}

module.exports = new CategoryService();
```

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\services\product.service.js
const { v4: uuidv4 } = require('uuid');
const Product = require('../models/product.model');
const slugify = require('../utils/slugify');

class ProductService {
  async createProduct(data) {
    try {
      const product = new Product({
        id: uuidv4(),
        vendor_id: data.vendorId,
        name: data.name,
        slug: slugify(data.name),
        description: data.description,
        price: data.price,
        sale_price: data.salePrice,
        stock_quantity: data.stockQuantity,
        status: data.status || 'draft',
        category_id: data.categoryId,
        images: data.images || [],
        created_at: new Date().toISOString(),
      });

      return await product.save();
    } catch (error) {
      console.error('Product service - Create product error:', error);
      throw error;
    }
  }

  async updateProduct(id, vendorId, data) {
    try {
      const product = await Product.findById(id);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if the product belongs to the vendor
      if (product.vendorId !== vendorId) {
        throw new Error('Unauthorized: Product does not belong to this vendor');
      }

      // Update product properties
      Object.assign(product, {
        name: data.name || product.name,
        slug: data.name ? slugify(data.name) : product.slug,
        description: data.description || product.description,
        price: data.price !== undefined ? data.price : product.price,
        salePrice: data.salePrice !== undefined ? data.salePrice : product.salePrice,
        stockQuantity: data.stockQuantity !== undefined ? data.stockQuantity : product.stockQuantity,
        status: data.status || product.status,
        categoryId: data.categoryId || product.categoryId,
        images: data.images || product.images,
      });

      return await product.save();
    } catch (error) {
      console.error('Product service - Update product error:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      return await Product.findById(id);
    } catch (error) {
      console.error('Product service - Get product error:', error);
      throw error;
    }
  }

  async getProductBySlug(slug) {
    try {
      return await Product.findBySlug(slug);
    } catch (error) {
      console.error('Product service - Get product by slug error:', error);
      throw error;
    }
  }

  async getProductsByVendor(vendorId, status = 'published') {
    try {
      return await Product.findByVendor(vendorId, status);
    } catch (error) {
      console.error('Product service - Get products by vendor error:', error);
      throw error;
    }
  }

  async getProductsByCategory(categoryId, status = 'published') {
    try {
      return await Product.findByCategory(categoryId, status);
    } catch (error) {
      console.error('Product service - Get products by category error:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      return await Product.search(query);
    } catch (error) {
      console.error('Product service - Search products error:', error);
      throw error;
    }
  }

  async publishProduct(id, vendorId) {
    try {
      const product = await Product.findById(id);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if the product belongs to the vendor
      if (product.vendorId !== vendorId) {
        throw new Error('Unauthorized: Product does not belong to this vendor');
      }

      return await product.publish();
    } catch (error) {
      console.error('Product service - Publish product error:', error);
      throw error;
    }
  }

  async archiveProduct(id, vendorId) {
    try {
      const product = await Product.findById(id);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if the product belongs to the vendor
      if (product.vendorId !== vendorId) {
        throw new Error('Unauthorized: Product does not belong to this vendor');
      }

      return await product.archive();
    } catch (error) {
      console.error('Product service - Archive product error:', error);
      throw error;
    }
  }

  // Additional methods as needed
}

module.exports = new ProductService();
```

### 7.5 Create product and category controllers

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\controllers\category.controller.js
const categoryService = require('../services/category.service');

exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    const category = await categoryService.createCategory({
      name,
      description,
      parentId,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentId } = req.body;

    const category = await categoryService.updateCategory(id, {
      name,
      description,
      parentId,
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await categoryService.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get category',
      error: error.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message,
    });
  }
};

exports.getTopLevelCategories = async (req, res) => {
  try {
    const categories = await categoryService.getTopLevelCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get top level categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get top level categories',
      error: error.message,
    });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subcategories = await categoryService.getSubcategories(id);

    return res.status(200).json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get subcategories',
      error: error.message,
    });
  }
};
```

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\controllers\product.controller.js
const productService = require('../services/product.service');

// Vendor product management
exports.createProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { name, description, price, salePrice, stockQuantity, categoryId, images } = req.body;

    const product = await productService.createProduct({
      vendorId,
      name,
      description,
      price,
      salePrice,
      stockQuantity,
      categoryId,
      images,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;
    const { name, description, price, salePrice, stockQuantity, categoryId, images, status } = req.body;

    const product = await productService.updateProduct(id, vendorId, {
      name,
      description,
      price,
      salePrice,
      stockQuantity,
      categoryId,
      images,
      status,
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

exports.getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { status } = req.query;
    
    const products = await productService.getProductsByVendor(vendorId, status || 'all');

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message,
    });
  }
};

exports.publishProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;

    const product = await productService.publishProduct(id, vendorId);

    return res.status(200).json({
      success: true,
      message: 'Product published successfully',
      data: product,
    });
  } catch (error) {
    console.error('Publish product error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to publish product',
      error: error.message,
    });
  }
};

exports.archiveProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;

    const product = await productService.archiveProduct(id, vendorId);

    return res.status(200).json({
      success: true,
      message: 'Product archived successfully',
      data: product,
    });
  } catch (error) {
    console.error('Archive product error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to archive product',
      error: error.message,
    });
  }
};

// Public product routes
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message,
    });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await productService.getProductBySlug(slug);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message,
    });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const products = await productService.getProductsByCategory(categoryId);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message,
    });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const products = await productService.searchProducts(query);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Search products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message,
    });
  }
};
```

### 7.6 Create product and category routes

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\routes\v1\category.routes.js
const express = require('express');
const categoryController = require('../../controllers/category.controller');
const authMiddleware = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Public category routes
router.get('/', categoryController.getAllCategories);
router.get('/top-level', categoryController.getTopLevelCategories);
router.get('/:id', categoryController.getCategory);
router.get('/:id/subcategories', categoryController.getSubcategories);

// Admin category management routes
router.post('/', authMiddleware, authorize('admin'), categoryController.createCategory);
router.put('/:id', authMiddleware, authorize('admin'), categoryController.updateCategory);

module.exports = router;
```

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\routes\v1\product.routes.js
const express = require('express');
const productController = require('../../controllers/product.controller');
const authMiddleware = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Public product routes
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProduct);
router.get('/slug/:slug', productController.getProductBySlug);

// Vendor product management routes
router.post('/', authMiddleware, authorize('vendor'), productController.createProduct);
router.put('/:id', authMiddleware, authorize('vendor'), productController.updateProduct);
router.get('/vendor/products', authMiddleware, authorize('vendor'), productController.getVendorProducts);
router.post('/:id/publish', authMiddleware, authorize('vendor'), productController.publishProduct);
router.post('/:id/archive', authMiddleware, authorize('vendor'), productController.archiveProduct);

module.exports = router;
```

## 8. Implement Order Management System

### 8.1 Create orders and order items tables in Supabase

**Orders Table**:
- id (uuid, primary key)
- user_id (uuid, references users.id)
- status (text) - 'pending', 'processing', 'completed', 'cancelled', 'refunded'
- total_amount (decimal)
- shipping_address (json)
- billing_address (json)
- payment_method (text)
- payment_status (text)
- tracking_number (text, nullable)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

**Order Items Table**:
- id (uuid, primary key)
- order_id (uuid, references orders.id)
- product_id (uuid, references products.id)
- vendor_id (uuid, references vendors.id)
- quantity (integer)
- price (decimal)
- total (decimal)
- status (text) - 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
- created_at (timestamp)
- updated_at (timestamp)

### 8.2 Create order models

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\models\order.model.js
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class Order {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.user_id;
    this.status = data.status || 'pending';
    this.totalAmount = data.total_amount;
    this.shippingAddress = data.shipping_address;
    this.billingAddress = data.billing_address;
    this.paymentMethod = data.payment_method;
    this.paymentStatus = data.payment_status || 'pending';
    this.trackingNumber = data.tracking_number;
    this.notes = data.notes;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new Order(data);
  }

  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(order => new Order(order));
  }

  static async findByStatus(status) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(order => new Order(order));
  }

  async save() {
    const { data, error } = await supabase
      .from('orders')
      .upsert({
        id: this.id,
        user_id: this.userId,
        status: this.status,
        total_amount: this.totalAmount,
        shipping_address: this.shippingAddress,
        billing_address: this.billingAddress,
        payment_method: this.paymentMethod,
        payment_status: this.paymentStatus,
        tracking_number: this.trackingNumber,
        notes: this.notes,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new Order(data);
  }

  async updateStatus(status) {
    this.status = status;
    return this.save();
  }

  async updatePaymentStatus(paymentStatus) {
    this.paymentStatus = paymentStatus;
    return this.save();
  }

  // Additional methods as needed
}

module.exports = Order;
```

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\models\order-item.model.js
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class OrderItem {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.orderId = data.order_id;
    this.productId = data.product_id;
    this.vendorId = data.vendor_id;
    this.quantity = data.quantity;
    this.price = data.price;
    this.total = data.total;
    this.status = data.status || 'pending';
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new OrderItem(data);
  }

  static async findByOrderId(orderId) {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data.map(item => new OrderItem(item));
  }

  static async findByVendorId(vendorId) {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => new OrderItem(item));
  }

  async save() {
    const { data, error } = await supabase
      .from('order_items')
      .upsert({
        id: this.id,
        order_id: this.orderId,
        product_id: this.productId,
        vendor_id: this.vendorId,
        quantity: this.quantity,
        price: this.price,
        total: this.total,
        status: this.status,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new OrderItem(data);
  }

  async updateStatus(status) {
    this.status = status;
    return await this.save();
  }

  // Additional methods as needed
}

module.exports = OrderItem;
```

### 8.3 Create order service

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\services\order.service.js
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/order.model');
const OrderItem = require('../models/order-item.model');
const productService = require('./product.service');
const notificationService = require('./notification.service');

class OrderService {
  async createOrder(orderData) {
    try {
      // Create the order
      const order = new Order({
        id: uuidv4(),
        user_id: orderData.userId,
        status: 'pending',
        total_amount: orderData.totalAmount,
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.billingAddress,
        payment_method: orderData.paymentMethod,
        payment_status: 'pending',
        created_at: new Date().toISOString(),
      });

      const savedOrder = await order.save();

      // Create order items
      const orderItems = [];
      for (const item of orderData.items) {
        const product = await productService.getProductById(item.productId);
        
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const orderItem = new OrderItem({
          id: uuidv4(),
          order_id: savedOrder.id,
          product_id: product.id,
          vendor_id: product.vendorId,
          quantity: item.quantity,
          price: product.salePrice || product.price,
          total: (product.salePrice || product.price) * item.quantity,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

        const savedItem = await orderItem.save();
        orderItems.push(savedItem);

        // Update product stock
        await productService.updateStock(product.id, product.vendorId, product.stockQuantity - item.quantity);
      }

      // Notify vendors about new order items
      await notificationService.notifyNewOrderItems(orderItems);

      // Notify customer about order creation
      await notificationService.notifyOrderCreation(savedOrder, orderItems);

      return { order: savedOrder, items: orderItems };
    } catch (error) {
      console.error('Order service - Create order error:', error);
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      const order = await Order.findById(id);
      if (!order) return null;

      const orderItems = await OrderItem.findByOrderId(id);
      return { order, items: orderItems };
    } catch (error) {
      console.error('Order service - Get order error:', error);
      throw error;
    }
  }

  async getOrdersByUserId(userId) {
    try {
      const orders = await Order.findByUserId(userId);
      return orders;
    } catch (error) {
      console.error('Order service - Get orders by user error:', error);
      throw error;
    }
  }

  async getVendorOrderItems(vendorId) {
    try {
      const orderItems = await OrderItem.findByVendorId(vendorId);
      return orderItems;
    } catch (error) {
      console.error('Order service - Get vendor order items error:', error);
      throw error;
    }
  }

  async updateOrderStatus(id, status) {
    try {
      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = await order.updateStatus(status);
      
      // Notify customer about order status update
      await notificationService.notifyOrderStatusUpdate(updatedOrder);
      
      return updatedOrder;
    } catch (error) {
      console.error('Order service - Update order status error:', error);
      throw error;
    }
  }

  async updateOrderItemStatus(id, status, vendorId) {
    try {
      const orderItem = await OrderItem.findById(id);
      if (!orderItem) {
        throw new Error('Order item not found');
      }

      if (orderItem.vendorId !== vendorId) {
        throw new Error('Unauthorized: Order item does not belong to this vendor');
      }

      const updatedItem = await orderItem.updateStatus(status);
      
      // Check if all items in the order have been shipped/delivered/etc.
      const allItems = await OrderItem.findByOrderId(orderItem.orderId);
      const allItemsWithStatus = allItems.every(item => item.status === status);
      
      // If all items have the same status, update the order status accordingly
      if (allItemsWithStatus) {
        const order = await Order.findById(orderItem.orderId);
        if (order) {
          await order.updateStatus(status);
          // Notify customer about order status update
          await notificationService.notifyOrderStatusUpdate(order);
        }
      }
      
      // Notify customer about order item status update
      await notificationService.notifyOrderItemStatusUpdate(updatedItem);
      
      return updatedItem;
    } catch (error) {
      console.error('Order service - Update order item status error:', error);
      throw error;
    }
  }

  // Additional methods as needed
}

module.exports = new OrderService();
```

### 8.4 Create order controller

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\controllers\order.controller.js
const orderService = require('../services/order.service');

// Customer order endpoints
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, billingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided for the order',
      });
    }

    const order = await orderService.createOrder({
      userId,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await orderService.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if the order belongs to the user (unless admin)
    if (req.user.role !== 'admin' && order.order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this order',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message,
    });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await orderService.getOrdersByUserId(userId);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message,
    });
  }
};

// Vendor order endpoints
exports.getVendorOrderItems = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const orderItems = await orderService.getVendorOrderItems(vendorId);

    return res.status(200).json({
      success: true,
      data: orderItems,
    });
  } catch (error) {
    console.error('Get vendor order items error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get order items',
      error: error.message,
    });
  }
};

exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendorId = req.user.id;
    
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const orderItem = await orderService.updateOrderItemStatus(id, status, vendorId);

    return res.status(200).json({
      success: true,
      message: `Order item status updated to ${status}`,
      data: orderItem,
    });
  } catch (error) {
    console.error('Update order item status error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update order item status',
      error: error.message,
    });
  }
};

// Admin order endpoints
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    const orders = status ? 
      await orderService.getOrdersByStatus(status) : 
      await orderService.getAllOrders();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['processing', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await orderService.updateOrderStatus(id, status);

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};
```

### 8.5 Create order routes

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\routes\v1\order.routes.js
const express = require('express');
const orderController = require('../../controllers/order.controller');
const authMiddleware = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Customer order routes
router.post('/', authMiddleware, authorize('customer'), orderController.createOrder);
router.get('/my-orders', authMiddleware, authorize('customer'), orderController.getCustomerOrders);
router.get('/:id', authMiddleware, orderController.getOrder);

// Vendor order routes
router.get('/vendor/items', authMiddleware, authorize('vendor'), orderController.getVendorOrderItems);
router.put('/items/:id/status', authMiddleware, authorize('vendor'), orderController.updateOrderItemStatus);

// Admin order routes
router.get('/', authMiddleware, authorize('admin'), orderController.getAllOrders);
router.put('/:id/status', authMiddleware, authorize('admin'), orderController.updateOrderStatus);

module.exports = router;
```

## 9. Create Notification System

### 9.1 Create notifications table in Supabase

**Notifications Table**:
- id (uuid, primary key)
- user_id (uuid, references users.id)
- type (text) - 'order_status', 'order_item_status', 'inventory_alert', etc.
- title (text)
- message (text)
- data (json, optional)
- is_read (boolean, default: false)
- created_at (timestamp)
- updated_at (timestamp)

### 9.2 Create notification model

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\models\notification.model.js
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class Notification {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.user_id;
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.data = data.data || {};
    this.isRead = data.is_read || false;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new Notification(data);
  }

  static async findByUserId(userId, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.map(notification => new Notification(notification));
  }

  static async findUnreadByUserId(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(notification => new Notification(notification));
  }

  async save() {
    const { data, error } = await supabase
      .from('notifications')
      .upsert({
        id: this.id,
        user_id: this.userId,
        type: this.type,
        title: this.title,
        message: this.message,
        data: this.data,
        is_read: this.isRead,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new Notification(data);
  }

  async markAsRead() {
    this.isRead = true;
    return await this.save();
  }

  // Additional methods as needed
}

module.exports = Notification;
```

### 9.3 Create notification service

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\services\notification.service.js
const Notification = require('../models/notification.model');
const userService = require('./user.service');
const emailService = require('./email.service');

class NotificationService {
  async createNotification(data) {
    try {
      const notification = new Notification({
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        created_at: new Date().toISOString(),
      });

      return await notification.save();
    } catch (error) {
      console.error('Notification service - Create notification error:', error);
      throw error;
    }
  }

  async getUserNotifications(userId) {
    try {
      return await Notification.findByUserId(userId);
    } catch (error) {
      console.error('Notification service - Get user notifications error:', error);
      throw error;
    }
  }

  async getUnreadNotifications(userId) {
    try {
      return await Notification.findUnreadByUserId(userId);
    } catch (error) {
      console.error('Notification service - Get unread notifications error:', error);
      throw error;
    }
  }

  async markAsRead(id, userId) {
    try {
      const notification = await Notification.findById(id);
      
      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new Error('Unauthorized: Notification does not belong to this user');
      }

      return await notification.markAsRead();
    } catch (error) {
      console.error('Notification service - Mark as read error:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const notifications = await Notification.findUnreadByUserId(userId);
      const updatePromises = notifications.map(notification => notification.markAsRead());
      
      return await Promise.all(updatePromises);
    } catch (error) {
      console.error('Notification service - Mark all as read error:', error);
      throw error;
    }
  }

  // Order notifications
  async notifyOrderCreation(order, orderItems) {
    try {
      // Notify customer
      const user = await userService.getUserById(order.userId);
      
      await this.createNotification({
        userId: order.userId,
        type: 'order_created',
        title: 'Order Placed Successfully',
        message: `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
        data: { orderId: order.id },
      });

      // Send email to customer
      await emailService.sendOrderConfirmationEmail(user.email, order, orderItems);

      // Group items by vendor and send notifications to each vendor
      const itemsByVendor = {};
      for (const item of orderItems) {
        if (!itemsByVendor[item.vendorId]) {
          itemsByVendor[item.vendorId] = [];
        }
        itemsByVendor[item.vendorId].push(item);
      }

      // Notify each vendor
      for (const vendorId in itemsByVendor) {
        await this.createNotification({
          userId: vendorId,
          type: 'new_order_items',
          title: 'New Order Received',
          message: `You have received new order items for order #${order.id.slice(0, 8)}.`,
          data: { 
            orderId: order.id,
            items: itemsByVendor[vendorId].length
          },
        });

        // Send email to vendor
        const vendor = await userService.getUserById(vendorId);
        await emailService.sendVendorOrderNotificationEmail(vendor.email, order, itemsByVendor[vendorId]);
      }

    } catch (error) {
      console.error('Notification service - Order creation notification error:', error);
      // Don't throw to avoid breaking the order flow, just log the error
    }
  }

  async notifyOrderStatusUpdate(order) {
    try {
      // Notify customer
      await this.createNotification({
        userId: order.userId,
        type: 'order_status_updated',
        title: 'Order Status Updated',
        message: `Your order #${order.id.slice(0, 8)} status has been updated to ${order.status}.`,
        data: { orderId: order.id, status: order.status },
      });

      // Send email to customer
      const user = await userService.getUserById(order.userId);
      await emailService.sendOrderStatusUpdateEmail(user.email, order);

    } catch (error) {
      console.error('Notification service - Order status update notification error:', error);
      // Don't throw to avoid breaking the order flow, just log the error
    }
  }

  async notifyOrderItemStatusUpdate(orderItem) {
    try {
      // Get order to notify the customer
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderItem.orderId)
        .single();

      // Get product info
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', orderItem.productId)
        .single();

      const productName = product ? product.name : 'Product';

      // Notify customer
      await this.createNotification({
        userId: order.user_id,
        type: 'order_item_status_updated',
        title: 'Order Item Status Updated',
        message: `The status for ${productName} in your order #${order.id.slice(0, 8)} has been updated to ${orderItem.status}.`,
        data: { 
          orderId: order.id,
          orderItemId: orderItem.id,
          status: orderItem.status 
        },
      });

      // Send email to customer
      const user = await userService.getUserById(order.user_id);
      await emailService.sendOrderItemStatusUpdateEmail(user.email, orderItem, product);

    } catch (error) {
      console.error('Notification service - Order item status update notification error:', error);
      // Don't throw to avoid breaking the order flow, just log the error
    }
  }

  // Inventory notifications
  async notifyLowInventory(product, vendor) {
    try {
      // Notify vendor
      await this.createNotification({
        userId: vendor.id,
        type: 'inventory_alert',
        title: 'Low Inventory Alert',
        message: `The product ${product.name} is running low on stock. Current quantity: ${product.stockQuantity}.`,
        data: { productId: product.id },
      });

      // Send email to vendor
      await emailService.sendLowInventoryAlertEmail(vendor.email, product);

    } catch (error) {
      console.error('Notification service - Low inventory notification error:', error);
      // Don't throw, just log the error
    }
  }

  // Additional notification methods as needed
}

module.exports = new NotificationService();
```

### 9.4 Create notification controller

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\controllers\notification.controller.js
const notificationService = require('../services/notification.service');

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await notificationService.getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message,
    });
  }
};

exports.getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await notificationService.getUnreadNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread notifications',
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
};
```

### 9.5 Create notification routes

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\routes\v1\notification.routes.js
const express = require('express');
const notificationController = require('../../controllers/notification.controller');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, notificationController.getUserNotifications);
router.get('/unread', authMiddleware, notificationController.getUnreadNotifications);
router.put('/:id/read', authMiddleware, notificationController.markAsRead);
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

module.exports = router;
```

## 10. Develop Analytics and Reporting Endpoints

### 10.1 Create analytics service

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\services\analytics.service.js
const supabase = require('../config/supabase');

class AnalyticsService {
  // Admin analytics
  async getPlatformSummary() {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total vendors
      const { count: vendorCount } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get total products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // Get total orders
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');

      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

      return {
        userCount,
        vendorCount,
        productCount,
        orderCount,
        totalRevenue,
      };
    } catch (error) {
      console.error('Analytics service - Get platform summary error:', error);
      throw error;
    }
  }

  async getSalesOverTime(period = '30d') {
    try {
      let startDate;
      const now = new Date();
      
      switch (period) {
        case '7d':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 30));
      }

      // Format date to ISO string and remove time part
      const startDateStr = startDate.toISOString().split('T')[0];

      // Get orders in the period
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${startDateStr}T00:00:00`)
        .order('created_at', { ascending: true });

      // Group by day
      const salesByDay = {};
      orders.forEach(order => {
        const date = order.created_at.split('T')[0];
        if (!salesByDay[date]) {
          salesByDay[date] = {
            count: 0,
            revenue: 0,
          };
        }
        salesByDay[date].count += 1;
        salesByDay[date].revenue += order.total_amount;
      });

      // Convert to array of points
      const result = Object.keys(salesByDay).map(date => ({
        date,
        orderCount: salesByDay[date].count,
        revenue: salesByDay[date].revenue,
      }));

      return result;
    } catch (error) {
      console.error('Analytics service - Get sales over time error:', error);
      throw error;
    }
  }

  async getTopSellingProducts(limit = 10) {
    try {
      // Get order items joined with products
      const { data } = await supabase
        .from('order_items')
        .select(`
          quantity,
          product:products(id, name, price)
        `)
        .order('quantity', { ascending: false })
        .limit(limit);

      // Aggregate quantities for each product
      const productMap = {};
      data.forEach(item => {
        const productId = item.product.id;
        if (!productMap[productId]) {
          productMap[productId] = {
            id: productId,
            name: item.product.name,
            price: item.product.price,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        productMap[productId].totalQuantity += item.quantity;
        productMap[productId].totalRevenue += item.quantity * item.product.price;
      });

      // Convert to array and sort by total quantity
      return Object.values(productMap)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);
    } catch (error) {
      console.error('Analytics service - Get top selling products error:', error);
      throw error;
    }
  }

  // Vendor analytics
  async getVendorSummary(vendorId) {
    try {
      // Get total products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId);

      // Get published products
      const { count: publishedProductCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .eq('status', 'published');

      // Get order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('vendor_id', vendorId);

      // Calculate total orders, revenue, and items sold
      const totalOrders = new Set(orderItems.map(item => item.order_id)).size;
      const totalRevenue = orderItems.reduce((sum, item) => sum + item.total, 0);
      const totalItemsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        productCount,
        publishedProductCount,
        totalOrders,
        totalRevenue,
        totalItemsSold,
      };
    } catch (error) {
      console.error('Analytics service - Get vendor summary error:', error);
      throw error;
    }
  }

  async getVendorSalesOverTime(vendorId, period = '30d') {
    try {
      let startDate;
      const now = new Date();
      
      switch (period) {
        case '7d':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 30));
      }

      // Format date to ISO string and remove time part
      const startDateStr = startDate.toISOString().split('T')[0];

      // Get order items in the period, joined with orders for date
      const { data: items } = await supabase
        .from('order_items')
        .select(`
          quantity, total,
          order:orders(created_at)
        `)
        .eq('vendor_id', vendorId)
        .gte('order.created_at', `${startDateStr}T00:00:00`);

      // Group by day
      const salesByDay = {};
      items.forEach(item => {
        const date = item.order.created_at.split('T')[0];
        if (!salesByDay[date]) {
          salesByDay[date] = {
            quantity: 0,
            revenue: 0,
          };
        }
        salesByDay[date].quantity += item.quantity;
        salesByDay[date].revenue += item.total;
      });

      // Convert to array of points
      const result = Object.keys(salesByDay).map(date => ({
        date,
        itemsSold: salesByDay[date].quantity,
        revenue: salesByDay[date].revenue,
      }));

      return result;
    } catch (error) {
      console.error('Analytics service - Get vendor sales over time error:', error);
      throw error;
    }
  }

  async getVendorTopProducts(vendorId, limit = 5) {
    try {
      // Group order items by product and sum quantities
      const { data } = await supabase
        .from('order_items')
        .select(`
          quantity, total,
          product:products(id, name)
        `)
        .eq('vendor_id', vendorId);

      // Aggregate by product
      const productMap = {};
      data.forEach(item => {
        const productId = item.product.id;
        if (!productMap[productId]) {
          productMap[productId] = {
            id: productId,
            name: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productMap[productId].quantity += item.quantity;
        productMap[productId].revenue += item.total;
      });

      // Convert to array and sort by quantity
      return Object.values(productMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit);
    } catch (error) {
      console.error('Analytics service - Get vendor top products error:', error);
      throw error;
    }
  }

  // Additional analytics methods as needed
}

module.exports = new AnalyticsService();
```

### 10.2 Create analytics controller

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\controllers\analytics.controller.js
const analyticsService = require('../services/analytics.service');

// Admin analytics endpoints
exports.getPlatformSummary = async (req, res) => {
  try {
    const summary = await analyticsService.getPlatformSummary();

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get platform summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get platform summary',
      error: error.message,
    });
  }
};

exports.getSalesOverTime = async (req, res) => {
  try {
    const { period } = req.query;
    
    const data = await analyticsService.getSalesOverTime(period);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get sales over time error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get sales data',
      error: error.message,
    });
  }
};

exports.getTopSellingProducts = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const data = await analyticsService.getTopSellingProducts(parseInt(limit) || 10);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get top selling products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get top selling products',
      error: error.message,
    });
  }
};

// Vendor analytics endpoints
exports.getVendorSummary = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const summary = await analyticsService.getVendorSummary(vendorId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get vendor summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get vendor summary',
      error: error.message,
    });
  }
};

exports.getVendorSalesOverTime = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { period } = req.query;
    
    const data = await analyticsService.getVendorSalesOverTime(vendorId, period);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get vendor sales over time error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get sales data',
      error: error.message,
    });
  }
};

exports.getVendorTopProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { limit } = req.query;
    
    const data = await analyticsService.getVendorTopProducts(vendorId, parseInt(limit) || 5);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get vendor top products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get top products',
      error: error.message,
    });
  }
};
```

### 10.3 Create analytics routes

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\server\routes\v1\analytics.routes.js
const express = require('express');
const analyticsController = require('../../controllers/analytics.controller');
const authMiddleware = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// Admin analytics routes
router.get('/platform/summary', authMiddleware, authorize('admin'), analyticsController.getPlatformSummary);
router.get('/platform/sales', authMiddleware, authorize('admin'), analyticsController.getSalesOverTime);
router.get('/platform/top-products', authMiddleware, authorize('admin'), analyticsController.getTopSellingProducts);

// Vendor analytics routes
router.get('/vendor/summary', authMiddleware, authorize('vendor'), analyticsController.getVendorSummary);
router.get('/vendor/sales', authMiddleware, authorize('vendor'), analyticsController.getVendorSalesOverTime);
router.get('/vendor/top-products', authMiddleware, authorize('vendor'), analyticsController.getVendorTopProducts);

module.exports = router;
```

## Conclusion

You have now completed the setup of your backend server with Express.js and Supabase integration. The backend includes:

- RESTful API architecture with proper routing and controllers
- Authentication and authorization with role-based access control
- Vendor management system
- Product catalog management
- Order management system
- Notification system
- Analytics and reporting endpoints

In the next step, we will focus on database architecture with Supabase, including setting up tables, relationships, and security policies.