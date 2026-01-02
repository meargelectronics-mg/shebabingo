const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CONFIGURATION ====================
const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '8274404754:AAGnc1QeczvHP51dIryK2sK-E8aUUyiO6Zc';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'shebabingo@23';
const RENDER_URL = process.env.RENDER_URL || 'https://shebabingo-bot.onrender.com';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '6297094384';

console.log('='.repeat(60));
console.log('🚀 SHEBA BINGO - AUTO DEPOSIT SYSTEM STARTING');
console.log('='.repeat(60));

// ==================== ENHANCED DATABASE ====================
const USERS_FILE = path.join(__dirname, 'users.json');
const DEPOSITS_FILE = path.join(__dirname, 'deposits.json');
const GAMES_FILE = path.join(__dirname, 'games.json');

let users = {};
let deposits = [];
let games = [];

// Load database
if (fs.existsSync(USERS_FILE)) {
    try {
        users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        console.log(`✅ Loaded ${Object.keys(users).length} users`);
    } catch (error) {
        console.error('Error loading users:', error.message);
    }
}

if (fs.existsSync(DEPOSITS_FILE)) {
    try {
        deposits = JSON.parse(fs.readFileSync(DEPOSITS_FILE, 'utf8'));
        console.log(`✅ Loaded ${deposits.length} deposits`);
    } catch (error) {
        console.error('Error loading deposits:', error.message);
    }
}

if (fs.existsSync(GAMES_FILE)) {
    try {
        games = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8'));
        console.log(`✅ Loaded ${games.length} games`);
    } catch (error) {
        console.error('Error loading games:', error.message);
    }
}

// Save functions
function saveUsers() {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error saving users:', error.message);
    }
}

function saveDeposits() {
    try {
        fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits, null, 2));
    } catch (error) {
        console.error('Error saving deposits:', error.message);
    }
}

function saveGames() {
    try {
        fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));
    } catch (error) {
        console.error('Error saving games:', error.message);
    }
}

// ==================== TELEGRAM WEBHOOK SETUP ====================
async function setupTelegramWebhook() {
    try {
        if (!BOT_TOKEN || BOT_TOKEN === '8274404754:AAGnc1QeczvHP51dIryK2sK-E8aUUyiO6Zc') {
            console.error('❌ BOT_TOKEN not set!');
            return;
        }
        
        const webhookUrl = `${RENDER_URL}/telegram-webhook`;
        
        console.log('='.repeat(60));
        console.log('🔧 SETTING UP TELEGRAM BOT');
        console.log('='.repeat(60));
        console.log(`🤖 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
        console.log(`🌐 Webhook URL: ${webhookUrl}`);
        
        // Delete any existing webhook
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
        console.log('✅ Old webhook deleted');
        
        // Set webhook
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            url: webhookUrl,
            allowed_updates: ["message", "callback_query"]
        });
        
        console.log('✅ Webhook set successfully');
        
        // Set bot commands
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
            commands: [
                { command: "start", description: "🚀 Start bot" },
                { command: "play", description: "🎮 Play game" },
                { command: "deposit", description: "💰 Deposit money (INSTANT)" },
                { command: "balance", description: "📊 Check balance" },
                { command: "help", description: "❓ Get help" }
            ]
        });
        
        console.log('✅ Bot commands set');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Error setting webhook:', error.message);
    }
}

// ==================== SERVE FRONTEND ====================
app.use(express.static(path.join(__dirname, '../public')));

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Redirect ALL game.html requests to index.html
app.get('/game.html', (req, res) => {
    const userId = req.query.user;
    console.log(`🔄 Redirecting /game.html?user=${userId} to /?user=${userId}`);
    res.redirect(301, `/?user=${userId || ''}`);
});

app.get('/game', (req, res) => {
    res.redirect(301, `/?user=${req.query.user || ''}`);
});

// ==================== TELEGRAM BOT HANDLER ====================
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
                    joinDate: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                    totalDeposited: 0,
                    totalWon: 0
                };
                saveUsers();
                console.log(`👤 New user registered: ${username} (${userId})`);
            }
            
            // Update last active time
            users[userId].lastActive = new Date().toISOString();
            const user = users[userId];
            
            // Handle /start command  
            if (text === '/start') {
                if (!user.registered) {
                    await sendTelegramMessage(chatId, 
                        `🎮 *Welcome to SHEBA BINGO!* 🎰\n\n` +
                        `🔥 *GET 10 ETB FREE BONUS INSTANTLY!*\n\n` +
                        `✅ Register with 1 click\n` +
                        `✅ Play instantly\n` +
                        `✅ Win real money\n\n` +
                        `Click REGISTER to start:`,
                        {
                            inline_keyboard: [[
                                { text: "📝 REGISTER NOW", callback_data: "register" }
                            ]]
                        }
                    );
                } else {
                    await sendTelegramMessage(chatId,
                        `🎮 *Welcome back to SHEBA BINGO!* 🎰\n\n` +
                        `💰 Balance: *${user.balance} ETB*\n\n` +
                        `Choose your action:`,
                        {
                            inline_keyboard: [
                                [{ 
                                    text: `🎮 PLAY SHEBA BINGO (${user.balance} ETB)`, 
                                    web_app: { url: `${RENDER_URL}/?user=${userId}` }
                                }],
                                [
                                    { text: "💰 DEPOSIT (INSTANT)", callback_data: "deposit" },
                                    { text: "📊 MENU", callback_data: "menu" }
                                ]
                            ]
                        }
                    );
                }
            }
            // Handle photo messages (screenshots for manual deposit)
            else if (update.message.photo) {
                const photo = update.message.photo[update.message.photo.length - 1];
                
                // Store manual deposit (slower processing)
                const depositId = 'manual_' + Date.now().toString();
                deposits.push({
                    id: depositId,
                    userId: userId,
                    username: user.username,
                    chatId: chatId,
                    fileId: photo.file_id,
                    status: 'pending_manual',
                    date: new Date().toISOString(),
                    method: 'telebirr_manual',
                    type: 'manual_screenshot'
                });
                saveDeposits();
                
                await sendTelegramMessage(chatId,
                    `📸 *Manual Screenshot Received*\n\n` +
                    `✅ Admin will review and add balance.\n` +
                    `⏰ Processing time: 5-10 minutes\n\n` +
                    `💡 *For INSTANT processing* (under 1 minute):\n` +
                    `1. Use TeleBirr/CBE\n` +
                    `2. Copy the confirmation SMS\n` +
                    `3. Paste the SMS text here\n\n` +
                    `💰 Your current balance: *${user.balance} ETB*`
                );
                
                console.log(`📸 Manual deposit from ${user.username}`);
                
                // Notify admin about manual deposit
                await sendTelegramMessage(ADMIN_CHAT_ID,
                    `📥 *MANUAL DEPOSIT SCREENSHOT*\n\n` +
                    `👤 User: ${user.username} (${userId})\n` +
                    `💰 Current Balance: ${user.balance} ETB\n` +
                    `🕐 Time: ${new Date().toLocaleString()}\n\n` +
                    `⚡ Review in admin panel:\n` +
                    `${RENDER_URL}/admin.html`
                );
            }
            // Handle text messages - CRITICAL FOR INSTANT DEPOSITS
            else if (text) {
                // Check if message looks like a transaction SMS (INSTANT DEPOSIT)
                const isTransactionSMS = (
                    (text.includes('transferred') || text.includes('sent') || text.includes('You have transferred')) &&
                    (text.includes('ETB') || text.includes('birr') || text.includes('ETB')) &&
                    (text.includes('TeleBirr') || text.includes('CBE') || text.includes('transaction') || text.includes('Dear'))
                );
                
                if (isTransactionSMS && !text.startsWith('/')) {
                    console.log(`📨 Detected transaction SMS from ${user.username}`);
                    await processInstantDeposit(userId, chatId, text);
                    return;
                }
                
                // If it's a command like /deposit, /balance, etc.
                if (text.startsWith('/')) {
                    switch(text) {
                        case '/deposit':
                            await sendTelegramMessage(chatId,
                                `💰 *CHOOSE PAYMENT METHOD - INSTANT DEPOSIT* 💰\n\n` +
                                `*FOR INSTANT CREDIT (UNDER 1 MINUTE):*\n` +
                                `1. Select your payment method below.\n` +
                                `2. Complete the transfer.\n` +
                                `3. **COPY the ENTIRE confirmation SMS** you receive.\n` +
                                `4. **PASTE that SMS text directly here** in this chat.\n\n` +
                                `✅ *Automatic processing!*\n` +
                                `❌ Do NOT send screenshots for instant processing.`,
                                {
                                    inline_keyboard: [
                                        [{ text: "📱 TeleBirr (INSTANT)", callback_data: "telebirr_instant" }],
                                        [{ text: "🏦 CBE Birr (INSTANT)", callback_data: "cbe_instant" }],
                                        [{ text: "🏛️ Bank of Abyssinia", callback_data: "boa_instant" }],
                                        [{ text: "📸 Manual Screenshot (Slower)", callback_data: "manual_deposit" }]
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
                                        { 
                                            text: `🎮 PLAY (${user.balance} ETB)`, 
                                            web_app: { url: `${RENDER_URL}/?user=${userId}` }
                                        },
                                        { text: "💰 DEPOSIT (INSTANT)", callback_data: "deposit" }
                                    ]]
                                }
                            );
                            break;
                            
                        case '/play':
                            console.log(`🎮 /play command from user ${userId}`);
                            
                            await sendTelegramMessage(chatId,
                                `🎮 *PLAY SHEBA BINGO* 🎰\n\n` +
                                `💰 Balance: *${user.balance} ETB*\n\n` +
                                `⬇️ *CLICK THE BUTTON BELOW* ⬇️\n` +
                                `_Game opens in Telegram_`,
                                {
                                    inline_keyboard: [[
                                        { 
                                            text: `▶️ PLAY NOW`,
                                            web_app: {url: `${RENDER_URL}/?user=${userId}&from=play_command`}
                                        }
                                    ]]
                                }
                            );
                            break;
                            
                        case '/help':
                            await sendTelegramMessage(chatId,
                                `📞 *SUPPORT & INSTANT DEPOSIT HELP*\n\n` +
                                `👤 Admin: @ShebaBingoAdmin\n` +
                                `📱 Phone: +251945343143\n` +
                                `⏰ 24/7 Support\n\n` +
                                `💡 *For INSTANT deposits:*\n` +
                                `• Use TeleBirr or CBE Birr\n` +
                                `• Copy & paste SMS confirmation\n` +
                                `• Balance updates in under 1 minute\n\n` +
                                `📧 Contact for:\n` +
                                `• Deposit issues\n` +
                                `• Withdrawal help\n` +
                                `• Game problems`
                            );
                            break;
                            
                        case '/agent_register':
                            user.isAgent = true;
                            saveUsers();
                            await sendTelegramMessage(chatId,
                                `✅ *AGENT REGISTRATION COMPLETE!*\n\n` +
                                `Your Agent Code: *${user.agentCode}*\n` +
                                `Commission: 10%\n\n` +
                                `Share your code to earn commissions!`
                            );
                            break;
                            
                        default:
                            await sendTelegramMessage(chatId,
                                `📝 I received: ${text}\n\n` +
                                `Use these commands:\n` +
                                `/start - Show menu\n` +
                                `/play - Start game\n` +
                                `/deposit - Add funds INSTANTLY\n` +
                                `/balance - Check balance\n` +
                                `/help - Get help`
                            );
                    }
                } else {
                    // Regular text message that's not a transaction SMS
                    if (text.toLowerCase().includes('screenshot') || text.includes('paid') || text.includes('sent money')) {
                        await sendTelegramMessage(chatId,
                            `📸 *For manual screenshot review:*\n\n` +
                            `Please send the screenshot directly as a photo (not text).\n` +
                            `Admin review time: 5-10 minutes.\n\n` +
                            `💡 *For INSTANT processing (under 1 minute):*\n` +
                            `1. Use /deposit command\n` +
                            `2. Select TeleBirr or CBE\n` +
                            `3. Copy & paste the SMS confirmation\n`
                        );
                    } else {
                        await sendTelegramMessage(chatId,
                            `📝 I received your message\n\n` +
                            `Use /help to see available commands.\n` +
                            `For instant deposits, use /deposit`
                        );
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Webhook error:', error.message);
    }
});

// ==================== INSTANT DEPOSIT PROCESSOR ====================
async function processInstantDeposit(userId, chatId, smsText) {
    const user = users[userId];
    if (!user) {
        await sendTelegramMessage(chatId, `❌ User not found. Please use /start first.`);
        return;
    }

    console.log(`🔍 Processing SMS from ${user.username}: ${smsText.substring(0, 80)}...`);

    // 1. EXTRACT TRANSACTION ID
    let transactionId = null;
    const txIdPatterns = [
        /transaction (?:number|id) is (\w+)/i,
        /transaction #(\w+)/i,
        /reference (?:number|id) (\w+)/i,
        /reference (\w+)/i,
        /DA17G5W\w{3}/i
    ];

    for (const pattern of txIdPatterns) {
        const match = smsText.match(pattern);
        if (match) {
            transactionId = match[1] || match[0];
            console.log(`📋 Found Transaction ID: ${transactionId}`);
            break;
        }
    }

    // 2. EXTRACT AMOUNT
    let amount = null;
    const amountPatterns = [
        /ETB\s*(\d+(?:\.\d{2})?)/i,
        /transferred\s*(\d+(?:\.\d{2})?)/i,
        /(\d+(?:\.\d{2})?)\s*ETB/i,
        /ETB (\d+(?:\.\d{2})?)/i
    ];

    for (const pattern of amountPatterns) {
        const match = smsText.match(pattern);
        if (match) {
            amount = parseFloat(match[1]);
            console.log(`💰 Found Amount: ${amount} ETB`);
            if (amount >= 10) break;
        }
    }

    // 3. IMMEDIATE VALIDATION
    if (!transactionId) {
        await sendTelegramMessage(chatId,
            `❌ *Transaction ID not found.*\n\n` +
            `Please paste the *full SMS* from TeleBirr/CBE that includes:\n` +
            `• Transaction number (like DA17G5WALD)\n` +
            `• Amount transferred\n` +
            `• Confirmation message\n\n` +
            `Example SMS to copy:\n` +
            `"Dear User, You have transferred ETB 100.00 to account (2519****6445) on 01/01/2026. Your transaction number is DA17G5WALD."`
        );
        return;
    }
    
    if (!amount || amount < 10) {
        await sendTelegramMessage(chatId,
            `❌ *Valid amount not found.*\n\n` +
            `Minimum deposit is *10 ETB*.\n` +
            `Found: ${amount || 'nothing'}\n\n` +
            `Please paste the complete SMS including the amount.`
        );
        return;
    }

    // 4. CHECK FOR DUPLICATE TRANSACTION
    const isDuplicate = deposits.some(d => 
        d.transactionId === transactionId && d.status === 'approved'
    );
    
    if (isDuplicate) {
        await sendTelegramMessage(chatId,
            `⚠️ *Deposit Already Processed*\n\n` +
            `Transaction ID *${transactionId}* was already credited.\n` +
            `If this is a mistake, contact @ShebaBingoSupport.`
        );
        return;
    }

    // 5. CREATE DEPOSIT RECORD & CREDIT INSTANTLY
    const depositId = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDeposit = {
        id: depositId,
        userId: userId,
        username: user.username,
        chatId: chatId,
        smsText: smsText,
        transactionId: transactionId,
        amount: amount,
        status: 'approved',
        method: smsText.includes('TeleBirr') ? 'telebirr_auto' : 
                smsText.includes('CBE') ? 'cbe_auto' : 'bank_auto',
        date: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        autoParsed: true,
        processedIn: 'instant'
    };

    deposits.push(newDeposit);
    user.balance += amount;
    user.totalDeposited = (user.totalDeposited || 0) + amount;
    saveUsers();
    saveDeposits();

    console.log(`✅ INSTANT DEPOSIT: ${user.username} +${amount} ETB via ${transactionId}`);

    // 6. NOTIFY USER OF SUCCESS (INSTANT!)
    await sendTelegramMessage(chatId,
        `🎉 *DEPOSIT SUCCESSFUL!* 🎉\n\n` +
        `✅ *${amount.toFixed(2)} ETB* has been added to your balance!\n` +
        `🆔 Transaction: *${transactionId}*\n` +
        `💰 *New Balance: ${user.balance.toFixed(2)} ETB*\n\n` +
        `⏱️ Processed in: *~3 seconds*\n` +
        `🎮 Click PLAY to start winning!`,
        {
            inline_keyboard: [[
                { 
                    text: `🎮 PLAY NOW (${user.balance.toFixed(0)} ETB)`, 
                    web_app: { url: `${RENDER_URL}/?user=${userId}&from=instant_deposit` }
                }
            ]]
        }
    );

    // 7. REAL-TIME ALERT TO ADMIN (MONITORING ONLY)
    await sendTelegramMessage(ADMIN_CHAT_ID,
        `⚡ *INSTANT DEPOSIT - AUTO APPROVED* ⚡\n\n` +
        `👤 User: ${user.username} (${userId})\n` +
        `💰 Amount: ${amount.toFixed(2)} ETB\n` +
        `🆔 TXN ID: ${transactionId}\n` +
        `💵 New Balance: ${user.balance.toFixed(2)} ETB\n` +
        `⏰ Time: ${new Date().toLocaleTimeString()}\n\n` +
        `_System auto-verified and credited._`
    );
}

// ==================== HANDLE CALLBACK QUERIES ====================
async function handleCallbackQuery(callback) {
    try {
        const chatId = callback.message.chat.id;
        const userId = callback.from.id;
        const data = callback.data;
        const user = users[userId];
        
        if (!user) {
            console.error(`User ${userId} not found in callback`);
            return;
        }
        
        // Answer callback query
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
            callback_query_id: callback.id
        });
        
        console.log(`🔘 Callback received: ${data} from ${user.username}`);
        
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
                        getMainMenuKeyboard(user.id)
                    );
                }
                break;
                
            case 'play':
                await sendTelegramMessage(chatId,
                    `🎮 *PLAY SHEBA BINGO* 🎰\n\n` +
                    `💰 Balance: *${user.balance} ETB*\n\n` +
                    `Click below to start playing:`,
                    {
                        inline_keyboard: [[
                            { 
                                text: "🎯 START GAME",
                                web_app: {
                                    url: `${RENDER_URL}/?user=${userId}&from=play_command`
                                }
                            }
                        ]]
                    }
                );
                break;
                
            case 'deposit':
                await sendTelegramMessage(chatId,
                    `💰 *CHOOSE PAYMENT METHOD - INSTANT DEPOSIT* 💰\n\n` +
                    `*FOR INSTANT CREDIT (UNDER 1 MINUTE):*\n` +
                    `1. Select your payment method below.\n` +
                    `2. Complete the transfer.\n` +
                    `3. **COPY the ENTIRE confirmation SMS** you receive.\n` +
                    `4. **PASTE that SMS text directly here** in this chat.\n\n` +
                    `✅ *Automatic processing!*\n` +
                    `❌ Do NOT send screenshots for instant processing.`,
                    {
                        inline_keyboard: [
                            [{ text: "📱 TeleBirr (INSTANT)", callback_data: "telebirr_instant" }],
                            [{ text: "🏦 CBE Birr (INSTANT)", callback_data: "cbe_instant" }],
                            [{ text: "🏛️ Bank of Abyssinia", callback_data: "boa_instant" }],
                            [{ text: "📸 Manual Screenshot (Slower)", callback_data: "manual_deposit" }]
                        ]
                    }
                );
                break;
                
            case 'telebirr_instant':
                await sendTelegramMessage(chatId,
                    `📱 *TeleBirr INSTANT Deposit*\n\n` +
                    `📍 *Send money to this account:*\n` +
                    `➤ **Account:**0914834341\n` +
                    `➤ **Name:** SHEBA BINGO\n\n` +
                    `*CRITICAL INSTRUCTIONS FOR INSTANT CREDIT:*\n` +
                    `1️⃣ Transfer any amount (Min: 10 ETB).\n` +
                    `2️⃣ Wait for the SMS from TeleBirr.\n` +
                    `3️⃣ **LONG PRESS** the SMS, **COPY ALL TEXT**.\n` +
                    `4️⃣ Come back here and **PASTE it** in this chat.\n\n` +
                    `⏱️ *Balance update:* **Less than 1 minute**\n` +
                    `🔒 *Secure & Automatic*\n\n` +
                    `Example SMS format:\n` +
                    `"Dear User, You have transferred ETB 100.00 to account (2519****6445). Transaction number is DA17G5WALD."`
                );
                break;
                
            case 'cbe_instant':
                await sendTelegramMessage(chatId,
                    `🏦 *CBE Birr INSTANT Deposit*\n\n` +
                    `📍 *Send money to this account:*\n` +
                    `➤ **Account:** 1000***********\n` +
                    `➤ **Name:** SHEBA BINGO\n\n` +
                    `*CRITICAL INSTRUCTIONS FOR INSTANT CREDIT:*\n` +
                    `1️⃣ Transfer any amount (Min: 10 ETB).\n` +
                    `2️⃣ Wait for the SMS from CBE.\n` +
                    `3️⃣ **LONG PRESS** the SMS, **COPY ALL TEXT**.\n` +
                    `4️⃣ Come back here and **PASTE it** in this chat.\n\n` +
                    `⏱️ *Balance update:* **Less than 1 minute**\n` +
                    `🔒 *Secure & Automatic*`
                );
                break;
                
            case 'boa_instant':
                await sendTelegramMessage(chatId,
                    `🏛️ *Bank of Abyssinia INSTANT Deposit*\n\n` +
                    `📍 *Send money to this account:*\n` +
                    `➤ **Account:** 65******\n` +
                    `➤ **Name:** SHEBA BINGO\n\n` +
                    `*Follow these steps for instant credit:*\n` +
                    `1️⃣ Transfer any amount (Min: 10 ETB).\n` +
                    `2️⃣ Wait for the confirmation SMS.\n` +
                    `3️⃣ **COPY ALL TEXT** from the SMS.\n` +
                    `4️⃣ **PASTE it** in this chat.\n\n` +
                    `⏱️ *Balance update:* **1 minutes**`
                );
                break;
                
            case 'manual_deposit':
                await sendTelegramMessage(chatId,
                    `📸 *Manual Screenshot Deposit*\n\n` +
                    `📍 *Send money to any account:*\n` +
                    `• TeleBirr:0914834341\n` +
                    `• CBE: 1000***********\n` +
                    `• BoA: 65******\n\n` +
                    `*Instructions:*\n` +
                    `1️⃣ Complete your transfer.\n` +
                    `2️⃣ Take a **CLEAR screenshot** of the transaction.\n` +
                    `3️⃣ Send the screenshot here as a **PHOTO**.\n\n` +
                    `⏱️ *Processing time:* **1 minutes**\n` +
                    `⚠️ *For faster processing, use INSTANT deposit method above*`
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
                            { text: "💰 DEPOSIT (INSTANT)", callback_data: "deposit" }
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
                    `/transfer 100*****`
                );
                break;
                
            case 'instructions':
                await sendTelegramMessage(chatId,
                    `📖 *HOW TO PLAY & INSTANT DEPOSIT*\n\n` +
                    `1. Register → Get 10 ETB bonus\n` +
                    `2. Deposit → Use /deposit for INSTANT credit\n` +
                    `3. Play → Click PLAY button\n` +
                    `4. Win → Match numbers\n\n` +
                    `💡 *INSTANT DEPOSIT TIP:*\n` +
                    `Copy & paste SMS confirmation for <1 min credit\n\n` +
                    `📞 Support: @ShebaBingoSupport`
                );
                break;
                
            case 'support':
                await sendTelegramMessage(chatId,
                    `📞 *SUPPORT & INSTANT DEPOSIT HELP*\n\n` +
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
                
            case 'menu':
                await showMainMenu(chatId, user);
                break;
                
            default:
                // Handle admin callbacks if they start with admin_
                if (data.startsWith('admin_')) {
                    await handleAdminCallback(data, callback);
                } else {
                    await showMainMenu(chatId, user);
                }
        }
    } catch (error) {
        console.error('Callback error:', error.message);
    }
}

// ==================== ADMIN CALLBACK HANDLER ====================
async function handleAdminCallback(data, callback) {
    const parts = data.split('_');
    const action = parts[1];
    const depositId = parts[2];
    
    if (action === 'approve') {
        // Handle manual deposit approval from admin panel
        const deposit = deposits.find(d => d.id === depositId);
        if (deposit && deposit.status === 'pending_manual') {
            const user = users[deposit.userId];
            if (user) {
                deposit.status = 'approved';
                deposit.approvedAt = new Date().toISOString();
                user.balance += 50; // Default amount for manual deposits
                saveUsers();
                saveDeposits();
                
                // Notify user
                await sendTelegramMessage(deposit.chatId,
                    `✅ *MANUAL DEPOSIT APPROVED!*\n\n` +
                    `💰 Amount: *50 ETB*\n` +
                    `🎁 New Balance: *${user.balance} ETB*\n\n` +
                    `🎮 Click PLAY to start!`
                );
                
                // Notify admin
                await sendTelegramMessage(callback.message.chat.id,
                    `✅ Manual deposit approved for ${user.username}`
                );
            }
        }
    } else if (action === 'reject') {
        // Handle manual deposit rejection
        const deposit = deposits.find(d => d.id === depositId);
        if (deposit && deposit.status === 'pending_manual') {
            deposit.status = 'rejected';
            deposit.rejectedAt = new Date().toISOString();
            saveDeposits();
            
            // Notify user
            await sendTelegramMessage(deposit.chatId,
                `❌ *DEPOSIT REJECTED*\n\n` +
                `Your manual deposit was not approved.\n` +
                `Please use INSTANT deposit method:\n` +
                `1. Copy SMS confirmation\n` +
                `2. Paste text here\n` +
                `3. Get instant credit\n\n` +
                `Contact support if needed.`
            );
            
            await sendTelegramMessage(callback.message.chat.id,
                `❌ Manual deposit rejected for ${deposit.username}`
            );
        }
    }
}

// ==================== HELPER FUNCTIONS ====================
function getMainMenuKeyboard(userId) {
    return {
        inline_keyboard: [
            [{ 
                text: "🎮 PLAY SHEBA BINGO", 
                web_app: { url: `${RENDER_URL}/?user=${userId}&tgWebApp=true` }
            }],
            [
                { text: "💰 DEPOSIT (INSTANT)", callback_data: "deposit" },
                { text: "📤 WITHDRAW", callback_data: "withdraw" }
            ],
            [
                { text: "📤 TRANSFER", callback_data: "transfer" },
                { text: "💰 BALANCE", callback_data: "balance" }
            ],
            [
                { text: "📖 INSTRUCTIONS", callback_data: "instructions" },
                { text: "📞 SUPPORT", callback_data: "support" }
            ],
            [
                { text: "👥 INVITE", callback_data: "invite" },
                { text: "👑 AGENT", callback_data: "agent" }
            ],
            [
                { text: "🤝 SUB-AGENT", callback_data: "subagent" },
                { text: "💰 SALE", callback_data: "sale" }
            ]
        ]
    };
}

async function showMainMenu(chatId, user) {
    await sendTelegramMessage(chatId,
        `🎮 *SHEBA BINGO MENU*\n\n` +
        `💰 Balance: *${user.balance} ETB*\n` +
        `👤 Status: ${user.registered ? 'Registered ✅' : 'Not Registered'}\n\n` +
        `Choose option:`,
        getMainMenuKeyboard(user.id)
    );
}

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
        
        console.log(`📤 Message sent to ${chatId}`);
        
    } catch (error) {
        console.error('Telegram send error:', error.message);
    }
}

// ==================== GAME API ENDPOINTS ====================
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
    
    // Record game play
    const gameId = 'game_' + Date.now();
    games.push({
        id: gameId,
        userId: userId,
        amount: amount,
        date: new Date().toISOString(),
        type: 'play'
    });
    saveGames();
    
    res.json({ 
        success: true, 
        newBalance: users[userId].balance,
        message: `Game fee ${amount} ETB deducted`
    });
});

app.post('/api/game/win', (req, res) => {
    const { userId, amount } = req.body;
    
    if (!users[userId]) {
        return res.json({ success: false, error: 'User not found' });
    }
    
    users[userId].balance += amount;
    users[userId].totalWon = (users[userId].totalWon || 0) + amount;
    saveUsers();
    
    // Record win
    const gameId = 'win_' + Date.now();
    games.push({
        id: gameId,
        userId: userId,
        amount: amount,
        date: new Date().toISOString(),
        type: 'win'
    });
    saveGames();
    
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

// ==================== ENHANCED ADMIN API ====================
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

// Get all deposits with filters
app.get('/api/admin/deposits', (req, res) => {
    const { status, method, limit } = req.query;
    
    let filtered = deposits;
    
    if (status) {
        filtered = filtered.filter(d => d.status === status);
    }
    
    if (method) {
        filtered = filtered.filter(d => d.method === method);
    }
    
    if (limit) {
        filtered = filtered.slice(0, parseInt(limit));
    }
    
    // Add user info
    const depositsWithUserInfo = filtered.map(deposit => ({
        ...deposit,
        user: users[deposit.userId] || { username: 'Unknown' }
    }));
    
    res.json({ 
        success: true, 
        deposits: depositsWithUserInfo,
        count: filtered.length,
        autoApproved: deposits.filter(d => d.autoParsed === true && d.status === 'approved').length
    });
});

// Get recent auto-approved deposits (for admin panel)
app.get('/api/admin/deposits/recent', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const autoApproved = deposits
        .filter(d => d.status === 'approved' && d.autoParsed === true)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit)
        .map(d => ({
            id: d.id,
            username: d.username,
            amount: d.amount,
            transactionId: d.transactionId,
            method: d.method,
            date: d.date,
            processedIn: d.processedIn || 'instant'
        }));
    
    res.json(autoApproved);
});

// Get pending manual deposits
app.get('/api/admin/deposits/pending-manual', (req, res) => {
    const pendingManual = deposits.filter(d => d.status === 'pending_manual');
    
    res.json({ 
        success: true, 
        deposits: pendingManual,
        count: pendingManual.length 
    });
});

// Approve manual deposit (admin action)
app.post('/api/admin/deposit/:id/approve', (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    
    const deposit = deposits.find(d => d.id === id);
    if (!deposit) {
        return res.json({ success: false, error: 'Deposit not found' });
    }
    
    const user = users[deposit.userId];
    if (!user) {
        return res.json({ success: false, error: 'User not found' });
    }
    
    const approvedAmount = amount || 50; // Default amount for manual deposits
    
    // Update deposit status
    deposit.status = 'approved';
    deposit.approvedAmount = approvedAmount;
    deposit.approvedAt = new Date().toISOString();
    deposit.approvedBy = 'admin';
    
    // Add balance to user
    user.balance += approvedAmount;
    user.totalDeposited = (user.totalDeposited || 0) + approvedAmount;
    saveUsers();
    saveDeposits();
    
    // Notify user
    sendTelegramMessage(user.chatId,
        `✅ *MANUAL DEPOSIT APPROVED!*\n\n` +
        `💰 Amount: *${approvedAmount} ETB*\n` +
        `🎁 New Balance: *${user.balance} ETB*\n\n` +
        `🎮 Click PLAY to start!`
    );
    
    res.json({ 
        success: true, 
        message: 'Manual deposit approved and balance added',
        approvedAmount: approvedAmount,
        newBalance: user.balance,
        user_telegram: user.username
    });
});

// Reject manual deposit
app.post('/api/admin/deposit/:id/reject', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    const deposit = deposits.find(d => d.id === id);
    if (!deposit) {
        return res.json({ success: false, error: 'Deposit not found' });
    }
    
    const user = users[deposit.userId];
    
    // Update deposit status
    deposit.status = 'rejected';
    deposit.rejectedAt = new Date().toISOString();
    deposit.rejectReason = reason || 'Not specified';
    saveDeposits();
    
    // Notify user
    if (user) {
        sendTelegramMessage(user.chatId,
            `❌ *MANUAL DEPOSIT REJECTED*\n\n` +
            `Reason: ${reason || 'Not specified'}\n\n` +
            `💡 Try INSTANT deposit method:\n` +
            `1. Use /deposit command\n` +
            `2. Copy SMS confirmation\n` +
            `3. Paste text for instant credit`
        );
    }
    
    res.json({ success: true, message: 'Manual deposit rejected' });
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

// Get user by ID
app.get('/api/admin/users/:id', (req, res) => {
    const user = users[req.params.id];
    
    if (user) {
        const userDeposits = deposits.filter(d => d.userId == req.params.id);
        const userGames = games.filter(g => g.userId == req.params.id);
        
        res.json({ 
            success: true, 
            user: user,
            deposits: userDeposits,
            games: userGames,
            depositCount: userDeposits.length,
            totalDeposited: userDeposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0)
        });
    } else {
        res.json({ success: false, error: 'User not found' });
    }
});

// Update user balance
app.post('/api/admin/users/:id/balance', (req, res) => {
    const { id } = req.params;
    const { balance, reason } = req.body;
    
    if (!users[id]) {
        return res.json({ success: false, error: 'User not found' });
    }
    
    const oldBalance = users[id].balance;
    users[id].balance = parseFloat(balance);
    saveUsers();
    
    // Log admin action
    console.log(`👨‍💼 Admin changed balance for user ${id}: ${oldBalance} -> ${balance} (Reason: ${reason || 'Not specified'})`);
    
    // Notify user if balance increased
    if (parseFloat(balance) > oldBalance) {
        const increase = parseFloat(balance) - oldBalance;
        sendTelegramMessage(users[id].chatId,
            `🎁 *ADMIN BONUS!*\n\n` +
            `You received: *${increase} ETB*\n` +
            `New Balance: *${balance} ETB*\n\n` +
            `🎮 Play now to win more!`
        );
    }
    
    res.json({ 
        success: true, 
        message: 'Balance updated',
        oldBalance: oldBalance,
        newBalance: users[id].balance,
        user: users[id].username
    });
});

// Get system overview
app.get('/api/admin/overview', (req, res) => {
    const userList = Object.values(users);
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    
    const activeLast24h = userList.filter(u => 
        new Date(u.lastActive || u.joinDate) > last24h
    ).length;
    
    const todayDeposits = deposits.filter(d => 
        new Date(d.date).toDateString() === now.toDateString() && 
        d.status === 'approved'
    );
    
    const instantDepositsToday = todayDeposits.filter(d => d.autoParsed === true).length;
    
    res.json({
        success: true,
        stats: {
            totalUsers: userList.length,
            active24h: activeLast24h,
            totalBalance: userList.reduce((sum, user) => sum + user.balance, 0),
            pendingManualDeposits: deposits.filter(d => d.status === 'pending_manual').length,
            todayDeposits: todayDeposits.length,
            todayDepositAmount: todayDeposits.reduce((sum, d) => sum + d.amount, 0),
            instantDepositsToday: instantDepositsToday,
            manualDepositsToday: todayDeposits.length - instantDepositsToday,
            totalDeposits: deposits.filter(d => d.status === 'approved').length,
            totalDepositAmount: deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0),
            gamesPlayed: games.filter(g => g.type === 'play').length,
            totalWins: games.filter(g => g.type === 'win').length,
            totalWinAmount: games.filter(g => g.type === 'win').reduce((sum, g) => sum + g.amount, 0)
        },
        system: {
            uptime: process.uptime(),
            timestamp: now.toISOString(),
            autoDepositSystem: 'operational'
        }
    });
});

// Get system health
app.get('/api/admin/health', (req, res) => {
    const now = new Date();
    const lastHour = new Date(now - 60 * 60 * 1000);
    
    const recentDeposits = deposits.filter(d => 
        new Date(d.date) > lastHour && d.status === 'approved'
    );
    
    const instantRate = recentDeposits.length > 0 
        ? (recentDeposits.filter(d => d.autoParsed === true).length / recentDeposits.length * 100).toFixed(1)
        : '100';
    
    res.json({
        success: true,
        system: 'Sheba Bingo Auto-Deposit System',
        status: 'operational',
        uptime: process.uptime(),
        depositStats: {
            lastHour: recentDeposits.length,
            lastHourAmount: recentDeposits.reduce((sum, d) => sum + d.amount, 0),
            instantDeposits: recentDeposits.filter(d => d.autoParsed === true).length,
            autoApprovalRate: `${instantRate}%`
        },
        users: {
            total: Object.keys(users).length,
            activeLastHour: Object.values(users).filter(u => 
                new Date(u.lastActive || u.joinDate) > lastHour
            ).length
        },
        timestamp: now.toISOString()
    });
});

// ==================== FIX BOT SETTINGS ====================
const fixAllBotSettings = async () => {
    try {
        console.log('='.repeat(60));
        console.log('🔧 FIXING ALL BOT SETTINGS');
        console.log('='.repeat(60));
        
        // Remove old menu button
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
            menu_button: {}
        });
        console.log('✅ Old menu button removed');
        
        // Set new menu button
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
            menu_button: {
                type: "web_app",
                text: "🎮 Play Sheba Bingo",
                web_app: {
                    url: `${RENDER_URL}/?user=menu&tgWebApp=true`
                }
            }
        });
        console.log('✅ New menu button set');
        
        // Update bot commands
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
            commands: [
                { command: "start", description: "🚀 Start bot" },
                { command: "play", description: "🎮 Play game" },
                { command: "deposit", description: "💰 Deposit money (INSTANT)" },
                { command: "balance", description: "📊 Check balance" },
                { command: "help", description: "❓ Get help" }
            ]
        });
        console.log('✅ Bot commands updated');
        
        console.log('='.repeat(60));
        console.log('✅ ALL BOT SETTINGS FIXED');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('Error fixing bot settings:', error.message);
    }
};

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', async () => {
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 URL: ${RENDER_URL}`);
    console.log(`🤖 Bot: @shebabingobot`);
    console.log(`🎮 Game: ${RENDER_URL}/`);
    console.log(`🔧 Admin: ${RENDER_URL}/admin.html`);
    console.log(`📊 Health: ${RENDER_URL}/api/health`);
    console.log('='.repeat(60));
    
    // Setup Telegram webhook
    await setupTelegramWebhook();
    await fixAllBotSettings();
    
    console.log('\n🚀 *INSTANT DEPOSIT SYSTEM READY*');
    console.log('✅ Users can now paste SMS for instant credit (<1 min)');
    console.log('✅ Admin panel for monitoring at /admin.html');
    console.log('✅ Manual deposits still supported as fallback');
    console.log('='.repeat(60));
});
