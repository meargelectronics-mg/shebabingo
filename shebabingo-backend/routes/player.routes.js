const express = require('express');
const router = express.Router();

// Player registration (from Telegram)
router.post('/register', (req, res) => {
  const { telegramId, username, firstName } = req.body;
  
  // Check if player already exists
  const existingPlayer = gameState.players.get(telegramId);
  
  if (existingPlayer) {
    return res.json({
      success: true,
      player: existingPlayer,
      message: 'Welcome back!'
    });
  }
  
  // Create new player
  const newPlayer = {
    id: telegramId,
    telegramId,
    username,
    name: firstName || username,
    balance: 100, // Starting balance
    joinedAt: new Date()
  };
  
  gameState.players.set(telegramId, newPlayer);
  
  res.json({
    success: true,
    player: newPlayer,
    message: 'Welcome to ShebaBingo!'
  });
});

// Get player profile
router.get('/:playerId', (req, res) => {
  const player = gameState.players.get(req.params.playerId);
  
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  // Don't send sensitive data
  res.json({
    id: player.id,
    name: player.name,
    balance: player.balance,
    gamesPlayed: 0,
    gamesWon: 0
  });
});

// Player marks a number
router.post('/:playerId/mark', (req, res) => {
  const { number } = req.body;
  const player = gameState.players.get(req.params.playerId);
  
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  if (!gameState.calledNumbers.includes(number)) {
    return res.status(400).json({ error: 'Number not called yet' });
  }
  
  if (player.markedNumbers.has(number)) {
    return res.status(400).json({ error: 'Number already marked' });
  }
  
  player.markedNumbers.add(number);
  
  res.json({
    success: true,
    number,
    marked: true,
    totalMarked: player.markedNumbers.size
  });
});

module.exports = router;