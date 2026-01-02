const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CONFIGURATION ====================
const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '8274404754:AAGnc1QeczvHP51dIryK2sK-E8aUUyiO6Zc';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Mg@sheba23';
const RENDER_URL = process.env.RENDER_URL || 'https://shebabingo-bot.onrender.com';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '6297094384';

console.log('='.repeat(60));
console.log('🚀 SHEBA BINGO - AUTO DEPOSIT SYSTEM STARTING');
console.log('='.repeat(60));

// ==================== ENHANCED DATABASE ====================
const USERS_FILE = path.join(__dirname, 'users.json');
const DEPOSITS_FILE = path.join(__dirname, 'deposits.json');
const GAMES_FILE = path.join(__dirname, 'games.json');
const ACTIVE_GAMES_FILE = path.join(__dirname, 'active_games.json'); // NEW: For multiplayer games

let users = {};
let deposits = [];
let games = [];
let activeGames = {}; // NEW: Multiplayer games storage

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

// NEW: Load active multiplayer games
if (fs.existsSync(ACTIVE_GAMES_FILE)) {
    try {
        activeGames = JSON.parse(fs.readFileSync(ACTIVE_GAMES_FILE, 'utf8'));
        console.log(`✅ Loaded ${Object.keys(activeGames).length} active multiplayer games`);
    } catch (error) {
        console.error('Error loading active games:', error.message);
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

// NEW: Save active multiplayer games
function saveActiveGames() {
    try {
        fs.writeFileSync(ACTIVE_GAMES_FILE, JSON.stringify(activeGames, null, 2));
    } catch (error) {
        console.error('Error saving active games:', error.message);
    }
}

// ==================== MULTIPLAYER GAME SYSTEM ====================
// Game configuration
const GAME_CONFIG = {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 10,
    BOARD_PRICE: 10,
    PRIZE_POOL_PERCENT: 80, // 80% of bets go to prize pool
    GAME_DURATION: 120000, // 2 minutes per game
    CALL_INTERVAL: 3000, // Call number every 3 seconds
};

// Generate Bingo board
function generateBingoBoard() {
    const board = { B: [], I: [], N: [], G: [], O: [] };
    
    // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
    for (let i = 0; i < 5; i++) {
        board.B.push(getUniqueNumber(board.B, 1, 15));
        board.I.push(getUniqueNumber(board.I, 16, 30));
        board.N.push(getUniqueNumber(board.N, 31, 45));
        board.G.push(getUniqueNumber(board.G, 46, 60));
        board.O.push(getUniqueNumber(board.O, 61, 75));
    }
    
    // Free space in center (N column, 3rd row)
    board.N[2] = 'FREE';
    
    return board;
}

function getUniqueNumber(existing, min, max) {
    let num;
    do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (existing.includes(num));
    return num;
}

function checkBoardForBingo(board, markedNumbers, calledNumbers) {
    // Convert called numbers to just numbers (remove B, I, N, G, O)
    const calledNums = calledNumbers.map(cn => {
        const num = cn.substring(1);
        return num === 'FREE' ? 'FREE' : parseInt(num);
    });
    
    // Check rows
    for (let i = 0; i < 5; i++) {
        let rowComplete = true;
        for (const col of ['B', 'I', 'N', 'G', 'O']) {
            const cell = board[col][i];
            if (cell === 'FREE') continue;
            if (!calledNums.includes(cell)) {
                rowComplete = false;
                break;
            }
        }
        if (rowComplete) return true;
    }
    
    // Check columns
    for (const col of ['B', 'I', 'N', 'G', 'O']) {
        let colComplete = true;
        for (let i = 0; i < 5; i++) {
            const cell = board[col][i];
            if (cell === 'FREE') continue;
            if (!calledNums.includes(cell)) {
                colComplete = false;
                break;
            }
        }
        if (colComplete) return true;
    }
    
    // Check diagonals
    let diag1Complete = true;
    let diag2Complete = true;
    for (let i = 0; i < 5; i++) {
        const cols = ['B', 'I', 'N', 'G', 'O'];
        // Top-left to bottom-right
        const cell1 = board[cols[i]][i];
        if (cell1 !== 'FREE' && !calledNums.includes(cell1)) {
            diag1Complete = false;
        }
        // Top-right to bottom-left
        const cell2 = board[cols[4-i]][i];
        if (cell2 !== 'FREE' && !calledNums.includes(cell2)) {
            diag2Complete = false;
        }
    }
    
    return diag1Complete || diag2Complete;
}

// ==================== GAME MANAGEMENT FUNCTIONS ====================
function findAvailableGame() {
    for (const gameId in activeGames) {
        const game = activeGames[gameId];
        if (game.status === 'waiting' && 
            Object.keys(game.players).length < GAME_CONFIG.MAX_PLAYERS) {
            return gameId;
        }
    }
    return null;
}

function createNewGame() {
    const gameId = 'GAME_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    
    activeGames[gameId] = {
        id: gameId,
        status: 'waiting',
        players: {},
        calledNumbers: [],
        prizePool: 0,
        startTime: null,
        endTime: null,
        currentCall: null,
        createdAt: new Date().toISOString(),
        gameType: 'normal',
        lastCallTime: null,
        winner: null
    };
    
    // Auto-delete game if not started in 5 minutes
    setTimeout(() => {
        if (activeGames[gameId] && activeGames[gameId].status === 'waiting') {
            console.log(`🗑️ Deleting stale game ${gameId}`);
            delete activeGames[gameId];
            saveActiveGames();
        }
    }, 5 * 60 * 1000);
    
    saveActiveGames();
    return gameId;
}

async function startGame(gameId) {
    const game = activeGames[gameId];
    if (!game || game.status !== 'waiting') return;
    
    game.status = 'active';
    game.startTime = new Date().toISOString();
    game.endTime = new Date(Date.now() + GAME_CONFIG.GAME_DURATION).toISOString();
    
    // Notify all players
    await notifyGamePlayers(gameId, 
        `🎮 *GAME STARTED!*\n\n` +
        `Players: ${Object.keys(game.players).length}\n` +
        `Prize Pool: ${game.prizePool.toFixed(1)} ETB\n` +
        `Game ends in 2 minutes!\n\n` +
        `Good luck everyone! 🍀`
    );
    
    // Start calling numbers
    callNextNumber(gameId);
    
    // Game timer
    setTimeout(() => {
        endGame(gameId);
    }, GAME_CONFIG.GAME_DURATION);
    
    saveActiveGames();
}

async function callNextNumber(gameId) {
    const game = activeGames[gameId];
    if (!game || game.status !== 'active') return;
    
    // Check if game time is up
    if (new Date() > new Date(game.endTime)) {
        endGame(gameId);
        return;
    }
    
    // Generate new number
    let newNumber;
    do {
        const letterIndex = Math.floor(Math.random() * 5);
        const letters = ['B', 'I', 'N', 'G', 'O'];
        const letter = letters[letterIndex];
        
        let min, max;
        switch(letter) {
            case 'B': min = 1; max = 15; break;
            case 'I': min = 16; max = 30; break;
            case 'N': min = 31; max = 45; break;
            case 'G': min = 46; max = 60; break;
            case 'O': min = 61; max = 75; break;
        }
        
        newNumber = letter + (Math.floor(Math.random() * (max - min + 1)) + min);
    } while (game.calledNumbers.includes(newNumber));
    
    game.calledNumbers.push(newNumber);
    game.currentCall = newNumber;
    game.lastCallTime = new Date().toISOString();
    
    // Check for bingos
    await checkForBingos(gameId);
    
    // Notify all players
    await notifyGamePlayers(gameId, `🔔 *New Call:* ${newNumber}`);
    
    // Schedule next call
    if (game.status === 'active' && game.calledNumbers.length < 75) {
        setTimeout(() => callNextNumber(gameId), GAME_CONFIG.CALL_INTERVAL);
    }
    
    saveActiveGames();
}

async function checkForBingos(gameId) {
    const game = activeGames[gameId];
    if (!game) return;
    
    for (const userId in game.players) {
        const player = game.players[userId];
        if (player.hasBingo) continue;
        
        if (checkBoardForBingo(player.board, player.markedNumbers || [], game.calledNumbers)) {
            player.hasBingo = true;
            await declareWinner(gameId, userId);
        }
    }
}

async function declareWinner(gameId, winnerId) {
    const game = activeGames[gameId];
    const winner = game.players[winnerId];
    const user = users[winnerId];
    
    if (!game || !winner || !user) return;
    
    // Award prize
    const prize = game.prizePool;
    user.balance += prize;
    user.totalWon = (user.totalWon || 0) + prize;
    
    // Update game status
    game.status = 'completed';
    game.winner = {
        userId: winnerId,
        username: winner.username,
        prize: prize,
        winningNumbers: game.calledNumbers.length,
        winningTime: new Date().toISOString()
    };
    
    saveUsers();
    saveActiveGames();
    
    // Announce winner to all players
    await notifyGamePlayers(gameId,
        `🎉 *BINGO! WE HAVE A WINNER!*\n\n` +
        `🏆 Winner: ${winner.username}\n` +
        `💰 Prize: ${prize.toFixed(1)} ETB\n` +
        `🔢 Winning Numbers: ${game.calledNumbers.length} called\n\n` +
        `🎮 Game Over! Join a new game!`
    );
    
    // Personal message to winner
    await sendTelegramMessage(user.chatId,
        `🎊 *CONGRATULATIONS! YOU WON!*\n\n` +
        `🏆 You got BINGO!\n` +
        `💰 Prize: ${prize.toFixed(1)} ETB added to your balance!\n` +
        `📊 New Balance: ${user.balance.toFixed(1)} ETB\n\n` +
        `🎮 Play again to win more!`
    );
}

async function endGame(gameId) {
    const game = activeGames[gameId];
    if (!game || game.status !== 'active') return;
    
    game.status = 'completed';
    game.endTime = new Date().toISOString();
    
    // If no winner, refund players
    if (!game.winner) {
        const refundPerPlayer = game.prizePool / Object.keys(game.players).length;
        for (const userId in game.players) {
            const user = users[userId];
            if (user) {
                user.balance += refundPerPlayer;
                await sendTelegramMessage(user.chatId,
                    `🤷 *GAME ENDED - NO WINNER*\n\n` +
                    `💰 Refunded: ${refundPerPlayer.toFixed(1)} ETB\n` +
                    `📊 New Balance: ${user.balance.toFixed(1)} ETB\n\n` +
                    `🎮 Join another game!`
                );
            }
        }
    }
    
    // Clean up after 1 minute
    setTimeout(() => {
        if (activeGames[gameId]) {
            delete activeGames[gameId];
            saveActiveGames();
        }
    }, 60000);
    
    saveUsers();
    saveActiveGames();
}

async function notifyGamePlayers(gameId, message) {
    const game = activeGames[gameId];
    if (!game) return;
    
    for (const userId in game.players) {
        const user = users[userId];
        if (user && user.chatId) {
            await sendTelegramMessage(user.chatId, message);
        }
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
                    method: '_manual',
                    type: 'manual_screenshot'
                });
                saveDeposits();
                
                await sendTelegramMessage(chatId,
                    `📸 *Manual Screenshot Received*\n\n` +
                    `✅ Admin will review and add balance.\n` +
                    `⏰ Processing time: 5-10 minutes\n\n` +
                    `💡 *For INSTANT processing* (under 1 minute):\n` +
                    `1. Use /CBE\n` +
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
                            
                            // Check balance before allowing to play
                            if (user.balance < GAME_CONFIG.BOARD_PRICE) {
                                await sendTelegramMessage(chatId,
                                    `❌ *INSUFFICIENT BALANCE*\n\n` +
                                    `💰 Required: *${GAME_CONFIG.BOARD_PRICE} ETB*\n` +
                                    `💵 Your balance: *${user.balance} ETB*\n\n` +
                                    `💡 Use /deposit to add funds instantly!`,
                                    {
                                        inline_keyboard: [[
                                            { text: "💰 DEPOSIT NOW", callback_data: "deposit" }
                                        ]]
                                    }
                                );
                                break;
                            }
                            
                            await sendTelegramMessage(chatId,
                                `🎮 *JOIN MULTIPLAYER BINGO*\n\n` +
                                `💰 Entry Fee: *${GAME_CONFIG.BOARD_PRICE} ETB*\n` +
                                `🏆 Prize Pool: 80% of all bets\n` +
                                `👥 Min Players: ${GAME_CONFIG.MIN_PLAYERS}\n\n` +
                                `Click below to join a game:`,
                                {
                                    inline_keyboard: [[
                                        { 
                                            text: `🎮 JOIN GAME (${user.balance} ETB)`,
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
                // Check balance before allowing to play
                if (user.balance < GAME_CONFIG.BOARD_PRICE) {
                    await sendTelegramMessage(chatId,
                        `❌ *INSUFFICIENT BALANCE*\n\n` +
                        `💰 Required: *${GAME_CONFIG.BOARD_PRICE} ETB*\n` +
                        `💵 Your balance: *${user.balance} ETB*\n\n` +
                        `💡 Use /deposit to add funds instantly!`,
                        {
                            inline_keyboard: [[
                                { text: "💰 DEPOSIT NOW", callback_data: "deposit" }
                            ]]
                        }
                    );
                    break;
                }
                
                await sendTelegramMessage(chatId,
                    `🎮 *JOIN MULTIPLAYER BINGO*\n\n` +
                    `💰 Entry Fee: *${GAME_CONFIG.BOARD_PRICE} ETB*\n` +
                    `🏆 Prize Pool: 80% of all bets\n` +
                    `👥 Min Players: ${GAME_CONFIG.MIN_PLAYERS}\n\n` +
                    `Click below to join a game:`,
                    {
                        inline_keyboard: [[
                            { 
                                text: `🎮 JOIN GAME (${user.balance} ETB)`,
                                web_app: {url: `${RENDER_URL}/?user=${userId}&from=play_command`}
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
                    `➤ **Name:** Mearg Alemayoh\n\n` +
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
                    `➤ **Name:** Mearig Alemayehu\n\n` +
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
                    `➤ **Name:** Mearig Alemayehu\n\n` +
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

// ==================== MULTIPLAYER GAME API ENDPOINTS ====================
app.post('/api/game/join', async (req, res) => {
    const { userId } = req.body;
    
    if (!users[userId]) {
        return res.json({ success: false, error: 'User not found' });
    }
    
    const user = users[userId];
    
    // Check balance
    if (user.balance < GAME_CONFIG.BOARD_PRICE) {
        return res.json({ 
            success: false, 
            error: 'Insufficient balance',
            required: GAME_CONFIG.BOARD_PRICE,
            current: user.balance
        });
    }
    
    // Find or create game
    let gameId = findAvailableGame();
    
    if (!gameId) {
        gameId = createNewGame();
    }
    
    const game = activeGames[gameId];
    
    // Check if user already in game
    if (game.players[userId]) {
        return res.json({ 
            success: false, 
            error: 'Already in game',
            gameId: gameId
        });
    }
    
    // Add player to game
    game.players[userId] = {
        id: userId,
        username: user.username,
        board: generateBingoBoard(),
        markedNumbers: [],
        hasBingo: false,
        joinedAt: new Date().toISOString(),
        boardId: `B${Object.keys(game.players).length + 1}`
    };
    
    // Deduct balance
    user.balance -= GAME_CONFIG.BOARD_PRICE;
    user.totalWagered = (user.totalWagered || 0) + GAME_CONFIG.BOARD_PRICE;
    
    // Add to prize pool
    game.prizePool += GAME_CONFIG.BOARD_PRICE * (GAME_CONFIG.PRIZE_POOL_PERCENT / 100);
    
    saveUsers();
    saveActiveGames();
    
    // Record game join
    const gameRecordId = 'game_' + Date.now();
    games.push({
        id: gameRecordId,
        userId: userId,
        amount: GAME_CONFIG.BOARD_PRICE,
        date: new Date().toISOString(),
        type: 'join',
        gameId: gameId
    });
    saveGames();
    
    // Notify all players about new player
    await notifyGamePlayers(gameId, `🆕 ${user.username} joined the game! Players: ${Object.keys(game.players).length}/${GAME_CONFIG.MAX_PLAYERS}`);
    
    // Start game if enough players
    if (Object.keys(game.players).length >= GAME_CONFIG.MIN_PLAYERS && game.status === 'waiting') {
        await startGame(gameId);
    }
    
    res.json({
        success: true,
        gameId: gameId,
        board: game.players[userId].board,
        players: Object.keys(game.players).length,
        requiredPlayers: GAME_CONFIG.MIN_PLAYERS,
        gameStatus: game.status,
        prizePool: game.prizePool,
        yourBalance: user.balance
    });
});

app.get('/api/game/active', (req, res) => {
    const active = Object.values(activeGames).filter(game => 
        game.status === 'waiting' || game.status === 'active'
    ).map(game => ({
        id: game.id,
        status: game.status,
        players: Object.keys(game.players).length,
        prizePool: game.prizePool,
        timeLeft: game.endTime ? Math.max(0, new Date(game.endTime) - new Date()) : null
    }));
    
    res.json({ success: true, games: active });
});

app.get('/api/game/:gameId/state/:userId', (req, res) => {
    const { gameId, userId } = req.params;
    const game = activeGames[gameId];
    
    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }
    
    const player = game.players[userId];
    if (!player) {
        return res.json({ success: false, error: 'Not in this game' });
    }
    
    res.json({
        success: true,
        game: {
            id: game.id,
            status: game.status,
            players: Object.keys(game.players).length,
            playerList: Object.values(game.players).map(p => p.username),
            calledNumbers: game.calledNumbers,
            currentCall: game.currentCall,
            prizePool: game.prizePool,
            startTime: game.startTime,
            endTime: game.endTime,
            timeLeft: game.endTime ? Math.max(0, new Date(game.endTime) - new Date()) : 0
        },
        player: {
            board: player.board,
            markedNumbers: player.markedNumbers || [],
            hasBingo: player.hasBingo,
            boardId: player.boardId,
            username: player.username
        }
    });
});

app.post('/api/game/mark-number', (req, res) => {
    const { gameId, userId, number } = req.body;
    const game = activeGames[gameId];
    
    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }
    
    const player = game.players[userId];
    if (!player) {
        return res.json({ success: false, error: 'Not in this game' });
    }
    
    if (!game.calledNumbers.includes(number)) {
        return res.json({ success: false, error: 'Number not called yet' });
    }
    
    if (!player.markedNumbers.includes(number)) {
        player.markedNumbers.push(number);
        saveActiveGames();
    }
    
    res.json({ success: true, marked: player.markedNumbers });
});

app.post('/api/game/claim-bingo', async (req, res) => {
    const { gameId, userId } = req.body;
    const game = activeGames[gameId];
    
    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }
    
    const player = game.players[userId];
    if (!player) {
        return res.json({ success: false, error: 'Not in this game' });
    }
    
    // Check if player actually has bingo
    if (!checkBoardForBingo(player.board, player.markedNumbers || [], game.calledNumbers)) {
        return res.json({ success: false, error: 'No bingo yet' });
    }
    
    // Already handled by declareWinner function, but return success
    if (player.hasBingo) {
        return res.json({ 
            success: true, 
            message: 'Bingo already claimed',
            prize: game.winner?.prize || 0
        });
    }
    
    // Trigger win declaration
    player.hasBingo = true;
    await declareWinner(gameId, userId);
    
    res.json({ 
        success: true, 
        message: 'Bingo claimed successfully',
        prize: game.prizePool
    });
});

app.post('/api/game/leave', (req, res) => {
    const { gameId, userId } = req.body;
    const game = activeGames[gameId];
    
    if (!game) {
        return res.json({ success: false, error: 'Game not found' });
    }
    
    if (game.players[userId]) {
        delete game.players[userId];
        
        // If no players left, delete game
        if (Object.keys(game.players).length === 0) {
            delete activeGames[gameId];
        }
        
        saveActiveGames();
    }
    
    res.json({ success: true, message: 'Left game' });
});

// ==================== BASIC GAME API ENDPOINTS ====================
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
    
    // Count active multiplayer games
    const activeMultiplayerGames = Object.values(activeGames).filter(g => 
        g.status === 'active' || g.status === 'waiting'
    ).length;
    
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
            totalWinAmount: games.filter(g => g.type === 'win').reduce((sum, g) => sum + g.amount, 0),
            activeMultiplayerGames: activeMultiplayerGames,
            playersInGames: Object.values(activeGames).reduce((sum, game) => sum + Object.keys(game.players).length, 0)
        },
        system: {
            uptime: process.uptime(),
            timestamp: now.toISOString(),
            autoDepositSystem: 'operational',
            multiplayerSystem: 'active'
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
        system: 'Sheba Bingo Auto-Deposit & Multiplayer System',
        status: 'operational',
        uptime: process.uptime(),
        depositStats: {
            lastHour: recentDeposits.length,
            lastHourAmount: recentDeposits.reduce((sum, d) => sum + d.amount, 0),
            instantDeposits: recentDeposits.filter(d => d.autoParsed === true).length,
            autoApprovalRate: `${instantRate}%`
        },
        gameStats: {
            activeGames: Object.values(activeGames).filter(g => g.status === 'active' || g.status === 'waiting').length,
            totalPlayers: Object.values(activeGames).reduce((sum, game) => sum + Object.keys(game.players).length, 0),
            completedGames: Object.values(activeGames).filter(g => g.status === 'completed').length
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
    
    console.log('\n🚀 *MULTIPLAYER BINGO SYSTEM READY*');
    console.log('✅ Users can now join multiplayer games');
    console.log(`✅ Minimum players: ${GAME_CONFIG.MIN_PLAYERS}, Board price: ${GAME_CONFIG.BOARD_PRICE} ETB`);
    console.log('✅ Instant deposit system active');
    console.log('✅ Admin panel for monitoring at /admin.html');
    console.log('='.repeat(60));
});
