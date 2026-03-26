// ==================== IMPORTS ====================
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');

// Create Express app
const app = express();
// Create HTTP server
const server = http.createServer(app);

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS - restrict origins
app.use(cors({
    origin: ['https://shebabingo-bot.onrender.com', 'https://t.me'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// ==================== CONFIGURATION ====================
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN not set! Please add it to environment variables.');
    console.error('💡 Go to Render Dashboard → Environment → Add BOT_TOKEN');
    process.exit(1);
}
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Mg@sheba#23';
const RENDER_URL = process.env.RENDER_URL || 'https://shebabingo-bot.onrender.com';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '6297094384';

console.log('='.repeat(60));
console.log('🚀 SHEBA BINGO - MULTIPLAYER SERVER STARTING');
console.log('📅 Time:', new Date().toISOString());
console.log('🔄 NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('🔑 BOT_TOKEN exists:', !!process.env.BOT_TOKEN);
console.log('🗄️ DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('🌐 RENDER_URL:', process.env.RENDER_URL || 'Not set');
console.log('='.repeat(60));

// ==================== POSTGRESQL DATABASE CONNECTION ====================
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is NOT set!');
    console.error('📌 Please add it in Render dashboard');
    console.log('⚠️ Running without PostgreSQL database (using file storage only)');
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err.message);
});

async function testDatabaseConnection() {
    if (!DATABASE_URL) {
        console.log('⚠️ No DATABASE_URL, skipping PostgreSQL connection test');
        return false;
    }
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ PostgreSQL connected successfully at:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection FAILED:', error.message);
        console.log('⚠️ Continuing with file-based storage only...');
        return false;
    }
}
testDatabaseConnection();

if (DATABASE_URL) {
    setInterval(async () => {
        try {
            await pool.query('SELECT 1');
        } catch (err) {
            console.error('Keep-alive failed:', err.message);
        }
    }, 60000);
}

// ==================== FILE-BASED STORAGE ====================
let users = {};
let deposits = [];
let games = [];
let activeMultiplayerGames = {};

const USERS_FILE = path.join(__dirname, 'users.json');
const DEPOSITS_FILE = path.join(__dirname, 'deposits.json');
const GAMES_FILE = path.join(__dirname, 'games.json');
const ACTIVE_MULTIPLAYER_FILE = path.join(__dirname, 'active_multipayer_games.json');

// Load existing data
if (fs.existsSync(USERS_FILE)) {
    try {
        users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        console.log(`✅ Loaded ${Object.keys(users).length} users from file`);
    } catch (error) {
        console.error('Error loading users:', error.message);
    }
}
if (fs.existsSync(DEPOSITS_FILE)) {
    try {
        deposits = JSON.parse(fs.readFileSync(DEPOSITS_FILE, 'utf8'));
        console.log(`✅ Loaded ${deposits.length} deposits from file`);
    } catch (error) {
        console.error('Error loading deposits:', error.message);
    }
}
if (fs.existsSync(GAMES_FILE)) {
    try {
        games = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8'));
        console.log(`✅ Loaded ${games.length} games from file`);
    } catch (error) {
        console.error('Error loading games:', error.message);
    }
}
if (fs.existsSync(ACTIVE_MULTIPLAYER_FILE)) {
    try {
        const data = fs.readFileSync(ACTIVE_MULTIPLAYER_FILE, 'utf8');
        if (data && data.trim()) {
            activeMultiplayerGames = JSON.parse(data);
            console.log(`✅ Loaded ${Object.keys(activeMultiplayerGames).length} active multiplayer games`);
        }
    } catch (error) {
        console.error('Error loading multiplayer games:', error.message);
    }
}

function saveUsers() { try { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); } catch(e) { console.error('Error saving users:', e.message); } }
function saveDeposits() { try { fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits, null, 2)); } catch(e) { console.error('Error saving deposits:', e.message); } }
function saveGames() { try { fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2)); } catch(e) { console.error('Error saving games:', e.message); } }
function saveActiveMultiplayerGames() { try { fs.writeFileSync(ACTIVE_MULTIPLAYER_FILE, JSON.stringify(activeMultiplayerGames, null, 2)); console.log('✅ Multiplayer games saved'); } catch(e) { console.error('Error saving multiplayer games:', e.message); } }

// ==================== GAME CONFIGURATION ====================
const GAME_CONFIG = {
    BOARD_PRICE: 10,
    PRIZE_POOL_PERCENT: 80,
    MAX_CALLS: 45,
    CALL_INTERVAL: 3000,           // 3 seconds between numbers
    SELECTION_TIME: 25,            // 25 seconds board selection
    SHUFFLE_TIME: 5,               // 5 seconds shuffling countdown
    GAME_DURATION: 90000,          // 1.5 minutes active game
    RESULTS_TIME: 10,
    NEXT_GAME_DELAY: 2000,
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 999,
    MAX_BOARDS_PER_PLAYER: 3,
    TOTAL_BOARDS: 400
};

// ==================== WEBSOCKET ====================
const wss = new WebSocket.Server({ server, path: '/game-ws', clientTracking: true });
const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        try { ws.ping(); } catch (err) {}
    });
}, 30000);
const gameConnections = new Map();

wss.on('connection', (ws, request) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    const query = request.url.split('?')[1] || '';
    const params = new URLSearchParams(query);
    const gameId = params.get('gameId');
    const userId = params.get('userId');
    if (!gameId || !userId) { ws.close(1008, 'Missing parameters'); return; }
    ws.gameId = gameId;
    ws.userId = userId;
    if (!gameConnections.has(gameId)) gameConnections.set(gameId, new Set());
    gameConnections.get(gameId).add(ws);
    console.log(`🔗 User ${userId} connected to game ${gameId}`);
    getGameState(gameId, userId).then(gameState => {
        if (gameState && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'game_state', data: gameState }));
        }
    }).catch(err => console.error('Game state error:', err.message));
    ws.on('message', async (message) => {
        try { await handleGameMessage(ws, message); } catch (err) { console.error('Message handling error:', err.message); }
    });
    ws.on('close', () => {
        const connections = gameConnections.get(gameId);
        if (connections) { connections.delete(ws); if (connections.size === 0) gameConnections.delete(gameId); }
        console.log(`🔌 User ${userId} disconnected from game ${gameId}`);
        broadcastToGame(gameId, { type: 'players_update', count: connections ? connections.size : 0 });
    });
    ws.on('error', (err) => { console.error(`WebSocket error (${userId}):`, err.message); });
});

async function handleGameMessage(ws, message) {
    const data = JSON.parse(message);
    const { gameId, userId } = ws;
    switch (data.type) {
        case 'mark_number':
            const marked = await markPlayerNumber(gameId, userId, data.number);
            if (marked) {
                broadcastToGame(gameId, { type: 'number_marked', userId, number: data.number });
                ws.send(JSON.stringify({ type: 'mark_success', number: data.number, marked: true }));
            } else {
                ws.send(JSON.stringify({ type: 'mark_failed', number: data.number, error: 'Number already marked or invalid' }));
            }
            break;
        case 'claim_bingo':
            const valid = await checkBingo(gameId, userId);
            if (valid) {
                const result = await declareWinner(gameId, userId);
                if (result.success) broadcastToGame(gameId, { type: 'winner', userId, prize: result.prize });
            }
            break;
        case 'chat_message':
            broadcastToGame(gameId, { type: 'chat', userId, message: data.message, timestamp: new Date().toISOString() });
            break;
        case 'get_state':
            const state = await getGameState(gameId, userId);
            if (state && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'game_state', data: state }));
            break;
        case 'ping':
            ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
            break;
    }
}

function broadcastToGame(gameId, payload) {
    const connections = gameConnections.get(gameId);
    if (!connections) return;
    const message = JSON.stringify(payload);
    connections.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(message); });
}

const gameIntervals = {};
const gameTimers = {};

// ==================== DATABASE FUNCTIONS ====================
async function getNextGameNumber() {
    try {
        const result = await pool.query("SELECT COALESCE(MAX(game_number), 0) + 1 as next_number FROM multiplayer_games WHERE DATE(created_at) = CURRENT_DATE");
        return result.rows[0].next_number;
    } catch (error) { return 1; }
}

// ==================== CORE GAME FUNCTIONS ====================
function generateBingoBoard() {
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
    const B = shuffle([...Array(15).keys()].map(i => i + 1)).slice(0, 5).sort((a,b)=>a-b);
    const I = shuffle([...Array(15).keys()].map(i => i + 16)).slice(0, 5).sort((a,b)=>a-b);
    const N = shuffle([...Array(15).keys()].map(i => i + 31)).slice(0, 4).sort((a,b)=>a-b);
    const G = shuffle([...Array(15).keys()].map(i => i + 46)).slice(0, 5).sort((a,b)=>a-b);
    const O = shuffle([...Array(15).keys()].map(i => i + 61)).slice(0, 5).sort((a,b)=>a-b);
    const board = [];
    let nIndex = 0;
    for (let row = 0; row < 5; row++) {
        board.push([B[row], I[row], row === 2 ? 'FREE' : N[nIndex++], G[row], O[row]]);
    }
    return board;
}

function checkBoardForBingo(boardData, markedNumbers, calledNumbers) {
    const calledNums = calledNumbers.map(cn => { const m = cn.match(/\d+/); return m ? parseInt(m[0]) : cn; });
    for (let row = 0; row < 5; row++) {
        let complete = true;
        for (let col = 0; col < 5; col++) {
            const cell = boardData[row][col];
            if (cell !== 'FREE' && !markedNumbers.includes(cell) && !calledNums.includes(cell)) { complete = false; break; }
        }
        if (complete) return true;
    }
    for (let col = 0; col < 5; col++) {
        let complete = true;
        for (let row = 0; row < 5; row++) {
            const cell = boardData[row][col];
            if (cell !== 'FREE' && !markedNumbers.includes(cell) && !calledNums.includes(cell)) { complete = false; break; }
        }
        if (complete) return true;
    }
    let diag1 = true, diag2 = true;
    for (let i = 0; i < 5; i++) {
        const cell1 = boardData[i][i];
        if (cell1 !== 'FREE' && !markedNumbers.includes(cell1) && !calledNums.includes(cell1)) diag1 = false;
        const cell2 = boardData[i][4-i];
        if (cell2 !== 'FREE' && !markedNumbers.includes(cell2) && !calledNums.includes(cell2)) diag2 = false;
    }
    return diag1 || diag2;
}

async function createMultiplayerGame() {
    const gameId = 'GAME_' + Date.now().toString(36);
    const gameNumber = Object.keys(activeMultiplayerGames).length + 1;
    const now = new Date();
    const selectionEndTime = new Date(now.getTime() + (GAME_CONFIG.SELECTION_TIME * 1000));
    activeMultiplayerGames[gameId] = {
        id: gameId, gameNumber, status: 'waiting', players: {}, calledNumbers: [], prizePool: 0,
        createdAt: now.toISOString(), selectionEndTime: selectionEndTime.toISOString(),
        startTime: null, endTime: null, currentCall: null, winners: []
    };
    console.log(`🆕 Game #${gameNumber} created. Selection ends in ${GAME_CONFIG.SELECTION_TIME}s`);
    setTimeout(async () => {
        console.log(`⏰ Selection time ended for game ${gameId}`);
        await checkAndStartGame(gameId);
    }, GAME_CONFIG.SELECTION_TIME * 1000);
    saveActiveMultiplayerGames();
    return { success: true, gameId, gameNumber };
}

async function checkAndStartGame(gameId) {
    const game = activeMultiplayerGames[gameId];
    if (!game) return;
    if (game.status !== 'waiting') return;
    const playerCount = Object.keys(game.players).length;
    console.log(`📊 Game ${gameId} has ${playerCount} players, need ${GAME_CONFIG.MIN_PLAYERS}`);
    if (playerCount >= GAME_CONFIG.MIN_PLAYERS) {
        console.log(`✅ Starting game ${gameId} with ${playerCount} players`);
        await startGamePlay(gameId);
    } else {
        console.log(`❌ Game ${gameId} cancelled - only ${playerCount} players`);
        await cancelGame(gameId);
    }
}

async function startGamePlay(gameId) {
    const game = activeMultiplayerGames[gameId];
    if (!game) return;
    console.log(`🚀 STARTING GAME PLAY for ${gameId}`);
    game.status = 'shuffling';
    game.startTime = new Date().toISOString();
    saveActiveMultiplayerGames();
    broadcastToGame(gameId, { type: 'game_status', status: 'shuffling', message: '🎮 GAME STARTING! Shuffling numbers...', countdown: 5 });
    let countdown = 5;
    const countdownInterval = setInterval(() => {
        countdown--;
        broadcastToGame(gameId, { type: 'countdown', status: 'shuffling', seconds: countdown, message: `Starting in ${countdown} seconds...` });
        if (countdown <= 0) clearInterval(countdownInterval);
    }, 1000);
    setTimeout(async () => {
        clearInterval(countdownInterval);
        game.status = 'active';
        game.endTime = new Date(Date.now() + GAME_CONFIG.GAME_DURATION).toISOString();
        game.calledNumbers = [];
        saveActiveMultiplayerGames();
        broadcastToGame(gameId, { type: 'game_status', status: 'active', message: '🎮 GAME ACTIVE! Numbers will be called every 3 seconds!', gameDuration: GAME_CONFIG.GAME_DURATION });
        console.log(`🎮 Game ${gameId} is now ACTIVE!`);
        callGameNumbers(gameId);
        setTimeout(async () => {
            if (game.status === 'active') {
                console.log(`⏰ Game ${gameId} time limit reached`);
                await endGameNoWinner(gameId);
            }
        }, GAME_CONFIG.GAME_DURATION);
    }, 5000);
}

async function callGameNumbers(gameId) {
    const game = activeMultiplayerGames[gameId];
    if (!game || game.status !== 'active') return;
    if (game.calledNumbers.length >= GAME_CONFIG.MAX_CALLS) {
        console.log(`🎯 Game ${gameId}: Called all ${GAME_CONFIG.MAX_CALLS} numbers`);
        await endGameNoWinner(gameId);
        return;
    }
    const letters = ['B', 'I', 'N', 'G', 'O'];
    const letter = letters[Math.floor(Math.random() * 5)];
    let min, max;
    switch(letter) { case 'B': min=1; max=15; break; case 'I': min=16; max=30; break; case 'N': min=31; max=45; break; case 'G': min=46; max=60; break; case 'O': min=61; max=75; break; }
    const numberValue = Math.floor(Math.random() * (max - min + 1)) + min;
    const newNumber = `${letter}${numberValue}`;
    if (game.calledNumbers.includes(newNumber)) {
        setTimeout(() => callGameNumbers(gameId), 500);
        return;
    }
    game.calledNumbers.push(newNumber);
    game.currentCall = newNumber;
    saveActiveMultiplayerGames();
    broadcastToGame(gameId, { type: 'number_called', number: newNumber, calledNumbers: game.calledNumbers, callCount: game.calledNumbers.length, totalNumbers: GAME_CONFIG.MAX_CALLS });
    console.log(`🔔 Game ${gameId}: Called ${newNumber} (${game.calledNumbers.length}/${GAME_CONFIG.MAX_CALLS})`);
    const winners = checkForWinners(gameId);
    if (winners.length > 0) {
        console.log(`🏆 Winners found!`);
        await declareWinners(gameId, winners);
        return;
    }
    setTimeout(() => callGameNumbers(gameId), GAME_CONFIG.CALL_INTERVAL);
}

function checkForWinners(gameId) {
    const game = activeMultiplayerGames[gameId];
    if (!game) return [];
    const winners = [];
    const calledNumbers = game.calledNumbers.map(cn => { const m = cn.match(/\d+/); return m ? parseInt(m[0]) : cn; });
    for (const userId in game.players) {
        const player = game.players[userId];
        if (player.hasBingo) continue;
        for (const board of player.boards) {
            if (checkBoardForBingo(board.boardData, player.markedNumbers, calledNumbers)) {
                player.hasBingo = true;
                winners.push({ userId, username: player.username, boardNumber: board.boardNumber });
                break;
            }
        }
    }
    return winners;
}

async function declareWinners(gameId, winners) {
    const game = activeMultiplayerGames[gameId];
    if (!game) return;
    const prizePerWinner = Math.floor(game.prizePool / winners.length);
    for (const winner of winners) {
        const user = users[winner.userId];
        if (user) {
            user.balance += prizePerWinner;
            user.totalWon = (user.totalWon || 0) + prizePerWinner;
            if (user.chatId) {
                await sendTelegramMessage(user.chatId,
                    `🎉 *BINGO! YOU WON!* 🎉\n\n🏆 Prize: *${prizePerWinner} ETB*\n🔢 Board: #${winner.boardNumber}\n💰 New Balance: *${user.balance} ETB*`);
            }
        }
    }
    game.status = 'completed';
    game.winners = winners;
    game.prizePerWinner = prizePerWinner;
    saveActiveMultiplayerGames();
    saveUsers();
    broadcastToGame(gameId, { type: 'game_completed', winners, prizePerWinner, message: winners.length > 1 ? `🎉 ${winners.length} WINNERS! Each wins ${prizePerWinner} ETB!` : `🏆 WINNER: ${winners[0].username} wins ${prizePerWinner} ETB!` });
    console.log(`✅ Game ${gameId} completed. ${winners.length} winner(s) won ${prizePerWinner} ETB each`);
    setTimeout(() => cleanupGame(gameId), 30000);
}

async function endGameNoWinner(gameId) {
    const game = activeMultiplayerGames[gameId];
    if (!game) return;
    game.status = 'completed';
    saveActiveMultiplayerGames();
    broadcastToGame(gameId, { type: 'game_ended', message: '🤷 No winner this game! Next game starting soon.' });
    console.log(`❌ Game ${gameId} ended with no winner`);
    setTimeout(() => cleanupGame(gameId), 30000);
}

async function cancelGame(gameId) {
    const game = activeMultiplayerGames[gameId];
    if (!game) return;
    for (const userId in game.players) {
        const player = game.players[userId];
        const user = users[userId];
        if (user) {
            user.balance += player.totalBet;
            if (user.chatId) {
                await sendTelegramMessage(user.chatId, `🔄 *Game Cancelled*\n\nNot enough players joined.\n💰 Refund: *${player.totalBet} ETB*`);
            }
        }
    }
    delete activeMultiplayerGames[gameId];
    saveActiveMultiplayerGames();
    saveUsers();
    console.log(`❌ Game ${gameId} cancelled, players refunded`);
    setTimeout(() => createMultiplayerGame(), 2000);
}

function cleanupGame(gameId) {
    const connections = gameConnections.get(gameId);
    if (connections) {
        connections.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.close(1001, 'Game ended'); });
        gameConnections.delete(gameId);
    }
    if (activeMultiplayerGames[gameId]) delete activeMultiplayerGames[gameId];
    if (gameTimers[gameId]) clearTimeout(gameTimers[gameId]);
    if (gameIntervals[gameId]) clearInterval(gameIntervals[gameId]);
    saveActiveMultiplayerGames();
    console.log(`🧹 Full cleanup completed for game ${gameId}`);
}

async function joinMultiplayerGame(gameId, userId, boardCount, boardNumbers) {
    const user = users[userId];
    if (!user) return { success: false, error: 'User not found' };
    const totalCost = boardCount * GAME_CONFIG.BOARD_PRICE;
    if (user.balance < totalCost) return { success: false, error: `Insufficient balance. Need ${totalCost} ETB` };
    const game = activeMultiplayerGames[gameId];
    if (!game) return { success: false, error: 'Game not found' };
    const boards = [];
    for (let i = 0; i < boardCount; i++) {
        boards.push({
            boardNumber: boardNumbers[i] || Math.floor(Math.random() * 400) + 1,
            boardData: generateBingoBoard(),
            markedNumbers: [],
            hasBingo: false,
            boardId: `B${i + 1}`
        });
    }
    game.players[userId] = { id: userId, username: user.username, boards, markedNumbers: [], hasBingo: false, totalBet: totalCost, joinedAt: new Date().toISOString() };
    user.balance -= totalCost;
    game.prizePool += totalCost * (GAME_CONFIG.PRIZE_POOL_PERCENT / 100);
    saveUsers();
    saveActiveMultiplayerGames();
    return { success: true, gameId, boards, prizePool: game.prizePool, playerCount: Object.keys(game.players).length, selectionTimeLeft: Math.max(0, Math.floor((new Date(game.selectionEndTime) - new Date()) / 1000)) };
}

async function getGameState(gameId, userId) {
    const game = activeMultiplayerGames[gameId];
    if (!game) return null;
    const player = game.players[userId];
    if (!player) return null;
    const playerList = Object.values(game.players).map(p => p.username);
    return {
        game: {
            id: game.id, gameNumber: game.gameNumber, status: game.status,
            calledNumbers: game.calledNumbers, currentCall: game.currentCall,
            prizePool: game.prizePool, players: playerList.length, playerList,
            startTime: game.startTime, endTime: game.endTime,
            timeLeft: game.endTime ? Math.max(0, new Date(game.endTime) - new Date()) : 0
        },
        player: { boards: player.boards, markedNumbers: player.markedNumbers, hasBingo: player.hasBingo }
    };
}

async function getPlayerCount(gameId) {
    const game = activeMultiplayerGames[gameId];
    return game ? Object.keys(game.players).length : 0;
}

async function markPlayerNumber(gameId, userId, number) {
    const game = activeMultiplayerGames[gameId];
    if (!game) return false;
    const player = game.players[userId];
    if (!player) return false;
    if (player.markedNumbers.includes(number)) return false;
    player.markedNumbers.push(number);
    saveActiveMultiplayerGames();
    return true;
}

async function checkBingo(gameId, userId) {
    const game = activeMultiplayerGames[gameId];
    if (!game) return false;
    const player = game.players[userId];
    if (!player) return false;
    const calledNumbers = game.calledNumbers.map(cn => { const m = cn.match(/\d+/); return m ? parseInt(m[0]) : cn; });
    for (const board of player.boards) {
        if (checkBoardForBingo(board.boardData, player.markedNumbers, calledNumbers)) return true;
    }
    return false;
}

async function declareWinner(gameId, userId) {
    const game = activeMultiplayerGames[gameId];
    if (!game) return { success: false, error: 'Game not found' };
    const user = users[userId];
    if (!user) return { success: false, error: 'User not found' };
    const prize = game.prizePool;
    user.balance += prize;
    user.totalWon = (user.totalWon || 0) + prize;
    game.status = 'completed';
    game.winners = [{ userId, username: user.username }];
    game.prizePerWinner = prize;
    saveUsers();
    saveActiveMultiplayerGames();
    if (user.chatId) {
        await sendTelegramMessage(user.chatId,
            `🎊 *CONGRATULATIONS! YOU WON!*\n\n🏆 You got BINGO!\n💰 Prize: ${prize.toFixed(1)} ETB added!\n📊 New Balance: ${user.balance.toFixed(1)} ETB`);
    }
    return { success: true, prize };
}

// ==================== TELEGRAM FUNCTIONS ====================
async function setupTelegramWebhook() {
    try {
        if (!BOT_TOKEN) return;
        const webhookUrl = `${RENDER_URL}/telegram-webhook`;
        console.log('='.repeat(60));
        console.log('🔧 SETTING UP TELEGRAM BOT');
        console.log('='.repeat(60));
        console.log(`🤖 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
        console.log(`🌐 Webhook URL: ${webhookUrl}`);
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
        console.log('✅ Old webhook deleted');
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, { url: webhookUrl, allowed_updates: ["message", "callback_query"] });
        console.log('✅ Webhook set successfully');
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

async function sendTelegramMessage(chatId, text, replyMarkup = null) {
    try {
        const payload = { chat_id: chatId, text, parse_mode: 'Markdown' };
        if (replyMarkup) payload.reply_markup = replyMarkup;
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, payload);
    } catch (error) { console.error('Telegram send error:', error.message); }
}

// ==================== TELEGRAM WEBHOOK HANDLER ====================
app.post('/telegram-webhook', async (req, res) => {
    res.status(200).send('OK');
    try {
        const update = req.body;
        if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
            return;
        }
        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text || '';
            const userId = update.message.from.id;
            const userIdStr = userId.toString();
            const username = update.message.from.username || update.message.from.first_name || 'User';
            console.log(`📝 Message from ${username} (${userIdStr}): ${text}`);
            if (!users[userIdStr]) {
                users[userIdStr] = { id: userIdStr, username, chatId, balance: 0, registered: false, isAgent: false, agentCode: 'AG' + userIdStr.slice(-6), joinDate: new Date().toISOString(), lastActive: new Date().toISOString(), totalDeposited: 0, totalWon: 0 };
                saveUsers();
                console.log(`👤 New user registered: ${username} (${userIdStr})`);
            }
            users[userIdStr].lastActive = new Date().toISOString();
            const user = users[userIdStr];
            if (text === '/start') {
                if (!user.registered) {
                    await sendTelegramMessage(chatId, `🎮 *Welcome to SHEBA BINGO!* 🎰\n\n🔥 *GET 10 ETB FREE BONUS INSTANTLY!*\n\n✅ Register with 1 click\n✅ Play instantly\n✅ Win real money\n\nClick REGISTER to start:`, { inline_keyboard: [[{ text: "📝 REGISTER NOW", callback_data: "register" }]] });
                } else {
                    await sendTelegramMessage(chatId, `🎮 *Welcome back to SHEBA BINGO!* 🎰\n\n💰 *Your Balance: ${user.balance} ETB*\n\n⚡ Quick Actions:`, { inline_keyboard: [[{ text: `🎮 PLAY NOW (${user.balance} ETB)`, web_app: { url: `${RENDER_URL}/?user=${userId}` } }], [{ text: "💰 DEPOSIT", callback_data: "deposit" }, { text: "📊 BALANCE", callback_data: "balance" }], [{ text: "📖 INSTRUCTION", callback_data: "instruction" }, { text: "👥 INVITE", callback_data: "invite" }]] });
                }
            } else if (text === '/play') {
                if (user.balance < GAME_CONFIG.BOARD_PRICE) {
                    await sendTelegramMessage(chatId, `❌ *INSUFFICIENT BALANCE*\n\n💰 Required: *${GAME_CONFIG.BOARD_PRICE} ETB*\n💵 Your balance: *${user.balance} ETB*\n\n💡 Use /deposit to add funds instantly!`, { inline_keyboard: [[{ text: "💰 DEPOSIT NOW", callback_data: "deposit" }]] });
                } else {
                    await sendTelegramMessage(chatId, `🎮 *SHEBA BINGO - MULTIPLAYER*\n\n💰 Your Balance: *${user.balance} ETB*\n🎲 Entry Fee: *${GAME_CONFIG.BOARD_PRICE} ETB* per board\n🏆 Prize Pool: 80% of all bets\n👥 Min Players: 2 | Max: Unlimited\n\n🎯 *HOW TO PLAY:*\n1️⃣ Select 1-3 boards\n2️⃣ Mark numbers as they're called\n3️⃣ Complete a row, column, or diagonal\n4️⃣ Click "CLAIM BINGO" to win!\n\n⏱️ Game starts in 25 seconds!\n\n👇 *Click PLAY to start!*`, { inline_keyboard: [[{ text: `🎮 PLAY NOW (${user.balance} ETB)`, web_app: { url: `${RENDER_URL}/?user=${userId}` } }]] });
                }
            }
        }
    } catch (error) { console.error('Webhook error:', error.message); }
});

async function handleCallbackQuery(callback) {
    const chatId = callback.message.chat.id;
    const userId = callback.from.id;
    const data = callback.data;
    const user = users[userId];
    if (!user) return;
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, { callback_query_id: callback.id });
    console.log(`🔘 Callback received: ${data} from ${user.username}`);
    if (data === 'register') {
        if (!user.registered) {
            user.registered = true;
            user.balance += 10;
            saveUsers();
            await sendTelegramMessage(chatId, `✅ *REGISTRATION SUCCESSFUL!* 🎉\n\n🎁 Welcome Bonus: *10 ETB*\n💰 Current Balance: *${user.balance} ETB*\n\n🎮 Click PLAY to start!`, { inline_keyboard: [[{ text: `🎮 PLAY NOW (${user.balance} ETB)`, web_app: { url: `${RENDER_URL}/?user=${user.id}` } }], [{ text: "💰 DEPOSIT", callback_data: "deposit" }, { text: "📊 BALANCE", callback_data: "balance" }]] });
        } else {
            await sendTelegramMessage(chatId, `ℹ️ *አስቀድመው ተመዝግበዋል / Already Registered*\n\nየአሁን ባላንስዎ / Your current balance: *${user.balance} ETB*\n\n🎮 ጨዋታ ለመጀመር ከታች ያለውን ቁልፍ ይጫኑ።`, { inline_keyboard: [[{ text: "🎮 PLAY NOW", web_app: { url: `${RENDER_URL}/?user=${user.id}` } }], [{ text: "💰 DEPOSIT", callback_data: "deposit" }, { text: "📊 BALANCE", callback_data: "balance" }]] });
        }
    } else if (data === 'deposit') {
        await sendTelegramMessage(chatId, `💰 *CHOOSE PAYMENT METHOD - INSTANT DEPOSIT* 💰\n\n*FOR INSTANT CREDIT (UNDER 1 MINUTE):*\n1. Select your payment method below.\n2. Complete the transfer.\n3. **COPY the ENTIRE confirmation SMS** you receive.\n4. **PASTE that SMS text directly here** in this chat.\n\n✅ *Automatic processing!*\n❌ Do NOT send screenshots for instant processing.`, { inline_keyboard: [[{ text: "📱 TeleBirr (INSTANT)", callback_data: "telebirr_instant" }], [{ text: "🏦 CBE Birr (INSTANT)", callback_data: "cbe_instant" }], [{ text: "🏛️ Bank of Abyssinia", callback_data: "boa_instant" }], [{ text: "📸 Manual Screenshot (Slower)", callback_data: "manual_deposit" }]] });
    } else if (data === 'balance') {
        await sendTelegramMessage(chatId, `💰 *YOUR BALANCE*\n\n💵 Available: *${user.balance} ETB*`, { inline_keyboard: [[{ text: `🎮 PLAY NOW (${user.balance} ETB)`, web_app: { url: `${RENDER_URL}/?user=${userId}` } }]] });
    } else if (data === 'instruction') {
        await sendTelegramMessage(chatId, `📖 *HOW TO PLAY SHEBA BINGO*\n\n1️⃣ /register - Get 10 ETB free bonus\n2️⃣ /deposit - Add money (min 10 ETB)\n3️⃣ /play - Open game & select 1-3 boards\n4️⃣ Mark numbers as they are called\n5️⃣ Complete row/column/diagonal to win!\n6️⃣ Click "CLAIM BINGO" to win!`, { inline_keyboard: [[{ text: "🎮 PLAY NOW", web_app: { url: `${RENDER_URL}/?user=${userId}` } }]] });
    } else if (data === 'invite') {
        await sendTelegramMessage(chatId, `👥 *INVITE FRIENDS*\n\nShare this link: https://t.me/ShebaBingoETBot?start=${userId}\n\n🎁 Get 5 ETB when they register and deposit!`);
    } else {
        await sendTelegramMessage(chatId, `🎮 *SHEBA BINGO MENU*\n\n💰 Balance: *${user.balance} ETB*`, { inline_keyboard: [[{ text: "🎮 PLAY", web_app: { url: `${RENDER_URL}/?user=${userId}` } }], [{ text: "💰 DEPOSIT", callback_data: "deposit" }, { text: "📊 BALANCE", callback_data: "balance" }], [{ text: "📖 INSTRUCTION", callback_data: "instruction" }, { text: "👥 INVITE", callback_data: "invite" }]] });
    }
}

async function processInstantDeposit(userId, chatId, smsText) {
    const user = users[userId];
    if (!user) return;
    const txPatterns = [/transaction number is ([A-Z0-9]{10,})/i, /receipt\/([A-Z0-9]{10,})/i, /([A-Z0-9]{10,})\.?\s*$/m];
    let transactionId = null;
    for (const p of txPatterns) { const m = smsText.match(p); if (m) { transactionId = m[1] || m[0]; break; } }
    const amountPatterns = [/transferred ETB ([\d.]+)/i, /ETB\s*(\d+(?:\.\d{2})?)/i, /(\d+(?:\.\d{2})?)\s*ETB/i];
    let amount = null;
    for (const p of amountPatterns) { const m = smsText.match(p); if (m) { amount = parseFloat(m[1]); if (amount >= 10) break; } }
    if (!transactionId || !amount || amount < 10) return;
    if (deposits.some(d => d.transactionId === transactionId && d.status === 'approved')) {
        await sendTelegramMessage(chatId, `⚠️ *Deposit Already Processed*`);
        return;
    }
    const deposit = { id: `auto_${Date.now()}`, userId, username: user.username, chatId, smsText, transactionId, amount, status: 'approved', method: 'telebirr_auto', date: new Date().toISOString(), approvedAt: new Date().toISOString(), autoParsed: true };
    deposits.push(deposit);
    user.balance += amount;
    user.totalDeposited = (user.totalDeposited || 0) + amount;
    saveUsers();
    saveDeposits();
    await sendTelegramMessage(chatId, `✅ *Deposit successful!*\n\nAmount added: *${amount.toFixed(1)} ETB*\nTransaction: *${transactionId}*\nNew balance: *${user.balance.toFixed(1)} ETB*\n\n🎮 Click PLAY to start!`, { reply_markup: { inline_keyboard: [[{ text: "🎮 PLAY NOW", web_app: { url: `${RENDER_URL}/?user=${userId}` } }]] } });
}

// ==================== API ENDPOINTS ====================
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
app.get('/game.html', (req, res) => { res.redirect(301, `/?user=${req.query.user || ''}`); });
app.get('/game', (req, res) => { res.redirect(301, `/?user=${req.query.user || ''}`); });

app.get('/api/multiplayer/games', (req, res) => {
    const games = Object.values(activeMultiplayerGames).filter(g => g.status === 'waiting').map(g => ({
        id: g.id, gameNumber: g.gameNumber, players: Object.keys(g.players).length,
        prizePool: g.prizePool, status: g.status, timeLeft: Math.max(0, Math.floor((new Date(g.selectionEndTime) - new Date()) / 1000))
    }));
    res.json({ success: true, games });
});

app.post('/api/multiplayer/join', async (req, res) => {
    let gameId = null;
    for (const gid in activeMultiplayerGames) { if (activeMultiplayerGames[gid].status === 'waiting') { gameId = gid; break; } }
    if (!gameId) { const newGame = await createMultiplayerGame(); gameId = newGame.gameId; }
    const result = await joinMultiplayerGame(gameId, req.body.userId, req.body.boardCount || 1, req.body.boardNumbers || []);
    res.json(result);
});

app.get('/api/multiplayer/state/:gameId/:userId', async (req, res) => {
    const state = await getGameState(req.params.gameId, req.params.userId);
    res.json(state ? { success: true, ...state } : { success: false, error: 'Game not found' });
});

app.get('/api/user/:id/balance', (req, res) => {
    const user = users[req.params.id];
    if (user) res.json({ success: true, balance: user.balance, username: user.username });
    else { users[req.params.id] = { id: req.params.id, username: 'Player_' + req.params.id.slice(-4), balance: 0, registered: false }; saveUsers(); res.json({ success: true, balance: 0 }); }
});

app.get('/api/health', (req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime(), activeGames: Object.keys(activeMultiplayerGames).length }); });
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
async function startGameCycle() {
    console.log('🔄 Starting 24/7 game cycle...');
    await createMultiplayerGame();
    setInterval(async () => {
        const waitingCount = Object.values(activeMultiplayerGames).filter(g => g.status === 'waiting').length;
        if (waitingCount < 1) await createMultiplayerGame();
    }, 30000);
}
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await setupTelegramWebhook();
    startGameCycle();
    console.log('✅ All systems initialized');
});
process.on('SIGTERM', async () => { wss.close(); await pool.end(); saveUsers(); saveDeposits(); saveGames(); saveActiveMultiplayerGames(); process.exit(0); });

// Database initialization (keep as is)
async function initializeDatabase() {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS multiplayer_games (id VARCHAR(50) PRIMARY KEY, game_number INTEGER, status VARCHAR(20) DEFAULT 'selecting', prize_pool DECIMAL(10,2) DEFAULT 0, called_numbers JSONB DEFAULT '[]', current_call VARCHAR(5), start_time TIMESTAMP, end_time TIMESTAMP, selection_end_time TIMESTAMP, winner_id BIGINT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS game_players (id SERIAL PRIMARY KEY, game_id VARCHAR(50) REFERENCES multiplayer_games(id) ON DELETE CASCADE, user_id BIGINT, boards JSONB, marked_numbers JSONB DEFAULT '[]', has_bingo BOOLEAN DEFAULT FALSE, joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        console.log('✅ Database tables initialized');
    } catch (error) { console.error('Error initializing database:', error); }
}
async function migrateDatabase() {
    try {
        await pool.query(`ALTER TABLE game_players ALTER COLUMN user_id TYPE BIGINT`);
        await pool.query(`ALTER TABLE multiplayer_games ALTER COLUMN winner_id TYPE BIGINT`);
        console.log('✅ Database migrations completed');
    } catch (error) { console.error('Migration error:', error.message); }
}
initializeDatabase();
migrateDatabase();
