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