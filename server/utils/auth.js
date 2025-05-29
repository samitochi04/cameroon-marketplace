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