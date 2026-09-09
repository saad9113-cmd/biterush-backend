const express  = require('express');
const router   = express.Router();
const db       = require('../config/db');
const authMiddleware = require('../middleware/auth');

// CREATE payment order
// POST /api/payments/create
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { order_id, amount } = req.body;

    // For now without Razorpay — just return amount
    // Later replace this with real Razorpay code
    res.json({
      message:  '✅ Payment initiated',
      order_id: order_id,
      amount:   amount,
      currency: 'INR'
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONFIRM payment
// POST /api/payments/confirm
router.post('/confirm', authMiddleware, async (req, res) => {
  try {
    const { order_id } = req.body;

    await db.execute(
      `UPDATE Orders SET status = 'Preparing'
       WHERE order_id = ?`,
      [order_id]
    );

    res.json({
      message:  '✅ Payment confirmed! Order is being prepared.',
      order_id: order_id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;