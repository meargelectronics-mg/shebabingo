const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ==================== CONFIGURATION ====================
const BOT_TOKEN = process.env.BOT_TOKEN || '8274404754:AAGnc1QeczvHP51dIryK2sK-E8aUUyiO6Zc';
const RENDER_URL = process.env.RENDER_URL || 'https://shebabingo-bot.onrender.com';

// ==================== SIMPLE DATABASE ====================
const USERS_FILE = path.join(__dirname, 'users.json');
let users = {};

if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ==================== SET WEBHOOK ON STARTUP ====================
async function setupBot() {
    try {
        const webhookUrl = `${RENDER_URL}/telegram-webhook`;
        
        // Set webhook
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            url: webhookUrl,
            drop_pending_updates: true
        });
        
        // Set commands (like @joybingobot)
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
            commands: [
                { command: "start", description: "🚀 Start bot" },
                { command: "play", description: "🎮 Play game" },
                { command: "deposit", description: "💰 Deposit money" },
                { command: "balance", description: "📊 Check balance" },
                { command: "help", description: "❓ Get help" }
            ]
        });
        
        console.log('✅ Bot setup complete');
        
    } catch (error) {
        console.error('Bot setup error:', error.message);
    }
}

// ==================== FAST TELEGRAM BOT HANDLER ====================
app.post('/telegram-webhook', async (req, res) => {
    // Respond immediately (like @joybingobot)
    res.status(200).send('OK');
    
    try {
        const update = req.body;
        
        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text || '';
            const userId = update.message.from.id;
            const username = update.message.from.username || update.message.from.first_name;
            
            // Initialize user
            if (!users[userId]) {
                users[userId] = {
                    id: userId,
                    username: username,
                    chatId: chatId,
                    balance: 10, // Welcome bonus
                    registered: true
                };
                saveUsers();
            }
            
            const user = users[userId];
            
            // Handle commands FAST
            if (text === '/start') {
                await sendStartMenu(chatId, user);
            }
            else if (text === '/play') {
                await sendPlayButton(chatId, userId, user);
            }
            else if (text === '/balance') {
                await sendBalance(chatId, user);
            }
            else if (text === '/deposit') {
                await sendDepositOptions(chatId);
            }
            else if (text === '/help') {
                await sendHelp(chatId);
            }
        }
        
    } catch (error) {
        console.error('Webhook error:', error.message);
    }
});

// ==================== FAST RESPONSE FUNCTIONS ====================

// 1. START MENU (like @joybingobot)
async function sendStartMenu(chatId, user) {
    const gameUrl = `${RENDER_URL}/?user=${user.id}`;
    
    await sendTelegramMessage(chatId,
        `🎮 *SHEBA BINGO* 🎰\n\n` +
        `👤 *${user.username}*\n` +
        `💰 *Balance:* ${user.balance} ETB\n` +
        `🎁 *Bonus:* 10 ETB\n\n` +
        `*Choose an option:*`,
        {
            inline_keyboard: [
                [
                    { text: "🎮 PLAY", callback_data: "play" },
                    { text: "💰 DEPOSIT", callback_data: "deposit" }
                ],
                [
                    { text: "📊 BALANCE", callback_data: "balance" },
                    { text: "📞 SUPPORT", url: "https://t.me/ShebaBingoSupport" }
                ]
            ]
        }
    );
}

// 2. PLAY BUTTON (FAST - like @joybingobot)
async function sendPlayButton(chatId, userId, user) {
    // ✅ CORRECT URL - NO game.html
    const gameUrl = `${RENDER_URL}/?user=${userId}`;
    
    await sendTelegramMessage(chatId,
        `🎮 *PLAY NOW*\n\n` +
        `💰 *Balance:* ${user.balance} ETB\n` +
        `🎯 *Ticket:* 10 ETB\n\n` +
        `*Click below to start:*`,
        {
            inline_keyboard: [[
                { 
                    text: "▶️ PLAY GAME",
                    url: gameUrl
                }
            ]]
        }
    );
}

// 3. BALANCE (FAST)
async function sendBalance(chatId, user) {
    await sendTelegramMessage(chatId,
        `💰 *YOUR BALANCE*\n\n` +
        `💵 *Available:* ${user.balance} ETB\n` +
        `🎁 *Bonus:* 10 ETB\n\n` +
        `*Quick actions:*`,
        {
            inline_keyboard: [
                [
                    { text: "🎮 PLAY", callback_data: "play" },
                    { text: "💰 DEPOSIT", callback_data: "deposit" }
                ]
            ]
        }
    );
}

// 4. DEPOSIT OPTIONS (FAST)
async function sendDepositOptions(chatId) {
    await sendTelegramMessage(chatId,
        `💰 *DEPOSIT MONEY*\n\n` +
        `*Choose payment method:*\n\n` +
        `📱 *TeleBirr:* 0912345678\n` +
        `🏦 *CBE Birr:* 1000123456789\n` +
        `🏛️ *BoA:* 2000123456789\n\n` +
        `📸 *Send screenshot after payment*\n` +
        `⏰ *Processing:* 2-5 minutes`,
        {
            inline_keyboard: [
                [
                    { text: "📱 TeleBirr", callback_data: "deposit_telebirr" },
                    { text: "🏦 CBE", callback_data: "deposit_cbe" }
                ],
                [
                    { text: "🏛️ BoA", callback_data: "deposit_boa" },
                    { text: "🎮 BACK TO PLAY", callback_data: "play" }
                ]
            ]
        }
    );
}

// 5. HELP (FAST)
async function sendHelp(chatId) {
    await sendTelegramMessage(chatId,
        `📞 *SUPPORT*\n\n` +
        `*Contact us:*\n` +
        `👤 @ShebaBingoAdmin\n` +
        `📱 +251945343143\n\n` +
        `*Available 24/7*`,
        {
            inline_keyboard: [
                [
                    { text: "🎮 PLAY", callback_data: "play" },
                    { text: "💰 DEPOSIT", callback_data: "deposit" }
                ],
                [
                    { text: "📊 BALANCE", callback_data: "balance" },
                    { text: "🏠 HOME", callback_data: "start" }
                ]
            ]
        }
    );
}

// ==================== CALLBACK QUERIES (BUTTON CLICKS) ====================
app.post('/telegram-webhook', async (req, res) => {
    res.status(200).send('OK');
    
    try {
        const update = req.body;
        
        // Handle button clicks
        if (update.callback_query) {
            const chatId = update.callback_query.message.chat.id;
            const userId = update.callback_query.from.id;
            const data = update.callback_query.data;
            const user = users[userId] || { id: userId, balance: 10 };
            
            // Answer callback immediately
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
                callback_query_id: update.callback_query.id
            });
            
            // Handle button actions
            switch(data) {
                case 'play':
                    await sendPlayButton(chatId, userId, user);
                    break;
                    
                case 'deposit':
                    await sendDepositOptions(chatId);
                    break;
                    
                case 'balance':
                    await sendBalance(chatId, user);
                    break;
                    
                case 'start':
                    await sendStartMenu(chatId, user);
                    break;
                    
                case 'deposit_telebirr':
                    await sendTelegramMessage(chatId,
                        `📱 *TeleBirr Deposit*\n\n` +
                        `*Send to:* 0912345678\n` +
                        `*Name:* SHEBA BINGO\n\n` +
                        `📸 *After payment, send screenshot here*\n` +
                        `✅ *Balance added in 5 minutes*`
                    );
                    break;
                    
                default:
                    await sendStartMenu(chatId, user);
            }
            
            return;
        }
        
        // Handle messages (code from above...)
        // ... [keep your existing message handling code] ...
        
    } catch (error) {
        console.error('Webhook error:', error.message);
    }
});

// ==================== FAST TELEGRAM MESSAGE FUNCTION ====================
async function sendTelegramMessage(chatId, text, replyMarkup = null) {
    try {
        const payload = {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        };
        
        if (replyMarkup) {
            payload.reply_markup = replyMarkup;
        }
        
        // Send FAST with timeout
        await Promise.race([
            axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, payload, {
                timeout: 3000 // 3 second timeout
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
            )
        ]);
        
    } catch (error) {
        console.error('Telegram send error:', error.message);
    }
}

// ==================== SIMPLE ROUTES ====================

// Root - serve game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Redirect any game.html to root
app.get('/game.html', (req, res) => {
    res.redirect(301, `/?user=${req.query.user || ''}`);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Sheba Bingo',
        bot: 'active',
        users: Object.keys(users).length,
        uptime: process.uptime()
    });
});

// Game API
app.get('/api/balance/:userId', (req, res) => {
    const user = users[req.params.userId];
    res.json({ 
        balance: user ? user.balance : 0,
        username: user ? user.username : 'Guest'
    });
});

app.post('/api/deduct', (req, res) => {
    const { userId, amount } = req.body;
    
    if (users[userId] && users[userId].balance >= amount) {
        users[userId].balance -= amount;
        saveUsers();
        res.json({ 
            success: true, 
            newBalance: users[userId].balance 
        });
    } else {
        res.json({ 
            success: false, 
            error: 'Insufficient balance' 
        });
    }
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', async () => {
    console.log('='.repeat(60));
    console.log('🚀 SHEBA BINGO - FAST LIKE @JOYBINGOBOT');
    console.log('='.repeat(60));
    console.log(`✅ Server: ${RENDER_URL}`);
    console.log(`✅ Bot: @shebabingobot`);
    console.log(`✅ Game: ${RENDER_URL}/?user=ID`);
    console.log('='.repeat(60));
    
    // Setup bot
    await setupBot();
});
