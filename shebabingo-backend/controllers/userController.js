const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.registerUser = async (req, res) => {
  try {
    const { telegram_id, username } = req.body;
    
    if (!telegram_id) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }
    
    let user = await User.findByTelegramId(telegram_id);
    
    if (!user) {
      user = await User.create(telegram_id, username);
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        balance: parseFloat(user.balance)
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const { telegram_id } = req.params;
    
    const user = await User.findByTelegramId(telegram_id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found. Please register first.' 
      });
    }
    
    res.json({
      success: true,
      balance: parseFloat(user.balance),
      telegram_id: user.telegram_id
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
};

exports.checkPlayEligibility = async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const BET_PER_BOARD = 10;
    
    const user = await User.findByTelegramId(telegram_id);
    
    if (!user) {
      return res.json({
        can_play: false,
        reason: 'User not registered',
        required: BET_PER_BOARD,
        current: 0
      });
    }
    
    const balance = parseFloat(user.balance);
    const canPlay = balance >= BET_PER_BOARD;
    
    res.json({
      can_play: canPlay,
      reason: canPlay ? 'Sufficient balance' : 'Insufficient balance',
      required: BET_PER_BOARD,
      current: balance,
      deficit: Math.max(0, BET_PER_BOARD - balance)
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({ error: 'Failed to check play eligibility' });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const { limit = 20 } = req.query;
    
    const transactions = await Transaction.getUserTransactions(telegram_id, limit);
    
    res.json({
      success: true,
      transactions: transactions.map(tx => ({
        ...tx,
        amount: parseFloat(tx.amount)
      }))
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};