const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'delivery working' });
});

router.get('/active', async (req, res) => {
  res.json({ message: 'active deliveries', orders: [] });
});

module.exports = router;