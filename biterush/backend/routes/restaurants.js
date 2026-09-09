const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [restaurants] = await db.execute('SELECT * FROM Restaurants WHERE is_active = 1 ORDER BY avg_rating DESC');
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM Restaurants WHERE restaurant_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/menu', async (req, res) => {
  try {
    const [items] = await db.execute('SELECT * FROM Menu_Items WHERE restaurant_id = ? AND is_available = 1 ORDER BY category', [req.params.id]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;