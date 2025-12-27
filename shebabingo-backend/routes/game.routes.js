const express = require('express');
const router = express.Router();

// Get current game status
router.get('/status', (req, res) => {
  res.json({
    isActive: true,
    currentNumber: gameState.currentNumber,
    calledNumbers: gameState.calledNumbers,
    totalPlayers: gameState.players.size,
    winners: gameState.winners
  });
});

// Get called numbers history
router.get('/called-numbers', (req, res) => {
  res.json({
    numbers: gameState.calledNumbers.slice(-20) // Last 20 numbers
  });
});

// Start a new game (admin)
router.post('/start', (req, res) => {
  const { adminKey } = req.body;
  
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Reset game state
  gameState = {
    isActive: true,
    currentNumber: null,
    calledNumbers: [],
    players: new Map(),
    winners: []
  };
  
  res.json({ success: true, message: 'Game started' });
});

// Call a number (admin)
router.post('/call-number', (req, res) => {
  const { adminKey } = req.body;
  
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const newNumber = getRandomUncalledNumber();
  gameState.calledNumbers.push(newNumber);
  gameState.currentNumber = newNumber;
  
  res.json({ 
    success: true, 
    number: newNumber,
    letter: getLetterForNumber(newNumber)
  });
});

module.exports = router;