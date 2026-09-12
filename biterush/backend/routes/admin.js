const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Overview stats
router.get('/stats', async (req, res) => {
  try {
    const [[orderStats]] = await db.execute(
      `SELECT COUNT(*) as total_orders, IFNULL(SUM(total_amount),0) as total_revenue
       FROM Orders WHERE status != 'Cancelled'`
    );
    const [[todayStats]] = await db.execute(
      `SELECT COUNT(*) as today_orders, IFNULL(SUM(total_amount),0) as today_revenue
       FROM Orders WHERE DATE(order_time) = CURDATE() AND status != 'Cancelled'`
    );
    const [[restStats]] = await db.execute(
      `SELECT COUNT(*) as total_restaurants, SUM(is_active) as active_restaurants FROM Restaurants`
    );
    const [[custStats]] = await db.execute(
      `SELECT COUNT(*) as total_customers FROM Customers`
    );
    res.json({
      total_orders: orderStats.total_orders,
      total_revenue: orderStats.total_revenue,
      today_orders: todayStats.today_orders,
      today_revenue: todayStats.today_revenue,
      total_restaurants: restStats.total_restaurants,
      active_restaurants: restStats.active_restaurants || 0,
      total_customers: custStats.total_customers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All orders with details
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.order_id, o.status, o.total_amount, o.order_time,
              c.name AS customer_name, c.phone AS customer_phone,
              r.name AS restaurant_name,
              m.item_name, o.quantity
       FROM Orders o
       JOIN Customers c ON o.customer_id = c.customer_id
       JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
       JOIN Menu_Items m ON o.item_id = m.item_id
       ORDER BY o.order_time DESC
       LIMIT 100`
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All restaurants with menu count
router.get('/restaurants', async (req, res) => {
  try {
    const [restaurants] = await db.execute(
      `SELECT r.*, COUNT(m.item_id) as menu_count
       FROM Restaurants r
       LEFT JOIN Menu_Items m ON r.restaurant_id = m.restaurant_id
       GROUP BY r.restaurant_id
       ORDER BY r.restaurant_id`
    );
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All coupons
router.get('/coupons', async (req, res) => {
  try {
    const [coupons] = await db.execute(`SELECT * FROM Coupons ORDER BY coupon_id`);
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle restaurant active/inactive
router.put('/restaurants/:id/toggle', async (req, res) => {
  try {
    await db.execute(
      `UPDATE Restaurants SET is_active = NOT is_active WHERE restaurant_id = ?`,
      [req.params.id]
    );
    res.json({ message: 'Restaurant status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;