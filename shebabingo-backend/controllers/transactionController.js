const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.requestDeposit = async (req, res) => {
  try {
    const { telegram_id, amount, payment_method, payment_proof } = req.body;
    
    if (!telegram_id || !amount || !payment_method) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }
    
    const depositAmount = parseFloat(amount);
    if (depositAmount < 10) {
      return res.status(400).json({ 
        error: 'Minimum deposit is 10 ETB' 
      });
    }
    
    // Get or create user
    let user = await User.findByTelegramId(telegram_id);
    if (!user) {
      user = await User.create(telegram_id);
    }
    
    // Create pending deposit
    const deposit = await Transaction.create(
      user.id,
      telegram_id,
      'deposit',
      depositAmount,
      'pending',
      { payment_method, payment_proof }
    );
    
    console.log(`📥 Deposit request: ${telegram_id} - ${depositAmount} ETB`);
    
    res.json({
      success: true,
      message: 'Deposit request submitted. Admin will verify your payment.',
      transaction_id: deposit.id,
      amount: depositAmount,
      status: 'pending'
    });
    
  } catch (error) {
    console.error('Deposit request error:', error);
    res.status(500).json({ error: 'Failed to submit deposit request' });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { telegram_id, amount, account_number, account_name } = req.body;
    
    if (!telegram_id || !amount || !account_number) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }
    
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < 50) {
      return res.status(400).json({ 
        error: 'Minimum withdrawal is 50 ETB' 
      });
    }
    
    const user = await User.findByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentBalance = parseFloat(user.balance);
    if (withdrawAmount > currentBalance) {
      return res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_BALANCE',
        message: 'You do not have sufficient balance for this withdrawal',
        requested: withdrawAmount,
        current: currentBalance,
        deficit: withdrawAmount - currentBalance
      });
    }
    
    // Reserve amount
    const newBalance = await User.updateBalance(telegram_id, withdrawAmount, 'subtract');
    
    // Create withdrawal request
    const withdrawal = await Transaction.create(
      user.id,
      telegram_id,
      'withdraw',
      withdrawAmount,
      'processing',
      {
        account_number,
        account_name,
        previous_balance: currentBalance,
        new_balance: newBalance
      }
    );
    
    console.log(`📤 Withdrawal request: ${telegram_id} - ${withdrawAmount} ETB`);
    
    res.json({
      success: true,
      message: 'Withdrawal request submitted. Admin will process your payment.',
      transaction_id: withdrawal.id,
      amount: withdrawAmount,
      status: 'processing',
      new_balance: newBalance
    });
    
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ error: 'Failed to submit withdrawal request' });
  }
};