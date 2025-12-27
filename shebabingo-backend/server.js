// C:\Users\Leul.K\Desktop\shebabingo\shebabingo-backend\server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();
// Import middleware and controllers
const { requireAdmin } = require('./middleware/adminAuth');
const adminController = require('./controllers/adminController');


// Create app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/shebabingo',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Export pool for models
module.exports.pool = pool;

// Initialize database
async function initializeDatabaseTables() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id VARCHAR(50) UNIQUE NOT NULL,
        username VARCHAR(100),
        balance DECIMAL(10,2) DEFAULT 0.00,
        total_deposited DECIMAL(10,2) DEFAULT 0.00,
        total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        telegram_id VARCHAR(50),
        type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'bet', 'win', 'commission')),
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'processing')),
        payment_method VARCHAR(50),
        payment_proof TEXT,
        admin_notes TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Games table to track each game
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(50) UNIQUE NOT NULL,
        total_players INTEGER DEFAULT 0,
        total_bets DECIMAL(10,2) DEFAULT 0.00,
        total_prize DECIMAL(10,2) DEFAULT 0.00,
        commission DECIMAL(10,2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'waiting',
        winners JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Player bets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id VARCHAR(50),
        board_numbers INTEGER[],
        bet_amount DECIMAL(10,2) DEFAULT 0.00,
        won BOOLEAN DEFAULT FALSE,
        prize_amount DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
}

// Test connection
pool.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    initializeDatabaseTables();
  }
});

// ======================
// IMPORT CONTROLLERS (ADD THIS)
// ======================

// Import models
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Game = require('./models/Game');
const PlayerBet = require('./models/PlayerBet');

// Import controllers
const userController = require('./controllers/userController');
const gameController = require('./controllers/gameController');
const transactionController = require('./controllers/transactionController');
const adminController = require('./controllers/adminController');



// ======================
// PUBLIC API ENDPOINTS
// ======================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ShebaBingo',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// Get or create user
app.post('/api/users/register', async (req, res) => {
  try {
    const { telegram_id, username } = req.body;
    
    if (!telegram_id) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if user exists
      const userCheck = await client.query(
        'SELECT id, balance, telegram_id FROM users WHERE telegram_id = $1',
        [telegram_id]
      );
      
      let user;
      if (userCheck.rows.length === 0) {
        // Create new user with 0 balance
        const newUser = await client.query(
          `INSERT INTO users (telegram_id, username, balance, created_at) 
           VALUES ($1, $2, $3, NOW()) 
           RETURNING id, telegram_id, balance`,
          [telegram_id, username || `Player_${telegram_id}`, 0.00]
        );
        user = newUser.rows[0];
        console.log(`👤 New user registered: ${telegram_id}`);
      } else {
        user = userCheck.rows[0];
      }
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        user: {
          id: user.id,
          telegram_id: user.telegram_id,
          balance: parseFloat(user.balance),
          username: username || `Player_${telegram_id}`
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Get user balance
// NEW: Using controller
app.get('/api/users/:telegram_id/balance', userController.getBalance);



// Check if user can play (has enough balance for at least 1 board)
app.get('/api/users/:telegram_id/can-play', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const BET_PER_BOARD = 10;    
    const result = await pool.query(
      'SELECT balance FROM users WHERE telegram_id = $1',
      [telegram_id]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        can_play: false,
        reason: 'User not registered',
        required: BET_PER_BOARD,
        current: 0
      });
    }
    
    const balance = parseFloat(result.rows[0].balance);
    const canPlay = balance >= BET_PER_BOARD;
    
    res.json({
      can_play: canPlay,
      reason: canPlay ? 'Sufficient balance' : 'Insufficient balance',
      required: BET_PER_BOARD,
      current: balance,
      deficit: Math.max(0, BET_PER_BOARD - balance)
    });
    
  } catch (error) {
    console.error('Can play check error:', error);
    res.status(500).json({ error: 'Failed to check play eligibility' });
  }
});

// ======================
// BUY BOARDS (DEDUCT 10 ETB PER BOARD + 20% COMMISSION)
// ======================
app.post('/api/game/buy-boards', gameController.buyBoards);
// ======================
// WINNER PRIZE DISTRIBUTION
// ======================
// NEW: Using controller
app.post('/api/game/win', gameController.processWin);
// ======================
// DEPOSIT HANDLING
// ======================

// Submit deposit request
// NEW: Using controller
app.post('/api/deposits/request', transactionController.requestDeposit);
// ======================
// ADMIN API ENDPOINTS
// ======================
const { requireAdmin } = require('./middleware/adminAuth');
// Get pending deposits for admin
app.get('/api/admin/transactions/pending', requireAdmin, adminController.getPendingDeposits);

// Approve deposit (admin verifies actual amount)
app.post('/api/admin/transactions/:id/approve', requireAdmin, adminController.approveDeposit);

// Reject deposit
app.post('/api/admin/transactions/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    
    const result = await pool.query(
      `UPDATE transactions 
       SET status = 'rejected',
           admin_notes = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING telegram_id`,
      [id, admin_notes || 'Rejected: Payment not verified']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const telegram_id = result.rows[0].telegram_id;
    
    // Notify user via socket
    io.emit('deposit_rejected', {
      telegram_id,
      transaction_id: id,
      reason: admin_notes || 'Payment not verified',
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: 'Deposit rejected',
      telegram_id
    });
    
  } catch (error) {
    console.error('Reject deposit error:', error);
    res.status(500).json({ error: 'Failed to reject deposit' });
  }
});

// ======================
// WITHDRAWAL HANDLING
// ======================

// Request withdrawal
app.post('/api/withdrawals/request', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { telegram_id, amount, account_number, account_name } = req.body;
    
    if (!telegram_id || !amount || !account_number) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['telegram_id', 'amount', 'account_number']
      });
    }
    
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < 50) {
      return res.status(400).json({ 
        error: 'Minimum withdrawal is 50 ETB' 
      });
    }
    
    await client.query('BEGIN');
    
    // Check user balance
    const userResult = await client.query(
      'SELECT id, balance FROM users WHERE telegram_id = $1 FOR UPDATE',
      [telegram_id]
    );
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const currentBalance = parseFloat(user.balance);
    
    if (withdrawAmount > currentBalance) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_BALANCE',
        message: 'You do not have sufficient balance for this withdrawal',
        requested: withdrawAmount,
        current: currentBalance,
        deficit: withdrawAmount - currentBalance
      });
    }
    
    // Reserve the amount (deduct immediately)
    const newBalance = currentBalance - withdrawAmount;
    await client.query(
      'UPDATE users SET balance = $1, updated_at = NOW() WHERE telegram_id = $2',
      [newBalance, telegram_id]
    );
    
    // Create withdrawal request
    const withdrawal = await client.query(
      `INSERT INTO transactions 
       (user_id, telegram_id, type, amount, status, metadata, created_at) 
       VALUES ($1, $2, 'withdraw', $3, 'processing', $4::jsonb, NOW())
       RETURNING id, amount, status`,
      [user.id, telegram_id, withdrawAmount, JSON.stringify({
        account_number,
        account_name,
        previous_balance: currentBalance,
        new_balance: newBalance
      })]
    );
    
    await client.query('COMMIT');
    
    console.log(`📤 Withdrawal request: ${telegram_id} - ${withdrawAmount} ETB`);
    console.log(`💰 New balance after reservation: ${newBalance} ETB`);
    
    // Notify admin via socket
    io.emit('new_withdrawal_request', {
      id: withdrawal.rows[0].id,
      telegram_id,
      amount: withdrawAmount,
      account_number,
      account_name,
      previous_balance: currentBalance,
      new_balance: newBalance,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: 'Withdrawal request submitted. Admin will process your payment.',
      transaction_id: withdrawal.rows[0].id,
      amount: withdrawAmount,
      status: 'processing',
      previous_balance: currentBalance,
      new_balance: newBalance
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Withdrawal request error:', error);
    res.status(500).json({ error: 'Failed to submit withdrawal request' });
  } finally {
    client.release();
  }
});

// Complete withdrawal (admin confirms money sent)
app.post('/api/admin/withdrawals/:id/complete', requireAdmin, adminController.completeWithdrawal);// ======================
// ADMIN DASHBOARD DATA
// ======================

// Get all users
app.get('/api/admin/users', requireAdmin, adminController.getAllUsers);

// Get all transactions
app.get('/api/admin/transactions', requireAdmin, adminController.getAllTransactions);

// Get admin commission summary
app.get('/api/admin/commission', requireAdmin, adminController.getCommissionStats);
// Get games history
app.get('/api/admin/games', requireAdmin, adminController.getAllGames);
// ======================
// SOCKET.IO REAL-TIME UPDATES
// ======================
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // Join user room
  socket.on('join_user', (telegram_id) => {
    socket.join(`user_${telegram_id}`);
    console.log(`👤 User ${telegram_id} joined room`);
  });
  
  // Join admin room
  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log('👑 Admin joined room');
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ======================
// HTML ROUTES
// ======================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
🎯 SHEBABINGO BACKEND SERVER READY
📍 Port: ${PORT}
🌐 Game: http://localhost:${PORT}
🔗 Admin: http://localhost:${PORT}/admin

💰 BACKEND HANDLES:
   • User registration & balance management
   • Deposit approval (admin verifies amount from screenshot)
   • Bet deduction (10 ETB per board) - WITH BALANCE CHECK
   • 20% commission recording
   • Winner prize distribution
   • Withdrawal processing (reserves balance immediately)
   • Real-time balance updates via Socket.IO

🎮 FRONTEND HANDLES (HTML/JavaScript):
   • Game logic (start/stop, number calling)
   • BINGO pattern detection
   • Prize calculation (80% of total bets)
   • Game UI and user interaction
   • Balance display updates
   • Auto-check for sufficient balance before playing

📱 REAL-TIME FEATURES:
   • Deposit/withdrawal notifications
   • Balance updates
   • Game state synchronization

⚠️ IMPORTANT:
   • Minimum deposit: 10 ETB
   • Minimum withdrawal: 50 ETB
   • Max boards per game: 3
   • Bet per board: 10 ETB
   • Commission: 20% of total bets
   📁 NEW MVC STRUCTURE ADDED:
   • controllers/ - Business logic
   • models/ - Database operations
   • middleware/ - Authentication

✅ Transitioning to MVC gradually...
   • Balance checking moved to controllers
   • Game logic moved to controllers
   • Admin operations moved to controllers

⚠️ KEPT EXISTING:
   • Database connection
   • Socket.IO setup
   • HTML routes
   • Server initialization
  `);
});