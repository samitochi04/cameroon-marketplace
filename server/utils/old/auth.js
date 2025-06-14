const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  // Generate access token
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'customer',
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

// Add a function to verify tokens
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateTokens,
  verifyToken
};