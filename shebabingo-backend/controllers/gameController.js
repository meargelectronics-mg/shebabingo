const User = require('../models/User');
const Game = require('../models/Game');
const Transaction = require('../models/Transaction');
const PlayerBet = require('../models/PlayerBet');

exports.buyBoards = async (req, res) => {
  try {
    const { telegram_id, num_boards, game_id } = req.body;
    
    if (!telegram_id || !num_boards || num_boards < 1 || num_boards > 3) {
      return res.status(400).json({ 
        error: 'Invalid request. Must buy 1-3 boards.' 
      });
    }
    
    const BET_PER_BOARD = 10;
    const totalBet = num_boards * BET_PER_BOARD;
    const commissionRate = 0.20;
    const commission = totalBet * commissionRate;
    
    // Check user exists
    const user = await User.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found. Please register first.' 
      });
    }
    
    // Check balance
    const currentBalance = parseFloat(user.balance);
    if (currentBalance < totalBet) {
      return res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_BALANCE',
        message: 'You do not have sufficient balance to play',
        required: totalBet,
        current: currentBalance,
        deficit: totalBet - currentBalance
      });
    }
    
    // Deduct balance
    const newBalance = await User.updateBalance(telegram_id, totalBet, 'subtract');
    
    // Record bet transaction
    await Transaction.create(
      user.id,
      telegram_id,
      'bet',
      totalBet,
      'completed',
      { num_boards, game_id, bet_per_board: BET_PER_BOARD }
    );
    
    // Record commission
    await Transaction.create(
      user.id,
      telegram_id,
      'commission',
      commission,
      'completed',
      { source: 'game_bet', commission_rate: commissionRate, total_bet: totalBet }
    );
    
    // Update or create game
    if (game_id) {
      let game = await Game.findById(game_id);
      if (!game) {
        game = await Game.create(game_id);
      }
      await Game.addBet(game_id, totalBet, commission);
    }
    
    // Record player bet
    const boardNumbers = Array.from({length: num_boards}, (_, i) => i + 1);
    await PlayerBet.create(user.id, game_id, boardNumbers, totalBet);
    
    console.log(`🎮 ${telegram_id} bought ${num_boards} boards: -${totalBet} ETB`);
    
    res.json({
      success: true,
      message: `Purchased ${num_boards} board(s)`,
      bet_details: {
        boards_purchased: num_boards,
        total_bet: totalBet,
        commission_deducted: commission,
        new_balance: newBalance
      },
      balance: newBalance
    });
    
  } catch (error) {
    console.error('Buy boards error:', error);
    res.status(500).json({ 
      error: 'Failed to buy boards',
      message: error.message 
    });
  }
};

exports.processWin = async (req, res) => {
  try {
    const { telegram_id, game_id, prize_amount } = req.body;
    
    if (!telegram_id || !prize_amount || prize_amount <= 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    
    const user = await User.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add prize to balance
    const newBalance = await User.updateBalance(telegram_id, prize_amount, 'add');
    
    // Record win transaction
    await Transaction.create(
      user.id,
      telegram_id,
      'win',
      prize_amount,
      'completed',
      { game_id, source: 'bingo_win' }
    );
    
    // Update game winners
    if (game_id) {
      await Game.addWinner(game_id, {
        telegram_id,
        prize: prize_amount,
        won_at: new Date()
      });
    }
    
    console.log(`🏆 ${telegram_id} won ${prize_amount} ETB!`);
    
    res.json({
      success: true,
      message: 'Prize awarded successfully',
      prize: prize_amount,
      new_balance: newBalance
    });
    
  } catch (error) {
    console.error('Process win error:', error);
    res.status(500).json({ error: 'Failed to process win' });
  }
};