const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TOKEN';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const RENDER_URL = 'https://shebabingo-bot.onrender.com';

// Simple JSON database
const USERS_FILE = path.join(__dirname, 'users.json');
const DEPOSITS_FILE = path.join(__dirname, 'deposits.json');

// Load or create database
let users = {};
let deposits = [];

if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}
if (fs.existsSync(DEPOSITS_FILE)) {
    deposits = JSON.parse(fs.readFileSync(DEPOSITS_FILE, 'utf8'));
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
function saveDeposits() {
    fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits, null, 2));
}

// Serve frontend
app.use(express.static(path.join(__dirname, '../public')));

// ==================== TELEGRAM BOT ====================
app.post('/telegram-webhook', async (req, res) => {
    res.status(200).send('OK');
    
    try {
        const update = req.body;
        
        // Handle button clicks
        if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
            return;
        }
        
        // Handle commands
        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text || '';
            const userId = update.message.from.id;
            const username = update.message.from.username || update.message.from.first_name;
            
            // Initialize user if new
            if (!users[userId]) {
                users[userId] = {
                    id: userId,
                    username: username,
                    chatId: chatId,
                    balance: 0,
                    registered: false,
                    deposits: [],
                    referrals: [],
                    isAgent: false,
                    agentCode: 'AG' + userId.toString().slice(-6)
                };
                saveUsers();
            }
            
            const user = users[userId];
            
            // Handle /start command
            if (text === '/start') {
                if (!user.registered) {
                    await sendMessage(chatId, `🎮 *Welcome to SHEBA BINGO!* 🎰\n\nClick REGISTER to get 10 ETB FREE BONUS!`, {
                        inline_keyboard: [[
                            { text: "📝 REGISTER NOW", callback_data: "register" }
                        ]]
                    });
                } else {
                    await showMainMenu(chatId, user);
                }
            }
        }
    } catch (error) {
        console.error('Webhook error:', error.message);
    }
});

// Handle callback queries (button clicks)
async function handleCallbackQuery(callback) {
    const chatId = callback.message.chat.id;
    const userId = callback.from.id;
    const data = callback.data;
    const user = users[userId];
    
    // Answer callback query
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        callback_query_id: callback.id
    });
    
    switch(data) {
        case 'register':
            if (!user.registered) {
                user.registered = true;
                user.balance += 10; // Welcome bonus
                saveUsers();
                
                await sendMessage(chatId, `✅ *REGISTRATION SUCCESSFUL!*\n\n🎁 Welcome Bonus: *10 ETB*\n💰 Current Balance: *${user.balance} ETB*\n\n📱 Use menu below:`, {
                    inline_keyboard: [
                        [{ text: "🎮 PLAY", callback_data: "play" }],
                        [{ text: "💰 DEPOSIT", callback_data: "deposit" }, { text: "💰 WITHDRAW", callback_data: "withdraw" }],
                        [{ text: "📤 TRANSFER", callback_data: "transfer" }, { text: "💰 BALANCE", callback_data: "balance" }],
                        [{ text: "📖 INSTRUCTIONS", callback_data: "instructions" }, { text: "📞 SUPPORT", callback_data: "support" }],
                        [{ text: "👥 INVITE", callback_data: "invite" }, { text: "👑 AGENT", callback_data: "agent" }],
                        [{ text: "🤝 SUB-AGENT", callback_data: "subagent" }, { text: "💰 SALE", callback_data: "sale" }]
                    ]
                });
            }
            break;
            
        case 'play':
            await sendMessage(chatId, `🎮 *PLAY BINGO*\n\n💰 Balance: *${user.balance} ETB*\n\nClick below to start playing:`, {
                inline_keyboard: [[
                    { text: "🎯 START GAME", url: `${RENDER_URL}/game.html?user=${userId}` }
                ]]
            });
            break;
            
        case 'deposit':
            await sendMessage(chatId, `💰 *DEPOSIT MONEY*\n\nSend money to:\n📱 *TeleBirr: 0912345678*\n\nThen click below to upload screenshot:`, {
                inline_keyboard: [[
                    { text: "📸 UPLOAD SCREENSHOT", url: `${RENDER_URL}/deposit.html?user=${userId}` }
                ]]
            });
            break;
            
        case 'balance':
            await sendMessage(chatId, `💰 *YOUR BALANCE*\n\n💵 Available: *${user.balance} ETB*\n\n🎮 To play: Click PLAY button`, {
                inline_keyboard: [[
                    { text: "🎮 PLAY", callback_data: "play" },
                    { text: "💰 DEPOSIT", callback_data: "deposit" }
                ]]
            });
            break;
            
        case 'withdraw':
            await sendMessage(chatId, `📤 *WITHDRAW MONEY*\n\n💰 Balance: *${user.balance} ETB*\n\nMinimum withdrawal: *50 ETB*\n\nContact @AdminForWithdraw`);
            break;
            
        case 'transfer':
            await sendMessage(chatId, `📤 *TRANSFER MONEY*\n\nSend:\n/transfer [amount] [user_id]\n\nExample:\n/transfer 100 123456789`);
            break;
            
        case 'instructions':
            await sendMessage(chatId, `📖 *HOW TO PLAY*\n\n1. Register → Get 10 ETB bonus\n2. Deposit → Add more money\n3. Play → Click PLAY button\n4. Win → Match numbers\n\n📞 Support: @ShebaBingoSupport`);
            break;
            
        case 'support':
            await sendMessage(chatId, `📞 *SUPPORT*\n\n👤 Admin: @ShebaBingoAdmin\n⏰ 24/7 Support\n\n📱 Contact for:\n• Deposit issues\n• Withdrawal help\n• Game problems`);
            break;
            
        case 'invite':
            await sendMessage(chatId, `👥 *INVITE FRIENDS*\n\nYour referral link:\nhttps://t.me/ShebaBingoBot?start=${userId}\n\n🎁 Get 5 ETB per friend who registers and deposits!`);
            break;
            
        case 'agent':
            if (!user.isAgent) {
                await sendMessage(chatId, `👑 *BECOME AN AGENT*\n\nBenefits:\n• 10% commission on referrals\n• Special bonuses\n• Priority support\n\nRegister as agent:\n/agent_register`);
            } else {
                await sendMessage(chatId, `👑 *AGENT PANEL*\n\nYour Code: *${user.agentCode}*\nCommission: *50 ETB*\nReferrals: *${user.referrals.length}*\n\nCommands:\n/invitesubagent - Add sub-agent\n/sale - Check sales`);
            }
            break;
            
        case 'subagent':
            await sendMessage(chatId, `🤝 *SUB-AGENT*\n\nBecome sub-agent under an agent.\n\nSend:\n/subagent [agent_code]`);
            break;
            
        case 'sale':
            await sendMessage(chatId, `💰 *SALES REPORT*\n\nToday's Sales: *500 ETB*\nYour Commission: *50 ETB*\n\nCheck with:\n/sale_report`);
            break;
            
        default:
            await showMainMenu(chatId, user);
    }
}

// Show main menu
async function showMainMenu(chatId, user) {
    await sendMessage(chatId, `🎮 *SHEBA BINGO MENU*\n\n💰 Balance: *${user.balance} ETB*\n👤 Status: ${user.registered ? 'Registered ✅' : 'Not Registered'}\n\nChoose option:`, {
        inline_keyboard: [
            user.registered ? 
            [] : 
            [{ text: "📝 REGISTER", callback_data: "register" }],
            
            [{ text: "🎮 PLAY", callback_data: "play" }],
            [{ text: "💰 DEPOSIT", callback_data: "deposit" }, { text: "💰 WITHDRAW", callback_data: "withdraw" }],
            [{ text: "📤 TRANSFER", callback_data: "transfer" }, { text: "💰 BALANCE", callback_data: "balance" }],
            [{ text: "📖 INSTRUCTIONS", callback_data: "instructions" }, { text: "📞 SUPPORT", callback_data: "support" }],
            [{ text: "👥 INVITE", callback_data: "invite" }, { text: "👑 AGENT", callback_data: "agent" }],
            [{ text: "🤝 SUB-AGENT", callback_data: "subagent" }, { text: "💰 SALE", callback_data: "sale" }]
        ].filter(row => row.length > 0)
    });
}

// Send message function
async function sendMessage(chatId, text, replyMarkup = null) {
    try {
        const payload = {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        };
        
        if (replyMarkup) {
            payload.reply_markup = replyMarkup;
        }
        
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, payload);
    } catch (error) {
        console.error('Send error:', error.message);
    }
}

// ==================== ADMIN API ====================
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: 'admin-token' });
    } else {
        res.json({ success: false, error: 'Wrong password' });
    }
});

// Get pending deposits
app.get('/api/admin/deposits', (req, res) => {
    const pending = deposits.filter(d => d.status === 'pending');
    res.json({ deposits: pending });
});

// Approve deposit
app.post('/api/admin/approve', (req, res) => {
    const { depositId, amount, userId } = req.body;
    
    // Find deposit
    const deposit = deposits.find(d => d.id === depositId);
    if (deposit) {
        deposit.status = 'approved';
        
        // Add balance to user
        if (users[userId]) {
            users[userId].balance += amount;
            saveUsers();
            
            // Notify user
            sendMessage(users[userId].chatId, `✅ *DEPOSIT APPROVED!*\n\n💰 Amount: *${amount} ETB*\n🎁 New Balance: *${users[userId].balance} ETB*\n\n🎮 Click PLAY to start!`);
        }
        
        saveDeposits();
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'Deposit not found' });
    }
});

// Get all users
app.get('/api/admin/users', (req, res) => {
    res.json({ users: Object.values(users) });
});

// ==================== PLAYER API ====================
// Submit deposit
app.post('/api/deposit', (req, res) => {
    const { userId, amount, screenshot } = req.body;
    
    const deposit = {
        id: Date.now().toString(),
        userId: userId,
        amount: amount,
        screenshot: screenshot,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    deposits.push(deposit);
    saveDeposits();
    
    res.json({ success: true, message: 'Deposit submitted for approval' });
});

// Get user balance
app.get('/api/user/:id/balance', (req, res) => {
    const user = users[req.params.id];
    if (user) {
        res.json({ balance: user.balance });
    } else {
        res.json({ balance: 0 });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        users: Object.keys(users).length,
        pendingDeposits: deposits.filter(d => d.status === 'pending').length
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Sheba Bingo System running on port ${PORT}`);
    console.log(`🤖 Bot: Ready with all menus`);
    console.log(`👑 Admin: ${RENDER_URL}/admin.html`);
    console.log(`🎮 Game: ${RENDER_URL}/game.html`);
    console.log(`💰 Deposit: ${RENDER_URL}/deposit.html`);
});
