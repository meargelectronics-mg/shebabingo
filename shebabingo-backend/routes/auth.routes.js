const express = require('express');
const router = express.Router();

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
    // Create session/token
    const token = require('crypto').randomBytes(32).toString('hex');
    
    res.json({
      success: true,
      token,
      user: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Telegram web app authentication
router.post('/telegram-auth', (req, res) => {
  const { initData } = req.body;
  
  // Verify Telegram WebApp data
  // This is simplified - you need proper verification
  try {
    const userData = JSON.parse(initData).user;
    
    res.json({
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
        firstName: userData.first_name
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid Telegram data' });
  }
});

module.exports = router;