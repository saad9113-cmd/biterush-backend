const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');

const JWT_SECRET = 'my_super_secret_key_123';

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, city, password } = req.body;
    const [existing] = await db.execute(
      'SELECT customer_id FROM Customers WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO Customers (name, email, phone, city, password_hash) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, city, hashedPassword]
    );
    const token = jwt.sign(
      { customerId: result.insertId, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      message:  '✅ Account created!',
      token,
      customer: { id: result.insertId, name, email, city }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute(
      'SELECT * FROM Customers WHERE email = ?', [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }
    const customer = rows[0];
    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Wrong password' });
    }
    const token = jwt.sign(
      { customerId: customer.customer_id, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message:  '✅ Login successful!',
      token,
      customer: {
        id:    customer.customer_id,
        name:  customer.name,
        email: customer.email,
        city:  customer.city
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;