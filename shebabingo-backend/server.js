const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const db = require('./database.js');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ==================== 1. CONFIGURATION ====================
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "6297094384";
const BOT_TOKEN = process.env.BOT_TOKEN || "8274404754:AAF1q7ofQdkpMor6Gn6kRmQ7TBHE8o3toBg";

// ==================== 2. HELPER FUNCTIONS ====================

// Function to send Telegram notification
async function sendTelegramNotification(message, options = {}) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                ...options
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Telegram notification failed:', error);
    }
}

// Function to send a message to a specific user
async function sendTelegramToUser(userTelegramId, message) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: userTelegramId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Failed to send message to user:', error);
    }
}

// Simple admin check (replace with proper authentication later)
function isAdmin(telegramId) {
    const adminIds = [ADMIN_CHAT_ID]; // Add more admin IDs here
    return adminIds.includes(telegramId.toString());
}

// Function to parse Telebirr SMS and extract amount
function parseTeleBirrSMS(smsText) {
    const amountMatch = smsText.match(/transferred ETB\s*([0-9]+(?:\.[0-9]+)?)/i);
    const txIdMatch = smsText.match(/transaction number is\s*(\w+)/i);
    
    return {
        amount: amountMatch ? parseFloat(amountMatch[1]) : null,
        transaction_id: txIdMatch ? txIdMatch[1] : null,
        is_valid: amountMatch !== null
    };
}

// ==================== 3. MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve admin.html from public folder

// ==================== 4. ADMIN PANEL ENDPOINTS ====================

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'ShebaBingo Backend is running!',
        version: '1.0.0',
        admin_panel: 'Visit /admin.html for admin panel',
        endpoints: {
            register: 'POST /api/register',
            deposit: 'POST /api/deposit/sms',
            balance: 'GET /api/user/:telegram_id/balance'
        }
    });
});

// Get all users (for admin panel)
app.get('/api/admin/users', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transactions with filters (for admin panel)
app.get('/api/admin/transactions', async (req, res) => {
    try {
        const { status, type, limit = 50 } = req.query;
        let query = `
            SELECT t.*, u.telegram_id, u.username, u.balance as user_balance 
            FROM transactions t 
            JOIN users u ON t.user_id = u.id
        `;
        const conditions = [];
        const params = [];
        let paramCount = 1;
        
        if (status) {
            conditions.push(`t.status = $${paramCount}`);
            params.push(status);
            paramCount++;
        }
        if (type) {
            conditions.push(`t.type = $${paramCount}`);
            params.push(type);
            paramCount++;
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ` ORDER BY t.created_at DESC LIMIT $${paramCount}`;
        params.push(parseInt(limit));
        
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve transaction (for admin panel)
app.post('/api/admin/transaction/:id/approve', async (req, res) => {
    let client;
    
    try {
        const { id } = req.params;
        const { admin_id, notes } = req.body;
        
        // Get transaction using db helper
        const transaction = await db.getTransactionById(id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        if (transaction.type === 'deposit') {
            // For deposits: credit full amount to user balance
            client = await db.pool.connect();
            
            try {
                await client.query('BEGIN');
                
                await client.query(
                    'UPDATE users SET balance = balance + $1 WHERE id = $2',
                    [transaction.amount, transaction.user_id]
                );
                
                await client.query(
                    `UPDATE transactions 
                     SET status = 'completed', 
                         processed_at = NOW(),
                         metadata = COALESCE(metadata, '{}') || jsonb_build_object('admin_notes', $1)
                     WHERE id = $2`,
                    [notes || 'Approved via admin panel', id]
                );
                
                await client.query('COMMIT');
                
                // Notify user
                await sendTelegramToUser(transaction.telegram_id,
                    `✅ Deposit approved!\n\n` +
                    `Your balance has been credited with ${transaction.amount} birr.\n\n` +
                    `Current Balance: ${(parseFloat(transaction.user_balance) + parseFloat(transaction.amount)).toFixed(1)}`
                );
                
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
            
        } else if (transaction.type === 'withdraw') {
            // For withdrawals: mark as completed (admin should send money manually)
            client = await db.pool.connect();
            
            try {
                await client.query('BEGIN');
                
                await client.query(
                    `UPDATE transactions 
                     SET status = 'completed', 
                         processed_at = NOW(),
                         metadata = COALESCE(metadata, '{}') || jsonb_build_object(
                             'admin_notes', $1,
                             'money_sent_at', NOW()
                         )
                     WHERE id = $2`,
                    [notes || 'Money sent via Telebirr', id]
                );
                
                // Deduct from user balance
                await client.query(
                    'UPDATE users SET balance = balance - $1 WHERE id = $2',
                    [transaction.amount, transaction.user_id]
                );
                
                await client.query('COMMIT');
                
                // Notify user
                await sendTelegramToUser(transaction.telegram_id,
                    `✅ Withdrawal processed!\n\n` +
                    `${transaction.amount} ETB has been sent to your account.\n` +
                    `It should arrive within a few minutes.`
                );
                
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }
        
        res.json({
            success: true,
            message: `Transaction #${id} approved successfully`
        });
        
    } catch (error) {
        if (client) {
            client.release();
        }
        res.status(500).json({ error: error.message });
    }
});

// Reject transaction (for admin panel)
app.post('/api/admin/transaction/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        // Get transaction using db helper
        const transaction = await db.getTransactionById(id);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        // Update transaction status using db helper
        await db.updateTransactionStatus(id, 'rejected', { 
            rejection_reason: reason || 'Payment not verified' 
        });
        
        // Notify user
        if (transaction.type === 'deposit') {
            await sendTelegramToUser(transaction.telegram_id,
                `❌ Deposit rejected\n\n` +
                `Reason: ${reason || 'Payment not verified'}\n\n` +
                `Please check the payment details and try again.`
            );
        } else if (transaction.type === 'withdraw') {
            await sendTelegramToUser(transaction.telegram_id,
                `❌ Withdrawal rejected\n\n` +
                `Reason: ${reason || 'Invalid account details'}\n\n` +
                `Your balance has not been deducted.`
            );
        }
        
        res.json({
            success: true,
            message: `Transaction #${id} rejected`
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test notification endpoint (for admin panel)
app.post('/api/admin/test-notification', async (req, res) => {
    try {
        await sendTelegramNotification(
            '📱 Test Notification from Admin Panel\n\n' +
            'This confirms your admin panel notifications are working!\n' +
            'Time: ' + new Date().toLocaleString()
        );
        
        res.json({
            success: true,
            message: 'Test notification sent to Telegram'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { telegram_id, username } = req.body;
        
        if (!telegram_id) {
            return res.status(400).json({ error: 'telegram_id is required' });
        }
        
        // Create or get user using db helper
        const user = await db.createUser(telegram_id, username);
        
        res.json({
            success: true,
            user: {
                id: user.id,
                telegram_id: user.telegram_id,
                username: user.username,
                balance: user.balance
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user balance
app.get('/api/user/:telegram_id/balance', async (req, res) => {
    try {
        const { telegram_id } = req.params;
        const user = await db.getUserByTelegramId(telegram_id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            success: true,
            balance: user.balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== 5. DEPOSIT SYSTEM ====================

// Endpoint to handle SMS text from user (sent by Telegram bot)
app.post('/api/deposit/sms', async (req, res) => {
    let client;
    
    try {
        const { telegram_id, sms_text } = req.body;

        // Validate input
        if (!telegram_id || !sms_text) {
            return res.status(400).json({ error: 'telegram_id and sms_text are required' });
        }

        // Parse SMS
        const parsed = parseTeleBirrSMS(sms_text);
        if (!parsed.is_valid || !parsed.amount) {
            return res.status(400).json({ 
                error: 'Invalid SMS format. Please paste the complete Telebirr message.' 
            });
        }

        // Get user using db helper
        const user = await db.getUserByTelegramId(telegram_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found. Please register first with /start' });
        }

        // Start transaction
        client = await db.pool.connect();
        await client.query('BEGIN');

        // Create PENDING transaction
        const txResult = await client.query(
            `INSERT INTO transactions 
             (user_id, type, amount, status, metadata) 
             VALUES ($1, 'deposit', $2, 'pending', $3) 
             RETURNING *`,
            [user.id, parsed.amount, {
                sms_text: sms_text,
                transaction_id: parsed.transaction_id,
                parsed_amount: parsed.amount,
                payment_method: 'telebirr',
                received_at: new Date().toISOString()
            }]
        );

        const transaction = txResult.rows[0];
        await client.query('COMMIT');
        client.release();

        // ===== NOTIFY ADMIN =====
        const adminMessage = `💰 <b>NEW DEPOSIT REQUEST #${transaction.id}</b>\n\n` +
            `👤 User: <code>${telegram_id}</code>\n` +
            `💵 Amount: <b>${parsed.amount} ETB</b>\n` +
            `🏦 Method: Telebirr\n` +
            `🆔 TX ID: ${parsed.transaction_id || 'N/A'}\n` +
            `🕐 Time: ${new Date().toLocaleString()}\n\n` +
            `📝 <b>SMS Text:</b>\n<code>${sms_text.substring(0, 150)}...</code>\n\n` +
            `⚡ <b>Quick Actions:</b>\n` +
            `/approve_${transaction.id} - Approve and credit ${parsed.amount} ETB\n` +
            `/reject_${transaction.id} - Reject deposit`;

        await sendTelegramNotification(adminMessage, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "✅ Approve", callback_data: `approve_${transaction.id}` },
                        { text: "❌ Reject", callback_data: `reject_${transaction.id}` }
                    ]
                ]
            }
        });

        // ===== ACKNOWLEDGE USER =====
        await sendTelegramToUser(telegram_id,
            `📥 Deposit request received!\n\n` +
            `Amount: ${parsed.amount} ETB\n` +
            `Status: ⏳ Pending verification\n\n` +
            `Admin will verify your payment and credit your account within 1 minute.`
        );

        res.json({
            success: true,
            message: 'Deposit request received and sent for admin approval',
            transaction_id: transaction.id,
            amount: parsed.amount
        });

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
            client.release();
        }
        res.status(500).json({ error: error.message });
    }
});

// ==================== 6. ADMIN APPROVAL SYSTEM ====================

// Function to approve deposit (CREDITS FULL AMOUNT - NO COMMISSION)
async function approveDeposit(transactionId, adminTelegramId) {
    try {
        // Get transaction using db helper
        const transaction = await db.getTransactionById(transactionId);
        if (!transaction || transaction.type !== 'deposit' || transaction.status !== 'pending') {
            throw new Error('Transaction not found or already processed');
        }

        const depositAmount = parseFloat(transaction.amount);

        // CREDIT FULL AMOUNT TO USER BALANCE (NO COMMISSION)
        const updatedUser = await db.updateUserBalance(transaction.user_id, depositAmount);
        
        // Update transaction status using db helper
        await db.updateTransactionStatus(transactionId, 'completed', {}, adminTelegramId);

        return {
            success: true,
            transaction_id: transactionId,
            user: {
                telegram_id: transaction.telegram_id,
                old_balance: parseFloat(transaction.user_balance),
                new_balance: parseFloat(updatedUser.balance)
            },
            amount: depositAmount
        };

    } catch (error) {
        console.error('Deposit approval failed:', error);
        throw error;
    }
}

// Admin Telegram webhook (for button clicks and commands)
app.post('/telegram-webhook', async (req, res) => {
    const update = req.body;

    // Handle callback queries (button clicks)
    if (update.callback_query) {
        const { data, from, message } = update.callback_query;
        const adminId = from.id.toString();

        if (!isAdmin(adminId)) {
            return res.sendStatus(403);
        }

        if (data.startsWith('approve_')) {
            const txId = data.replace('approve_', '');
            
            try {
                const result = await approveDeposit(txId, adminId);
                
                // Notify admin of success
                await sendTelegramNotification(
                    `✅ Deposit #${txId} Approved!\n\n` +
                    `User: ${result.user.telegram_id}\n` +
                    `Amount: ${result.amount} ETB\n` +
                    `New Balance: ${result.user.new_balance} ETB`,
                    { chat_id: ADMIN_CHAT_ID }
                );
                
                // Notify player
                await sendTelegramToUser(
                    result.user.telegram_id,
                    `✅ Deposit approved!\n\n` +
                    `Your balance has been credited with ${result.amount} birr.\n\n` +
                    `Current Balance: ${result.user.new_balance.toFixed(1)}\n\n` +
                    `Thank you! 🎮`
                );
                
            } catch (error) {
                await sendTelegramNotification(
                    `❌ Failed to approve deposit #${txId}:\n${error.message}`,
                    { chat_id: ADMIN_CHAT_ID }
                );
            }
        }
        
        // Send "OK" to Telegram
        res.send('OK');
        return;
    }

    // Handle text commands from admin
    if (update.message && update.message.text) {
        const { text, from } = update.message;
        const adminId = from.id.toString();

        if (!isAdmin(adminId)) {
            return res.send('OK');
        }

        // Handle /approve_123 command
        if (text.startsWith('/approve_')) {
            const txId = text.replace('/approve_', '').trim();
            
            try {
                const result = await approveDeposit(txId, adminId);
                
                // Send confirmation
                await sendTelegramNotification(
                    `✅ Deposit #${txId} approved via command.\n` +
                    `User ${result.user.telegram_id} now has ${result.user.new_balance} ETB.`,
                    { chat_id: adminId }
                );
                
            } catch (error) {
                await sendTelegramNotification(
                    `❌ Error: ${error.message}`,
                    { chat_id: adminId }
                );
            }
        }
        
        // Handle /pending command
        if (text === '/pending') {
            try {
                const pending = await db.getPendingTransactions('deposit');
                
                let message = "📋 <b>PENDING DEPOSITS</b>\n\n";
                if (pending.length === 0) {
                    message += "No pending deposits.";
                } else {
                    pending.forEach(tx => {
                        const amount = tx.metadata?.parsed_amount || tx.amount;
                        message += `🆔 #${tx.id} | ${amount} ETB | User: ${tx.telegram_id}\n`;
                        message += `/approve_${tx.id} | /reject_${tx.id}\n\n`;
                    });
                }
                
                await sendTelegramNotification(message, { chat_id: adminId });
                
            } catch (error) {
                console.error('Error fetching pending:', error);
            }
        }
    }

    res.send('OK');
});

// ==================== 7. GAME & COMMISSION SYSTEM ====================

// Calculate commission from game (20% of total bets)
function calculateGameCommission(totalBets) {
    const commissionRate = 0.20; // 20% commission
    return totalBets * commissionRate;
}

// Endpoint to handle game completion and commission
app.post('/api/game/complete', async (req, res) => {
    let client;
    
    try {
        const { game_id, total_bets, winner_id, players } = req.body;
        
        // Calculate prize pool (total bets minus 20% commission)
        const commission = calculateGameCommission(total_bets);
        const prizePool = total_bets - commission;

        client = await db.pool.connect();
        await client.query('BEGIN');

        // Record commission transaction
        await client.query(
            `INSERT INTO transactions (type, amount, status, metadata) 
             VALUES ('commission', $1, 'completed', $2)`,
            [commission, {
                game_id: game_id,
                total_bets: total_bets,
                commission_rate: 0.20,
                prize_pool: prizePool
            }]
        );

        // Award prize to winner (if any)
        if (winner_id) {
            await client.query(
                `UPDATE users SET balance = balance + $1 WHERE id = $2`,
                [prizePool, winner_id]
            );

            await client.query(
                `INSERT INTO transactions (user_id, type, amount, status, metadata) 
                 VALUES ($1, 'win', $2, 'completed', $3)`,
                [winner_id, prizePool, { game_id: game_id }]
            );
        }

        // Deduct bet amounts from players
        for (const player of players) {
            await client.query(
                `UPDATE users SET balance = balance - $1 WHERE id = $2`,
                [player.bet_amount, player.user_id]
            );

            await client.query(
                `INSERT INTO transactions (user_id, type, amount, status, metadata) 
                 VALUES ($1, 'bet', $2, 'completed', $3)`,
                [player.user_id, player.bet_amount, { game_id: game_id }]
            );
        }

        await client.query('COMMIT');
        client.release();

        res.json({
            success: true,
            commission_taken: commission,
            prize_pool: prizePool,
            message: winner_id ? `Prize of ${prizePool} ETB awarded to winner` : 'Game completed, commission recorded'
        });

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
            client.release();
        }
        res.status(500).json({ error: error.message });
    }
});

// ==================== 8. WITHDRAWAL SYSTEM ====================

// Request withdrawal
app.post('/api/withdraw', async (req, res) => {
    let client;
    
    try {
        const { telegram_id, amount, account_number } = req.body;
        
        // Get user using db helper
        const user = await db.getUserByTelegramId(telegram_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Start transaction
        client = await db.pool.connect();
        await client.query('BEGIN');

        // Create pending withdrawal using db helper
        const transaction = await db.createTransaction({
            user_id: user.id,
            type: 'withdraw',
            amount: amount,
            status: 'pending',
            metadata: {
                account_number: account_number,
                requested_at: new Date().toISOString()
            }
        });

        await client.query('COMMIT');
        client.release();

        // Notify admin
        await sendTelegramNotification(
            `📤 <b>WITHDRAWAL REQUEST #${transaction.id}</b>\n\n` +
            `👤 User: ${telegram_id}\n` +
            `💵 Amount: ${amount} ETB\n` +
            `📱 Account: ${account_number}\n` +
            `💰 Current Balance: ${user.balance} ETB\n\n` +
            `⚡ <b>Actions:</b>\n` +
            `/withdraw_approve_${transaction.id} - Approve and send money\n` +
            `/withdraw_reject_${transaction.id} - Reject withdrawal`,
            {
                reply_markup: {
                    inline_keyboard: [[
                        { text: "✅ Approve", callback_data: `withdraw_approve_${transaction.id}` },
                        { text: "❌ Reject", callback_data: `withdraw_reject_${transaction.id}` }
                    ]]
                }
            }
        );

        res.json({
            success: true,
            message: 'Withdrawal request submitted. Admin will process it shortly.'
        });

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
            client.release();
        }
        res.status(500).json({ error: error.message });
    }
});

// Get dashboard statistics
app.get('/api/admin/dashboard-stats', async (req, res) => {
    try {
        const stats = await db.getDashboardStats();
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== 9. SERVER SETUP ====================

// Start server
const server = app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📱 Telegram Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
    console.log(`👑 Admin Chat ID: ${ADMIN_CHAT_ID}`);
});

// Set up Socket.io
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    
    socket.on('join-game', (data) => {
        socket.join(`game-${data.gameId}`);
        io.to(`game-${data.gameId}`).emit('player-joined', {
            playerId: socket.id,
            gameId: data.gameId
        });
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down...');
    db.close();
    server.close();
    process.exit(0);
});