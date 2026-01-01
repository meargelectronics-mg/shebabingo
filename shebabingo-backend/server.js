const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CONFIGURATION ====================
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8274404754:AAGnc1QeczvHP51dIryK2sK-E8aUUyiO6Zc';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'shebabingo@23';
const RENDER_URL = process.env.RENDER_URL || 'https://shebabingo-bot.onrender.com';
// ==================== SET WEBHOOK ON STARTUP ====================
const setupTelegramWebhook = async () => {
    try {
        const webhookUrl = `${RENDER_URL}/telegram-webhook`;
        
        console.log('='.repeat(60));
        console.log('🔧 TELEGRAM BOT CONFIGURATION');
        console.log('='.repeat(60));
        console.log(`🤖 Bot Token: ${BOT_TOKEN ? 'SET' : 'NOT SET'}`);
        console.log(`🌐 Webhook URL: ${webhookUrl}`);
        console.log('='.repeat(60));
        
        // Delete any existing webhook
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
        console.log('✅ Old webhook deleted');
        
        // Set webhook to OUR server.js
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            url: webhookUrl,
            allowed_updates: ["message", "callback_query", "inline_query"]
        });
        
        console.log('✅ Webhook set successfully:', response.data.description);
        
        // Check current webhook info
        const webhookInfo = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
        console.log('📡 Current Webhook Info:', JSON.stringify(webhookInfo.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error setting webhook:', error.message);
    }
};

// Call it when server starts
setupTelegramWebhook();

// ==================== SIMPLE DATABASE ====================
const USERS_FILE = path.join(__dirname, 'users.json');
const DEPOSITS_FILE = path.join(__dirname, 'deposits.json');

let users = {};
let deposits = [];

// Load database
if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}
if (fs.existsSync(DEPOSITS_FILE)) {
    deposits = JSON.parse(fs.readFileSync(DEPOSITS_FILE, 'utf8'));
}

// Save functions
function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
function saveDeposits() {
    fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits, null, 2));
}

// ==================== SERVE FRONTEND ====================
app.use(express.static(path.join(__dirname, '../public')));

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ==================== TELEGRAM BOT HANDLER (LIKE @joybingobot) ====================
app.post('/telegram-webhook', async (req, res) => {
    res.status(200).send('OK');
    
    try {
        const update = req.body;
        
        // Handle button clicks
        if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
            return;
        }
        
        // Handle messages
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
                    isAgent: false,
                    agentCode: 'AG' + userId.toString().slice(-6),
                    joinDate: new Date().toISOString()
                };
                saveUsers();
            }
            
            const user = users[userId];
            
            // Handle /start command (like @joybingobot)
            if (text === '/start') {
                if (!user.registered) {
                    await sendTelegramMessage(chatId, 
                        `🎮 *Welcome to SHEBA BINGO!* 🎰\n\n` +
                        `Click REGISTER to get 10 ETB FREE BONUS!`,
                        {
                            inline_keyboard: [[
                                { text: "📝 REGISTER NOW", callback_data: "register" }
                            ]]
                        }
                    );
                } else {
                    await showMainMenu(chatId, user);
                }
            }
            // Handle photo messages (screenshots for deposit)
            else if (update.message.photo) {
                const photo = update.message.photo[update.message.photo.length - 1];
                
                // Store deposit
                const depositId = Date.now().toString();
                deposits.push({
                    id: depositId,
                    userId: userId,
                    username: user.username,
                    chatId: chatId,
                    fileId: photo.file_id,
                    status: 'pending',
                    date: new Date().toISOString(),
                    method: 'telebirr'
                });
                saveDeposits();
                
                await sendTelegramMessage(chatId,
                    `📸 *Screenshot received!*\n\n` +
                    `✅ Admin will review and add balance.\n` +
                    `⏰ Processing time: 2-5 minutes\n\n` +
                    `💰 Your current balance: *${user.balance} ETB*`
                );
                
                console.log(`📸 New deposit from ${user.username}`);
                
                // Notify admin (like @joybingobot)
                await sendTelegramMessage(ADMIN_CHAT_ID || userId,
                    `📥 *NEW DEPOSIT SCREENSHOT*\n\n` +
                    `👤 User: @${user.username}\n` +
                    `💰 Current Balance: ${user.balance} ETB\n` +
                    `🕐 Time: ${new Date().toLocaleString()}\n\n` +
                    `⚡ Approve in admin panel:\n` +
                    `${RENDER_URL}/admin.html`
                );
            }
            // Handle text messages
            else if (text) {
                // If it's a command like /deposit, /balance, etc.
                if (text.startsWith('/')) {
                    switch(text) {
                        case '/deposit':
                            await sendTelegramMessage(chatId,
                                `💰 *CHOOSE PAYMENT METHOD*\n\n` +
                                `1️⃣ *TeleBirr*: 0912345678\n` +
                                `2️⃣ *CBE*: 1000345678900\n` +
                                `3️⃣ *BoA*: 2000123456789\n\n` +
                                `📸 *After payment, send screenshot here*\n` +
                                `⏰ Approval: 2-5 minutes\n\n` +
                                `💵 *Minimum:* 10 ETB`,
                                {
                                    inline_keyboard: [
                                        [{ text: "📱 TeleBirr", callback_data: "telebirr" }],
                                        [{ text: "🏦 CBE", callback_data: "cbe" }],
                                        [{ text: "🏛️ BoA", callback_data: "boa" }]
                                    ]
                                }
                            );
                            break;
                            
                        case '/balance':
                            await sendTelegramMessage(chatId,
                                `💰 *YOUR BALANCE*\n\n` +
                                `💵 Available: *${user.balance} ETB*\n\n` +
                                `🎮 To play: Click PLAY button`,
                                {
                                    inline_keyboard: [[
                                        { text: "🎮 PLAY", callback_data: "play" },
                                        { text: "💰 DEPOSIT", callback_data: "deposit" }
                                    ]]
                                }
                            );
                            break;
                            
                        case '/play':
                            await sendTelegramMessage(chatId,
                                `🎮 *PLAY BINGO*\n\n` +
                                `💰 Balance: *${user.balance} ETB*\n\n` +
                                `Click below to start playing:`,
                                {
                                    inline_keyboard: [[
                                        { text: "🎯 START GAME", url: `${RENDER_URL}/?user=${userId}` }  // ✅ CORRECT: Uses / not /game.html
                                    ]]
                                }
                            );
                            break;
                            
                        case '/help':
                            await sendTelegramMessage(chatId,
                                `📞 *SUPPORT*\n\n` +
                                `👤 Admin: @ShebaBingoAdmin\n` +
                                `📱 Phone: +251945343143\n` +
                                `⏰ 24/7 Support\n\n` +
                                `📧 Contact for:\n` +
                                `• Deposit issues\n` +
                                `• Withdrawal help\n` +
                                `• Game problems`
                            );
                            break;
                            
                        default:
                            await sendTelegramMessage(chatId,
                                `📝 I received your command: ${text}\n\n` +
                                `Use these commands:\n` +
                                `/start - Show menu\n` +
                                `/play - Start game\n` +
                                `/deposit - Add funds\n` +
                                `/balance - Check balance\n` +
                                `/help - Get help`
                            );
                    }
                } else {
                    // Regular text message
                    await sendTelegramMessage(chatId,
                        `📝 I received your message\n\n` +
                        `Use /help to see available commands.`
                    );
                }
            }
        }

            console.log('📱 Telegram Update:', JSON.stringify({
            type: update.message ? 'message' : update.callback_query ? 'callback' : 'other',
            chatId: update.message?.chat?.id || update.callback_query?.message?.chat?.id,
            text: update.message?.text || update.callback_query?.data,
            userId: update.message?.from?.id || update.callback_query?.from?.id
        }, null, 2));
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
                
                await sendTelegramMessage(chatId,
                    `✅ *REGISTRATION SUCCESSFUL!*\n\n` +
                    `🎁 Welcome Bonus: *10 ETB*\n` +
                    `💰 Current Balance: *${user.balance} ETB*\n\n` +
                    `🎮 Click PLAY to start!`,
                    getMainMenuKeyboard()
                );
            }
            break;
            
        case 'play':
            await sendTelegramMessage(chatId,
                `🎮 *PLAY BINGO*\n\n` +
                `💰 Balance: *${user.balance} ETB*\n\n` +
                `Click below to start playing:`,
                {
                    inline_keyboard: [[
                        { text: "🎯 START GAME", url: `${RENDER_URL}/?user=${userId}` }  // ✅ CORRECT LINK
                    ]]
                }
            );
            break;
            
        case 'deposit':
            await sendTelegramMessage(chatId,
                `💰 *CHOOSE PAYMENT METHOD*\n\n` +
                `1️⃣ *TeleBirr*: 0912345678\n` +
                `2️⃣ *CBE*: 1000345678900\n` +
                `3️⃣ *BoA*: 2000123456789\n\n` +
                `📸 *After payment, send screenshot here*\n` +
                `⏰ Approval: 2-5 minutes\n\n` +
                `💵 *Minimum:* 10 ETB`,
                {
                    inline_keyboard: [
                        [{ text: "📱 TeleBirr", callback_data: "telebirr" }],
                        [{ text: "🏦 CBE", callback_data: "cbe" }],
                        [{ text: "🏛️ BoA", callback_data: "boa" }]
                    ]
                }
            );
            break;
            
        case 'telebirr':
            await sendTelegramMessage(chatId,
                `📱 *TeleBirr Payment*\n\n` +
                `Send to: *0912345678*\n` +
                `Account: SHEBA BINGO\n\n` +
                `📸 Send screenshot after payment\n\n` +
                `✅ Balance will be added within 5 minutes`
            );
            break;
            
        case 'cbe':
            await sendTelegramMessage(chatId,
                `🏦 *CBE Payment*\n\n` +
                `Account: *1000345678900*\n` +
                `Name: SHEBA BINGO\n\n` +
                `📸 Send screenshot after payment`
            );
            break;
            
        case 'boa':
            await sendTelegramMessage(chatId,
                `🏛️ *BoA Payment*\n\n` +
                `Account: *2000123456789*\n` +
                `Name: SHEBA BINGO\n\n` +
                `📸 Send screenshot after payment`
            );
            break;
            
        case 'balance':
            await sendTelegramMessage(chatId,
                `💰 *YOUR BALANCE*\n\n` +
                `💵 Available: *${user.balance} ETB*\n\n` +
                `🎮 To play: Click PLAY button`,
                {
                    inline_keyboard: [[
                        { text: "🎮 PLAY", callback_data: "play" },
                        { text: "💰 DEPOSIT", callback_data: "deposit" }
                    ]]
                }
            );
            break;
            
        case 'withdraw':
            await sendTelegramMessage(chatId,
                `📤 *WITHDRAW MONEY*\n\n` +
                `💰 Balance: *${user.balance} ETB*\n\n` +
                `Minimum withdrawal: *50 ETB*\n\n` +
                `Contact @AdminForWithdraw\n` +
                `📱 +251945343143`
            );
            break;
            
        case 'transfer':
            await sendTelegramMessage(chatId,
                `📤 *TRANSFER MONEY*\n\n` +
                `Send:\n` +
                `/transfer [amount] [user_id]\n\n` +
                `Example:\n` +
                `/transfer 100 123456789`
            );
            break;
            
        case 'instructions':
            await sendTelegramMessage(chatId,
                `📖 *HOW TO PLAY*\n\n` +
                `1. Register → Get 10 ETB bonus\n` +
                `2. Deposit → Add more money\n` +
                `3. Play → Click PLAY button\n` +
                `4. Win → Match numbers\n\n` +
                `📞 Support: @ShebaBingoSupport`
            );
            break;
            
        case 'support':
            await sendTelegramMessage(chatId,
                `📞 *SUPPORT*\n\n` +
                `👤 Admin: @ShebaBingoAdmin\n` +
                `📱 Phone: +251945343143\n` +
                `⏰ 24/7 Support\n\n` +
                `📧 Contact for:\n` +
                `• Deposit issues\n` +
                `• Withdrawal help\n` +
                `• Game problems`
            );
            break;
            
        case 'invite':
            await sendTelegramMessage(chatId,
                `👥 *INVITE FRIENDS*\n\n` +
                `Your referral link:\n` +
                `https://t.me/ShebaBingoBot?start=${userId}\n\n` +
                `🎁 Get 5 ETB per friend who registers and deposits!`
            );
            break;
            
        case 'agent':
            if (!user.isAgent) {
                await sendTelegramMessage(chatId,
                    `👑 *BECOME AN AGENT*\n\n` +
                    `Benefits:\n` +
                    `• 10% commission on referrals\n` +
                    `• Special bonuses\n` +
                    `• Priority support\n\n` +
                    `Register as agent:\n` +
                    `/agent_register`
                );
            } else {
                await sendTelegramMessage(chatId,
                    `👑 *AGENT PANEL*\n\n` +
                    `Your Code: *${user.agentCode}*\n` +
                    `Commission: *50 ETB*\n` +
                    `Referrals: *${user.referrals?.length || 0}*\n\n` +
                    `Commands:\n` +
                    `/invitesubagent - Add sub-agent\n` +
                    `/sale - Check sales`
                );
            }
            break;
            
        case 'subagent':
            await sendTelegramMessage(chatId,
                `🤝 *SUB-AGENT*\n\n` +
                `Become sub-agent under an agent.\n\n` +
                `Send:\n` +
                `/subagent [agent_code]`
            );
            break;
            
        case 'sale':
            await sendTelegramMessage(chatId,
                `💰 *SALES REPORT*\n\n` +
                `Today's Sales: *500 ETB*\n` +
                `Your Commission: *50 ETB*\n\n` +
                `Check with:\n` +
                `/sale_report`
            );
            break;
            
        default:
            await showMainMenu(chatId, user);
    }
}

// Get main menu keyboard
function getMainMenuKeyboard() {
    return {
        inline_keyboard: [
            [{ text: "🎮 PLAY", callback_data: "play" }],
            [{ text: "💰 DEPOSIT", callback_data: "deposit" }, { text: "💰 WITHDRAW", callback_data: "withdraw" }],
            [{ text: "📤 TRANSFER", callback_data: "transfer" }, { text: "💰 BALANCE", callback_data: "balance" }],
            [{ text: "📖 INSTRUCTIONS", callback_data: "instructions" }, { text: "📞 SUPPORT", callback_data: "support" }],
            [{ text: "👥 INVITE", callback_data: "invite" }, { text: "👑 AGENT", callback_data: "agent" }],
            [{ text: "🤝 SUB-AGENT", callback_data: "subagent" }, { text: "💰 SALE", callback_data: "sale" }]
        ]
    };
}

// Show main menu
async function showMainMenu(chatId, user) {
    await sendTelegramMessage(chatId,
        `🎮 *SHEBA BINGO MENU*\n\n` +
        `💰 Balance: *${user.balance} ETB*\n` +
        `👤 Status: ${user.registered ? 'Registered ✅' : 'Not Registered'}\n\n` +
        `Choose option:`,
        getMainMenuKeyboard()
    );
}

// Send Telegram message function
async function sendTelegramMessage(chatId, text, replyMarkup = null) {
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
        console.error('Telegram send error:', error.message);
    }
}

// ==================== API FOR GAME BALANCE ====================

// Get user balance (for game)
app.get('/api/user/:id/balance', (req, res) => {
    const user = users[req.params.id];
    if (user) {
        res.json({ 
            success: true, 
            balance: user.balance,
            username: user.username,
            registered: user.registered 
        });
    } else {
        res.json({ 
            success: false, 
            balance: 0,
            username: 'Guest',
            registered: false 
        });
    }
});

// Deduct game fee
app.post('/api/game/play', (req, res) => {
    const { userId, amount } = req.body;
    
    if (!users[userId]) {
        return res.json({ success: false, error: 'User not found' });
    }
    
    if (users[userId].balance < amount) {
        return res.json({ success: false, error: 'Insufficient balance' });
    }
    
    users[userId].balance -= amount;
    saveUsers();
    
    res.json({ 
        success: true, 
        newBalance: users[userId].balance,
        message: `Game fee ${amount} ETB deducted`
    });
});

// Add winnings
app.post('/api/game/win', (req, res) => {
    const { userId, amount } = req.body;
    
    if (!users[userId]) {
        return res.json({ success: false, error: 'User not found' });
    }
    
    users[userId].balance += amount;
    saveUsers();
    
    // Notify user
    sendTelegramMessage(users[userId].chatId,
        `🎉 *YOU WON ${amount} ETB!*\n\n` +
        `💰 New Balance: *${users[userId].balance} ETB*\n\n` +
        `🎮 Keep playing to win more!`
    );
    
    res.json({ 
        success: true, 
        newBalance: users[userId].balance,
        message: `Prize ${amount} ETB added`
    });
});

// ==================== ADMIN API ====================

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
        res.json({ 
            success: true, 
            token: 'admin-token-' + Date.now(),
            message: 'Login successful' 
        });
    } else {
        res.json({ 
            success: false, 
            error: 'Invalid password' 
        });
    }
});

// Get pending deposits
app.get('/api/admin/deposits', (req, res) => {
    const pending = deposits.filter(d => d.status === 'pending');
    
    // Add user info
    const depositsWithUserInfo = pending.map(deposit => ({
        ...deposit,
        user: users[deposit.userId] || { username: 'Unknown' }
    }));
    
    res.json({ 
        success: true, 
        deposits: depositsWithUserInfo,
        count: pending.length 
    });
});

// Approve deposit
app.post('/api/admin/approve', (req, res) => {
    const { depositId, amount } = req.body;
    
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit) {
        return res.json({ success: false, error: 'Deposit not found' });
    }
    
    const user = users[deposit.userId];
    if (!user) {
        return res.json({ success: false, error: 'User not found' });
    }
    
    // Update deposit status
    deposit.status = 'approved';
    deposit.approvedAmount = amount;
    deposit.approvedAt = new Date().toISOString();
    
    // Add balance to user
    user.balance += parseFloat(amount);
    saveUsers();
    saveDeposits();
    
    // Notify user
    sendTelegramMessage(user.chatId,
        `✅ *DEPOSIT APPROVED!*\n\n` +
        `💰 Amount: *${amount} ETB*\n` +
        `🎁 New Balance: *${user.balance} ETB*\n\n` +
        `🎮 Click PLAY to start!`
    );
    
    res.json({ 
        success: true, 
        message: 'Deposit approved and balance added',
        newBalance: user.balance 
    });
});

// Reject deposit
app.post('/api/admin/reject', (req, res) => {
    const { depositId } = req.body;
    
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit) {
        return res.json({ success: false, error: 'Deposit not found' });
    }
    
    const user = users[deposit.userId];
    
    // Update deposit status
    deposit.status = 'rejected';
    deposit.rejectedAt = new Date().toISOString();
    saveDeposits();
    
    // Notify user
    if (user) {
        sendTelegramMessage(user.chatId,
            `❌ *DEPOSIT REJECTED*\n\n` +
            `Your deposit was not approved.\n` +
            `Please check:\n` +
            `1. Correct payment amount\n` +
            `2. Clear screenshot\n` +
            `3. Valid transaction\n\n` +
            `Contact support for help.`
        );
    }
    
    res.json({ success: true, message: 'Deposit rejected' });
});

// Get all users
app.get('/api/admin/users', (req, res) => {
    const userList = Object.values(users);
    
    res.json({ 
        success: true, 
        users: userList,
        count: userList.length,
        totalBalance: userList.reduce((sum, user) => sum + user.balance, 0)
    });
});

// Update user balance
app.post('/api/admin/update-balance', (req, res) => {
    const { userId, balance } = req.body;
    
    if (!users[userId]) {
        return res.json({ success: false, error: 'User not found' });
    }
    
    users[userId].balance = parseFloat(balance);
    saveUsers();
    
    res.json({ 
        success: true, 
        message: 'Balance updated',
        newBalance: users[userId].balance 
    });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Sheba Bingo',
        version: '1.0.0',
        users: Object.keys(users).length,
        pendingDeposits: deposits.filter(d => d.status === 'pending').length,
        totalBalance: Object.values(users).reduce((sum, user) => sum + user.balance, 0),
        timestamp: new Date().toISOString()
    });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 SHEBA BINGO SERVER STARTED');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 URL: ${RENDER_URL}`);
    console.log(`🤖 Bot Token: ${BOT_TOKEN ? 'SET ✓' : 'NOT SET ✗'}`);
    console.log(`👑 Admin: ${RENDER_URL}/admin.html`);
    console.log(`🎮 Game: ${RENDER_URL}/`);  // ✅ CORRECT: No /game.html
    console.log(`📊 Health: ${RENDER_URL}/api/health`);
    console.log('='.repeat(50));
});
