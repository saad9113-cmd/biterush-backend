const express = require('express');
const router = express.Router();
const db = require('../config/db');

// VALIDATE a coupon code
// POST /api/coupons/validate
router.post('/validate', async (req, res) => {
  try {
    const { code, order_total } = req.body;

    const [rows] = await db.execute(
      `SELECT * FROM Coupons
       WHERE code = ? AND is_active = 1 AND expiry_date >= CURDATE()
       AND times_used < usage_limit`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired coupon' });
    }

    const coupon = rows[0];

    if (order_total < coupon.min_order_value) {
      return res.status(400).json({
        error: `Minimum order value is ₹${coupon.min_order_value} for this coupon`
      });
    }

    let discount = (order_total * coupon.discount_percent) / 100;
    if (discount > coupon.max_discount) discount = coupon.max_discount;

    res.json({
      valid: true,
      code: coupon.code,
      discount_amount: Math.round(discount * 100) / 100,
      message: `🎉 Coupon applied! You saved ₹${Math.round(discount)}`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;