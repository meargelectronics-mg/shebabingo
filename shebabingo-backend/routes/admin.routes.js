const express = require('express');
const router = express.Router();

// Middleware to check admin authentication
const isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Apply admin middleware to all routes
router.use(isAdmin);

// Get all players
router.get('/players', (req, res) => {
  const players = Array.from(gameState.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    joinedAt: p.joinedAt,
    markedCount: p.markedNumbers.size
  }));
  
  res.json({ players });
});

// Get game statistics
router.get('/stats', (req, res) => {
  res.json({
    totalGames: 0, // You'd track this in database
    activePlayers: gameState.players.size,
    numbersCalled: gameState.calledNumbers.length,
    currentWinners: gameState.winners.length
  });
});

// Send announcement to all players
router.post('/announce', (req, res) => {
  const { message } = req.body;
  
  // This would use Socket.io to broadcast
  io.emit('admin-announcement', {
    message,
    timestamp: new Date()
  });
  
  res.json({ success: true });
});

module.exports = router;