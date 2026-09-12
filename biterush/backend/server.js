const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TEST ROUTE — to verify server works
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ BiteRush server is live!' });
});

// AUTH ROUTES
app.use('/api/auth', require('./routes/auth'));

// RESTAURANT ROUTES
app.use('/api/restaurants', require('./routes/restaurants'));

// ORDER ROUTES
app.use('/api/orders', require('./routes/orders'));

// PAYMENT ROUTES
app.use('/api/payments', require('./routes/payments'));

// DELIVERY ROUTES
app.use('/api/delivery', require('./routes/delivery'));

app.use('/api/coupons', require('./routes/coupons'));

app.use('/api/admin', require('./routes/admin'));

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('=======================================');
  console.log('   🚀 BiteRush Server Started!');
  console.log('   http://localhost:' + PORT);
  console.log('=======================================');
});