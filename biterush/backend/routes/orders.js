const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/place', async (req, res) => {
  try {
    const { restaurant_id, item_id, quantity } = req.body;
    const customer_id = 1;

    const [result] = await db.execute(
      'INSERT INTO Orders (customer_id, restaurant_id, item_id, quantity) VALUES (?, ?, ?, ?)',
      [customer_id, restaurant_id, item_id, quantity]
    );

    const orderId = result.insertId;

    await db.execute('CALL calculate_order_total(?)', [orderId]);

    const [order] = await db.execute(
      'SELECT * FROM Orders WHERE order_id = ?',
      [orderId]
    );

    res.status(201).json({
      message: '✅ Order placed successfully!',
      order: order[0]
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, r.name AS restaurant_name, m.item_name
       FROM Orders o
       JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
       JOIN Menu_Items m ON o.item_id = m.item_id
       WHERE o.customer_id = 1
       ORDER BY o.order_time DESC`
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/track/:orderId', async (req, res) => {
  try {
    const [order] = await db.execute(
      `SELECT o.*, r.name AS restaurant_name, m.item_name
       FROM Orders o
       JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
       JOIN Menu_Items m ON o.item_id = m.item_id
       WHERE o.order_id = ?`,
      [req.params.orderId]
    );
    if (order.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(order[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;