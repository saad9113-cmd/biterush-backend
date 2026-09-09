const fs = require('fs');

fs.writeFileSync('middleware/auth.js',
`const jwt = require('jsonwebtoken');

const SECRET = 'my_super_secret_key_123';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Please login first' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.customer = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired, please login again' });
  }
};`
);

console.log('✅ middleware fixed!');