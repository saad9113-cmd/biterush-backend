const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Please login first' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, 'my_super_secret_key_123');
    req.customer = decoded;
    next();
  } catch (err) {
    console.log('Auth error:', err.message);
    return res.status(401).json({ error: 'Session expired, please login again' });
  }
};