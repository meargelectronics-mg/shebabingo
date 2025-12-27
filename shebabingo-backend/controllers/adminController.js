// controllers/adminController.js
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Game = require('../models/Game');

// 1. Get pending deposits
exports.getPendingDeposits = async (req, res) => {
  try {
    const deposits = await Transaction.getPendingDeposits();
    
    res.json({
      success: true,
      transactions: deposits.map(tx => ({
        ...tx,
        amount: parseFloat(tx.amount),
        user_balance: parseFloat(tx.user_balance)
      }))
    });
  } catch (error) {
    console.error('Get pending deposits error:', error);
    res.status(500).json({ error: 'Failed to get pending deposits' });
  }
};

// 2. Approve deposit
exports.approveDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified_amount, admin_notes } = req.body;
    
    if (!verified_amount) {
      return res.status(400).json({ 
        error: 'Verified amount is required' 
      });
    }
    
    const verifiedAmount = parseFloat(verified_amount);
    if (verifiedAmount < 10) {
      return res.status(400).json({ 
        error: 'Minimum deposit is 10 ETB' 
      });
    }
    
    // Get transaction
    const transaction = await Transaction.findById(id);
    if (!transaction || transaction.status !== 'pending' || transaction.type !== 'deposit') {
      return res.status(404).json({ error: 'Pending deposit not found' });
    }
    
    // Update transaction
    await Transaction.updateStatus(id, 'completed', admin_notes || 'Approved by admin');
    
    // Update user balance
    const user = await User.findByTelegramId(transaction.telegram_id);
    const newBalance = await User.updateBalance(transaction.telegram_id, verifiedAmount, 'add');
    
    console.log(`✅ Deposit approved: ${transaction.telegram_id} +${verifiedAmount} ETB`);
    
    res.json({
      success: true,
      message: 'Deposit approved and balance updated',
      user_telegram: transaction.telegram_id,
      approved_amount: verifiedAmount,
      new_balance: newBalance
    });
    
  } catch (error) {
    console.error('Approve deposit error:', error);
    res.status(500).json({ error: 'Failed to approve deposit' });
  }
};

// 3. Reject deposit
exports.rejectDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    
    const transaction = await Transaction.updateStatus(
      id, 
      'rejected', 
      admin_notes || 'Rejected: Payment not verified'
    );
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    console.log(`❌ Deposit rejected: ${transaction.telegram_id}`);
    
    res.json({
      success: true,
      message: 'Deposit rejected',
      telegram_id: transaction.telegram_id
    });
    
  } catch (error) {
    console.error('Reject deposit error:', error);
    res.status(500).json({ error: 'Failed to reject deposit' });
  }
};

// 4. Get commission stats
exports.getCommissionStats = async (req, res) => {
  try {
    const commissionStats = await Transaction.getCommissionStats();
    
    res.json({
      success: true,
      total_commission: commissionStats.total,
      today_commission: commissionStats.today
    });
  } catch (error) {
    console.error('Get commission error:', error);
    res.status(500).json({ error: 'Failed to get commission data' });
  }
};

// 5. Process withdrawal
exports.processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    
    const transaction = await Transaction.updateStatus(
      id, 
      'completed', 
      admin_notes || 'Payment sent'
    );
    
    if (!transaction) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    console.log(`✅ Withdrawal processed: ${transaction.telegram_id} -${transaction.amount} ETB`);
    
    res.json({
      success: true,
      message: 'Withdrawal processed',
      telegram_id: transaction.telegram_id,
      amount: parseFloat(transaction.amount)
    });
    
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
};

// 6. Get all users (for admin dashboard)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    
    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        balance: parseFloat(user.balance),
        total_deposited: parseFloat(user.total_deposited),
        total_withdrawn: parseFloat(user.total_withdrawn)
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// 7. Get all transactions (for admin dashboard)
exports.getAllTransactions = async (req, res) => {
  try {
    const { status, type, limit = 100 } = req.query;
    
    const transactions = await Transaction.getAllTransactions(status, type, limit);
    
    res.json({
      success: true,
      transactions: transactions.map(tx => ({
        ...tx,
        amount: parseFloat(tx.amount)
      }))
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};

// 8. Get all games (for admin dashboard)
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.getAllGames();
    
    res.json({
      success: true,
      games: games.map(game => ({
        ...game,
        total_bets: parseFloat(game.total_bets),
        total_prize: parseFloat(game.total_prize),
        commission: parseFloat(game.commission),
        winners: game.winners || []
      }))
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Failed to get games' });
  }
};

// 9. Optional: Dashboard stats (if you want to add it)
exports.getDashboardStats = async (req, res) => {
  try {
    const [users, games, commissionStats] = await Promise.all([
      User.getAllUsers(),
      Game.getAllGames(),
      Transaction.getCommissionStats()
    ]);
    
    const totalBalance = users.reduce((sum, user) => sum + parseFloat(user.balance), 0);
    const totalDeposits = users.reduce((sum, user) => sum + parseFloat(user.total_deposited), 0);
    
    res.json({
      success: true,
      stats: {
        total_users: users.length,
        total_balance: totalBalance,
        total_deposits: totalDeposits,
        total_games: games.length,
        total_commission: commissionStats.total,
        today_commission: commissionStats.today
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
};