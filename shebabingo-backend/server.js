// ==================== IMPORTS ====================
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const cors = require('cors');

// Create Express app
const app = express();
// Create HTTP server
const server = http.createServer(app);
// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== CONFIGURATION ====================
const BOT_TOKEN = process.env.BOT_TOKEN || '8238998135:AAG7bwL1rkiMHyDhn8FwitM2a6OsoSYqJK8';
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
// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is NOT set!');
    console.error('📌 Please add it in Render dashboard: https://dashboard.render.com');
    console.log('⚠️ Running without PostgreSQL database (using file storage only)');
}

// Create connection pool with better settings
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL ? {
        rejectUnauthorized: false  // CRITICAL for Render PostgreSQL
    } : undefined,
    connectionTimeoutMillis: 10000,  // 10 seconds timeout
    idleTimeoutMillis: 30000,
    max: 20
});

// Add connection error handler
pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err.message);
});

// Test database connection with async/await
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
        console.error('🔍 DATABASE_URL format should be: postgresql://user:password@host:port/database');
        console.error('📌 Make sure your DATABASE_URL is set correctly in Render dashboard');
        console.log('⚠️ Continuing with file-based storage only...');
        return false;
    }
}

// Run the test
testDatabaseConnection();

// Keep database alive (prevents free tier from sleeping)
if (DATABASE_URL) {
    setInterval(async () => {
        try {
            await pool.query('SELECT 1');
            console.log('💤 Database keep-alive ping');
        } catch (err) {
            console.error('Keep-alive failed:', err.message);
        }
    }, 60000); // Ping every 60 seconds
}

// ==================== FILE-BASED STORAGE (BACKUP) ====================
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

// Load multiplayer games
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

// Save multiplayer games
function saveActiveMultiplayerGames() {
    try {
        fs.writeFileSync(ACTIVE_MULTIPLAYER_FILE, JSON.stringify(activeMultiplayerGames, null, 2));
        console.log('✅ Multiplayer games saved');
    } catch (error) {
        console.error('Error saving multiplayer games:', error.message);
    }
}

// ==================== GAME CONFIGURATION ====================
const GAME_CONFIG = {
    BOARD_PRICE: 10,
    PRIZE_POOL_PERCENT: 80,
    MAX_CALLS: 45,
    CALL_INTERVAL: 5000,           // 5 seconds between numbers
    SELECTION_TIME: 25,            // 25 seconds board selection (NOT 2 minutes!)
    SHUFFLE_TIME: 5,              // 5 seconds shuffling countdown
    GAME_DURATION: 300000,         // 5 minutes active game
    RESULTS_TIME: 30,              // 30 seconds results
    NEXT_GAME_DELAY: 5000,         // 5 seconds between games
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 999,
    MAX_BOARDS_PER_PLAYER: 3,
    TOTAL_BOARDS: 400
};

// ==================== WEBSOCKET FOR REAL-TIME ====================
const wss = new WebSocket.Server({
    server,    
    path: '/game-ws',             // ✅ REQUIRED (DO NOT use noServer)
    clientTracking: true,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
    }
});

// ==================== WEBSOCKET HEARTBEAT ====================
const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            console.log(`💔 Closing dead WebSocket for user ${ws.userId}`);
            return ws.terminate();
        }

        ws.isAlive = false;
        try {
            ws.ping();
        } catch (err) {
            console.error('Ping error:', err.message);
        }
    });
}, 30000);

// ==================== GAME CONNECTIONS ====================
const gameConnections = new Map();

// ==================== CONNECTION HANDLER ====================
wss.on('connection', (ws, request) => {
    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // Parse query parameters
    const query = request.url.split('?')[1] || '';
    const params = new URLSearchParams(query);

    const gameId = params.get('gameId');
    const userId = params.get('userId');

    // Validate connection
    if (!gameId || !userId) {
        console.error('❌ WebSocket rejected: Missing gameId or userId');
        ws.close(1008, 'Missing parameters');
        return;
    }

    // Attach metadata
    ws.gameId = gameId;
    ws.userId = userId;

    // Store connection by game
    if (!gameConnections.has(gameId)) {
        gameConnections.set(gameId, new Set());
    }
    gameConnections.get(gameId).add(ws);

    console.log(`🔗 User ${userId} connected to game ${gameId}`);

    // Send initial game state
    getGameState(gameId, userId)
        .then(gameState => {
            if (gameState && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'game_state',
                    data: gameState
                }));
            }
        })
        .catch(err => {
            console.error('Game state error:', err.message);
        });

    // ==================== MESSAGE HANDLER ====================
    ws.on('message', async (message) => {
        try {
            await handleGameMessage(ws, message);
        } catch (err) {
            console.error('Message handling error:', err.message);
        }
    });

    // ==================== DISCONNECT CLEANUP ====================
    ws.on('close', () => {
        const connections = gameConnections.get(gameId);
        if (connections) {
            connections.delete(ws);
            if (connections.size === 0) {
                gameConnections.delete(gameId);
            }
        }

        console.log(`🔌 User ${userId} disconnected from game ${gameId}`);

        broadcastToGame(gameId, {
            type: 'players_update',
            count: connections ? connections.size : 0
        });
    });

    ws.on('error', (err) => {
        console.error(`WebSocket error (${userId}):`, err.message);
    });
});

// ==================== GAME MESSAGE HANDLER ====================
async function handleGameMessage(ws, message) {
    const data = JSON.parse(message);
    const { gameId, userId } = ws;

    switch (data.type) {

        // In your WebSocket message handler
case 'mark_number':
    const marked = await markPlayerNumber(gameId, userId, data.number);
    if (marked) {
        // Broadcast to all players in the game
        broadcastToGame(gameId, {
            type: 'number_marked',
            userId: userId,
            number: data.number,
            username: user.username
        });
        
        // Send confirmation back to the player
        ws.send(JSON.stringify({
            type: 'mark_success',
            number: data.number,
            marked: true
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'mark_failed',
            number: data.number,
            error: 'Number already marked or invalid'
        }));
    }
    break;

        case 'claim_bingo':
            const valid = await checkBingo(gameId, userId);
            if (valid) {
                const result = await declareWinner(gameId, userId);
                if (result.success) {
                    broadcastToGame(gameId, {
                        type: 'winner',
                        userId,
                        prize: result.prize
                    });
                }
            }
            break;

        case 'chat_message':
            broadcastToGame(gameId, {
                type: 'chat',
                userId,
                message: data.message,
                timestamp: new Date().toISOString()
            });
            break;

        case 'get_state':
            const state = await getGameState(gameId, userId);
            if (state && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'game_state',
                    data: state
                }));
            }
            break;

        case 'ping':
            ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
            break;
    }
}

// ==================== BROADCAST HELPER ====================
function broadcastToGame(gameId, payload) {
    const connections = gameConnections.get(gameId);
    if (!connections) return;

    const message = JSON.stringify(payload);

    connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
}

// Add these variables near the top of your server.js
const gameIntervals = {};
const gameTimers = {};


// ==================== DATABASE FUNCTIONS ====================
async function getNextGameNumber() {
    try {
        const result = await pool.query(
            "SELECT COALESCE(MAX(game_number), 0) + 1 as next_number FROM multiplayer_games WHERE DATE(created_at) = CURRENT_DATE"
        );
        return result.rows[0].next_number;
    } catch (error) {
        console.error('Error getting next game number:', error);
        return 1;
    }
}

async function createMultiplayerGame() {
    // ✅ RATE LIMITING REMOVED - Games can be created freely for 24/7 play
    
    // Generate unique game ID and number
    const gameId = 'GAME_' + Date.now().toString(36);
    const gameNumber = await getNextGameNumber();
    const now = new Date();
    const selectionEndTime = new Date(now.getTime() + (GAME_CONFIG.SELECTION_TIME * 1000));
    
    try {
        // ✅ 1. Insert into PostgreSQL database
        await pool.query(
            `INSERT INTO multiplayer_games (id, game_number, status, selection_end_time) 
             VALUES ($1, $2, $3, $4)`,
            [gameId, gameNumber, 'selecting', selectionEndTime.toISOString()]
        );
        
        // ✅ 2. Store in activeMultiplayerGames (in-memory for fast access)
        activeMultiplayerGames[gameId] = {
            id: gameId,
            gameNumber: gameNumber,
            status: 'selecting',
            players: {},
            calledNumbers: [],
            prizePool: 0,
            createdAt: now.toISOString(),
            selectionEndTime: selectionEndTime.toISOString(),
            startTime: null,
            endTime: null,
            currentCall: null,
            winners: []
        };
        
        // ✅ 3. Save to file for persistence
        saveActiveMultiplayerGames();
        
        console.log(`🆕 Multiplayer Game #${gameNumber} created (ID: ${gameId})`);
        console.log(`⏰ Selection ends at: ${selectionEndTime.toLocaleTimeString()}`);
        
        // ✅ 4. Schedule game start check
        setTimeout(async () => {
            try {
                console.log(`🔍 Checking game ${gameId} to start...`);
                await checkAndStartGame(gameId);
            } catch (error) {
                console.error(`❌ Error in scheduled game check for ${gameId}:`, error.message);
                // Cancel game if check fails
                await cancelGame(gameId);
            }
        }, GAME_CONFIG.SELECTION_TIME * 1000);
        
        return { success: true, gameId, gameNumber };
        
    } catch (error) {
        console.error('❌ Error creating multiplayer game:', error);
        return { success: false, error: error.message };
    }
}


async function checkAndStartGame(gameId) {
    try {
        console.log(`🔍 Checking game ${gameId} for starting...`);
        
        // First verify game still exists and is in selecting status
        const gameCheck = await pool.query(
            `SELECT status FROM multiplayer_games WHERE id = $1`,
            [gameId]
        );
        
        if (gameCheck.rows.length === 0) {
            console.log(`❌ Game ${gameId} not found, skipping`);
            return;
        }
        
        if (gameCheck.rows[0].status !== 'selecting') {
            console.log(`⚠️ Game ${gameId} is already ${gameCheck.rows[0].status}, skipping`);
            return;
        }
        
        // Get player count
        const playerCount = await getPlayerCount(gameId);
        console.log(`📊 Game ${gameId} has ${playerCount} players, minimum: ${GAME_CONFIG.MIN_PLAYERS}`);
        
        // ✅ Always start game if there's at least 1 player (or 2, your choice)
        if (playerCount >= GAME_CONFIG.MIN_PLAYERS) {
            console.log(`✅ Game ${gameId} meets minimum players (${playerCount} >= ${GAME_CONFIG.MIN_PLAYERS})`);
            console.log(`🎮 STARTING Game ${gameId} with ${playerCount} players`);
            await startGamePlay(gameId);
        } else {
            // ✅ If not enough players, cancel and refund
            console.log(`❌ Game ${gameId} cancelled - only ${playerCount} players (need ${GAME_CONFIG.MIN_PLAYERS})`);
            await cancelGame(gameId);
            
            // ✅ Create new game immediately after cancellation
            setTimeout(() => {
                createMultiplayerGame();
            }, 2000);
        }
    } catch (error) {
        console.error('❌ Error checking game:', error.message);
        // Try to cancel the game on error
        try {
            await cancelGame(gameId);
        } catch (cancelError) {
            console.error('Failed to cancel game:', cancelError.message);
        }
    }
}

async function joinMultiplayerGame(gameId, userId, boardCount, boardNumbers) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        // ✅ ADD THIS LINE: Convert to string for file storage
        const userIdStr = userId.toString();
        
        // 1. Check user exists and has balance
        const user = users[userIdStr];  // ← Use userIdStr
        if (!user) {
            throw new Error('User not found. Please register first.');
        }
        
        const totalCost = boardCount * GAME_CONFIG.BOARD_PRICE;
        if (user.balance < totalCost) {
            throw new Error(`Insufficient balance. Need ${totalCost} ETB, have ${user.balance} ETB`);
        }
        
        // 2. Generate unique boards
        const playerBoards = [];
        const availableNumbers = await getAvailableBoardNumbers(gameId);
        
        for (let i = 0; i < boardCount; i++) {
            let boardNumber;
            if (boardNumbers[i] && !availableNumbers.includes(boardNumbers[i])) {
                boardNumber = boardNumbers[i];
            } else {
                // Get random available number
                boardNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
            }
            
            playerBoards.push({
                boardNumber: boardNumber,
                boardData: generateBingoBoard(),
                markedNumbers: [],
                hasBingo: false,
                boardId: `B${i + 1}`
            });
            
            // Remove used number
            const index = availableNumbers.indexOf(boardNumber);
            if (index > -1) availableNumbers.splice(index, 1);
        }
        
        // 3. Add player to game in database
        await client.query(
            `INSERT INTO game_players (game_id, user_id, boards, marked_numbers)
             VALUES ($1, $2, $3, $4)`,
           [gameId, parseInt(userIdStr), JSON.stringify(playerBoards), '[]']  // ← Convert to number for DB
        );
        
        // 4. Deduct balance from user
        user.balance -= totalCost;
        user.totalWagered = (user.totalWagered || 0) + totalCost;
        saveUsers();
        
        // 5. Update prize pool in database
        const prizeContribution = totalCost * (GAME_CONFIG.PRIZE_POOL_PERCENT / 100);
        await client.query(
            `UPDATE multiplayer_games 
             SET prize_pool = prize_pool + $1
             WHERE id = $2`,
            [prizeContribution, gameId]
        );
        
        // ✅ 6. UPDATE activeMultiplayerGames (in-memory storage)
        if (activeMultiplayerGames[gameId]) {
            // Add player to in-memory game
            activeMultiplayerGames[gameId].players[userIdStr] = {  // ← Use userIdStr
                id: userId,
                username: user.username,
                boards: playerBoards,
                markedNumbers: [],
                hasBingo: false,
                totalBet: totalCost,
                joinedAt: new Date().toISOString()
            };
            
            // Update prize pool in memory
            activeMultiplayerGames[gameId].prizePool += prizeContribution;
            
            // Save to file
            saveActiveMultiplayerGames();
        } else {
            // Create in-memory game if it doesn't exist (fallback)
            console.log(`⚠️ Game ${gameId} not in memory, creating from database`);
            const dbGame = await client.query(
                `SELECT * FROM multiplayer_games WHERE id = $1`,
                [gameId]
            );
            
            if (dbGame.rows.length > 0) {
                activeMultiplayerGames[gameId] = {
                    id: dbGame.rows[0].id,
                    gameNumber: dbGame.rows[0].game_number,
                    status: dbGame.rows[0].status,
                    players: {},
                    calledNumbers: dbGame.rows[0].called_numbers || [],
                    prizePool: dbGame.rows[0].prize_pool || 0,
                    selectionEndTime: dbGame.rows[0].selection_end_time,
                    startTime: dbGame.rows[0].start_time,
                    endTime: dbGame.rows[0].end_time,
                    currentCall: dbGame.rows[0].current_call,
                    winners: []
                };
                
                // Add player to newly created in-memory game
                activeMultiplayerGames[gameId].players[userId] = {
                    id: userId,
                    username: user.username,
                    boards: playerBoards,
                    markedNumbers: [],
                    hasBingo: false,
                    totalBet: totalCost,
                    joinedAt: new Date().toISOString()
                };
                
                saveActiveMultiplayerGames();
            }
        }
        
        // 7. Get current player count
        const playerCountResult = await client.query(
            `SELECT COUNT(*) FROM game_players WHERE game_id = $1`,
            [gameId]
        );
        const playerCount = parseInt(playerCountResult.rows[0].count);
        
        // 8. Update game status based on player count
        if (playerCount >= GAME_CONFIG.MIN_PLAYERS) {
            // Check if game is still in waiting/selecting phase
            const gameResult = await client.query(
                `SELECT status FROM multiplayer_games WHERE id = $1`,
                [gameId]
            );
            
            if (gameResult.rows[0].status === 'waiting' || gameResult.rows[0].status === 'selecting') {
                // Start the game countdown
                await client.query(
                    `UPDATE multiplayer_games 
                     SET status = 'shuffling', 
                         start_time = NOW(),
                         end_time = NOW() + INTERVAL '${GAME_CONFIG.GAME_DURATION/1000} seconds'
                     WHERE id = $1`,
                    [gameId]
                );
                
                // ✅ Update in-memory status
                if (activeMultiplayerGames[gameId]) {
                    activeMultiplayerGames[gameId].status = 'shuffling';
                    activeMultiplayerGames[gameId].startTime = new Date().toISOString();
                    activeMultiplayerGames[gameId].endTime = new Date(Date.now() + GAME_CONFIG.GAME_DURATION).toISOString();
                    saveActiveMultiplayerGames();
                }
                
                // Trigger game start
                setTimeout(() => {
                    startGamePlay(gameId);
                }, 5000); // 5 seconds shuffling
            }
        }
        
        // 9. Record in file-based games
        const gameRecordId = 'game_' + Date.now();
        games.push({
            id: gameRecordId,
            userId: userIdStr,  // ← Use userIdStr
            amount: totalCost,
            date: new Date().toISOString(),
            type: 'join',
            gameId: gameId,
            boardCount: boardCount
        });
        saveGames();
        
        await client.query('COMMIT');
        
        // 10. Broadcast player joined via WebSocket
        broadcastToGame(gameId, {
            type: 'player_joined',
            userId: userIdStr,  // ← Use userIdStr
            username: user.username,
            playerCount: playerCount
        });
        
        console.log(`🎮 User ${user.username} joined game ${gameId} with ${boardCount} boards`);
        
        // Get updated prize pool
        const prizePool = activeMultiplayerGames[gameId]?.prizePool || await getGamePrizePool(gameId);
        
        return {
            success: true,
            gameId: gameId,
            boards: playerBoards,
            prizePool: prizePool,
            playerCount: playerCount,
            selectionTimeLeft: activeMultiplayerGames[gameId]?.selectionEndTime 
                ? Math.max(0, Math.floor((new Date(activeMultiplayerGames[gameId].selectionEndTime) - new Date()) / 1000))
                : GAME_CONFIG.SELECTION_TIME
        };
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error joining multiplayer game:', error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}


// Get available board numbers for a game
async function getAvailableBoardNumbers(gameId) {
    try {
        const result = await pool.query(
            `SELECT boards FROM game_players WHERE game_id = $1`,
            [gameId]
        );
        
        const usedNumbers = new Set();
        result.rows.forEach(row => {
            const boards = JSON.parse(row.boards);
            boards.forEach(board => {
                usedNumbers.add(board.boardNumber);
            });
        });
        
        const available = [];
        for (let i = 1; i <= GAME_CONFIG.TOTAL_BOARDS; i++) {
            if (!usedNumbers.has(i)) {
                available.push(i);
            }
        }
        
        return available;
    } catch (error) {
        console.error('Error getting available board numbers:', error);
        // Fallback: return all numbers
        const available = [];
        for (let i = 1; i <= GAME_CONFIG.TOTAL_BOARDS; i++) {
            available.push(i);
        }
        return available;
    }
}

async function getGameState(gameId, userId) {
    try {
        // Get game info
        const gameResult = await pool.query(
            `SELECT * FROM multiplayer_games WHERE id = $1`,
            [gameId]
        );
        
        if (gameResult.rows.length === 0) {
            return null;
        }
        
        const game = gameResult.rows[0];
        
        // Get player info for this specific user
        const playerResult = await pool.query(
            `SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2`,
            [gameId, userId]
        );
        
        // Get all players in this game (using file-based users since you don't have users table)
        const allPlayersResult = await pool.query(
            `SELECT gp.user_id, gp.boards 
             FROM game_players gp
             WHERE gp.game_id = $1`,
            [gameId]
        );
        
        // Build player list with usernames from your file-based users object
        const playersWithUsernames = allPlayersResult.rows.map(row => ({
            userId: row.user_id,
            username: users[row.user_id]?.username || `Player ${row.user_id}`,
            boardCount: JSON.parse(row.boards).length
        }));
        
        return {
            game: {
                id: game.id,
                gameNumber: game.game_number,
                status: game.status,
                prizePool: parseFloat(game.prize_pool) || 0,
                calledNumbers: game.called_numbers ? JSON.parse(game.called_numbers) : [],
                currentCall: game.current_call,
                startTime: game.start_time,
                endTime: game.end_time,
                selectionEndTime: game.selection_end_time,
                playerCount: playersWithUsernames.length
            },
            player: playerResult.rows.length > 0 ? {
                boards: JSON.parse(playerResult.rows[0].boards),
                markedNumbers: playerResult.rows[0].marked_numbers ? JSON.parse(playerResult.rows[0].marked_numbers) : [],
                hasBingo: playerResult.rows[0].has_bingo
            } : null,
            players: playersWithUsernames
        };
        
    } catch (error) {
        console.error('Error getting game state:', error);
        return null;
    }
}

async function getPlayerCount(gameId) {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM game_players WHERE game_id = $1`,
            [gameId]
        );
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error('Error getting player count:', error);
        return 0;
    }
}

async function getGamePrizePool(gameId) {
    try {
        const result = await pool.query(
            `SELECT prize_pool FROM multiplayer_games WHERE id = $1`,
            [gameId]
        );
        return parseFloat(result.rows[0]?.prize_pool) || 0;
    } catch (error) {
        console.error('Error getting prize pool:', error);
        return 0;
    }
}

async function markPlayerNumber(gameId, userId, number) {
    try {
        // 1. Update in-memory storage (activeMultiplayerGames)
        if (activeMultiplayerGames[gameId] && activeMultiplayerGames[gameId].players[userId]) {
            const player = activeMultiplayerGames[gameId].players[userId];
            
            // Check if number is already marked
            if (!player.markedNumbers.includes(number)) {
                player.markedNumbers.push(number);
                
                // Also check if this number exists on any board (optional)
                let found = false;
                for (const board of player.boards) {
                    for (let row = 0; row < 5; row++) {
                        for (let col = 0; col < 5; col++) {
                            if (board.boardData[row][col] === number) {
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }
                    if (found) break;
                }
                
                if (found) {
                    console.log(`✅ Marked number ${number} for user ${userId} in game ${gameId}`);
                }
                
                // Save to file
                saveActiveMultiplayerGames();
            } else {
                console.log(`⚠️ Number ${number} already marked for user ${userId}`);
                return false;
            }
        }
        
        // 2. Update database
        const playerResult = await pool.query(
            `SELECT marked_numbers FROM game_players WHERE game_id = $1 AND user_id = $2`,
            [gameId, userId]
        );
        
        if (playerResult.rows.length === 0) return false;
        
        let markedNumbers = playerResult.rows[0].marked_numbers ? 
            JSON.parse(playerResult.rows[0].marked_numbers) : [];
        
        if (!markedNumbers.includes(number)) {
            markedNumbers.push(number);
            await pool.query(
                `UPDATE game_players SET marked_numbers = $1 WHERE game_id = $2 AND user_id = $3`,
                [JSON.stringify(markedNumbers), gameId, userId]
            );
            
            console.log(`✅ Database updated: marked ${number} for user ${userId}`);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error marking number:', error);
        return false;
    }
}

async function checkBingo(gameId, userId) {
    try {
        const gameResult = await pool.query(
            `SELECT called_numbers FROM multiplayer_games WHERE id = $1`,
            [gameId]
        );
        
        const playerResult = await pool.query(
            `SELECT boards, marked_numbers FROM game_players WHERE game_id = $1 AND user_id = $2 AND has_bingo = false`,
            [gameId, userId]
        );
        
        if (gameResult.rows.length === 0 || playerResult.rows.length === 0) {
            return false;
        }
        
        const calledNumbers = gameResult.rows[0].called_numbers ? 
            JSON.parse(gameResult.rows[0].called_numbers) : [];
        const playerBoards = JSON.parse(playerResult.rows[0].boards);
        const markedNumbers = playerResult.rows[0].marked_numbers ? 
            JSON.parse(playerResult.rows[0].marked_numbers) : [];
        
        // Check each board for BINGO
        for (const board of playerBoards) {
            if (checkBoardForBingo(board.boardData, markedNumbers, calledNumbers)) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking BINGO:', error);
        return false;
    }
}

async function declareWinner(gameId, userId) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // 1. Get game and user info
        const gameResult = await client.query(
            `SELECT prize_pool FROM multiplayer_games WHERE id = $1 AND status = 'active'`,
            [gameId]
        );
        
        if (gameResult.rows.length === 0) {
            throw new Error('Game not found or not active');
        }
        
        const user = users[userId];
        if (!user) throw new Error('User not found');
        
        const prize = parseFloat(gameResult.rows[0]?.prize_pool) || 0;
        
        // 2. Award prize to user
        user.balance += prize;
        user.totalWon = (user.totalWon || 0) + prize;
        saveUsers();
        
        // 3. Update game status
        await client.query(
            `UPDATE multiplayer_games 
             SET status = 'completed', winner_id = $1, end_time = $2
             WHERE id = $3`,
            [userId, new Date().toISOString(), gameId]
        );
        
        // 4. Mark player as winner
        await client.query(
            `UPDATE game_players SET has_bingo = true WHERE game_id = $1 AND user_id = $2`,
            [gameId, userId]
        );
        
        await client.query('COMMIT');
        
        // 5. Notify via Telegram
        if (user.chatId) {
            await sendTelegramMessage(user.chatId,
                `🎊 *CONGRATULATIONS! YOU WON!*\n\n` +
                `🏆 You got BINGO!\n` +
                `💰 Prize: ${prize.toFixed(1)} ETB added to your balance!\n` +
                `📊 New Balance: ${user.balance.toFixed(1)} ETB\n\n` +
                `🎮 Play again to win more!`
            );
        }
        
        // 6. Record win in file-based games
        games.push({
            id: 'win_' + Date.now(),
            userId: userId,
            amount: prize,
            date: new Date().toISOString(),
            type: 'win',
            gameId: gameId
        });
        saveGames();
        
        console.log(`🏆 User ${user.username} won ${prize} ETB in game ${gameId}`);
        
        return { success: true, prize: prize };
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error declaring winner:', error);
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}

// ==================== GAME LOGIC FUNCTIONS ====================

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Get unique random number
function getUniqueNumber(existing, min, max) {
    let num;
    do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (existing.includes(num));
    return num;
}

// Generate a Bingo board (5x5 array format, matching frontend)
function generateBingoBoard() {
    // Create arrays for each letter (B, I, N, G, O)
    const B = shuffleArray([...Array(15).keys()].map(i => i + 1)).slice(0, 5).sort((a, b) => a - b);
    const I = shuffleArray([...Array(15).keys()].map(i => i + 16)).slice(0, 5).sort((a, b) => a - b);
    const N = shuffleArray([...Array(15).keys()].map(i => i + 31)).slice(0, 4).sort((a, b) => a - b);
    const G = shuffleArray([...Array(15).keys()].map(i => i + 46)).slice(0, 5).sort((a, b) => a - b);
    const O = shuffleArray([...Array(15).keys()].map(i => i + 61)).slice(0, 5).sort((a, b) => a - b);
    
    const board = [];
    let nIndex = 0;
    
    for (let row = 0; row < 5; row++) {
        const rowData = [
            B[row],
            I[row],
            row === 2 ? 'FREE' : N[nIndex++],
            G[row],
            O[row]
        ];
        board.push(rowData);
    }
    
    return board;
}

// Check if a board has BINGO (5x5 array format)
function checkBoardForBingo(boardData, markedNumbers, calledNumbers) {
    // Convert called numbers from format like "B5" to just numbers
    const calledNums = calledNumbers.map(cn => {
        const match = cn.match(/\d+/);
        return match ? parseInt(match[0]) : cn;
    });
    
    // Check rows
    for (let row = 0; row < 5; row++) {
        let rowComplete = true;
        for (let col = 0; col < 5; col++) {
            const cell = boardData[row][col];
            if (cell !== 'FREE' && !markedNumbers.includes(cell) && !calledNums.includes(cell)) {
                rowComplete = false;
                break;
            }
        }
        if (rowComplete) return true;
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
        let colComplete = true;
        for (let row = 0; row < 5; row++) {
            const cell = boardData[row][col];
            if (cell !== 'FREE' && !markedNumbers.includes(cell) && !calledNums.includes(cell)) {
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
        const cell1 = boardData[i][i];
        if (cell1 !== 'FREE' && !markedNumbers.includes(cell1) && !calledNums.includes(cell1)) {
            diag1Complete = false;
        }
        const cell2 = boardData[i][4 - i];
        if (cell2 !== 'FREE' && !markedNumbers.includes(cell2) && !calledNums.includes(cell2)) {
            diag2Complete = false;
        }
    }
    
    return diag1Complete || diag2Complete;
}

// Alternative: Check board using marked numbers (for player marking)
function checkBoardWithMarked(boardData, markedNumbers) {
    // Check rows
    for (let row = 0; row < 5; row++) {
        let rowComplete = true;
        for (let col = 0; col < 5; col++) {
            const cell = boardData[row][col];
            if (cell !== 'FREE' && !markedNumbers.includes(cell)) {
                rowComplete = false;
                break;
            }
        }
        if (rowComplete) return true;
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
        let colComplete = true;
        for (let row = 0; row < 5; row++) {
            const cell = boardData[row][col];
            if (cell !== 'FREE' && !markedNumbers.includes(cell)) {
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
        const cell1 = boardData[i][i];
        if (cell1 !== 'FREE' && !markedNumbers.includes(cell1)) {
            diag1Complete = false;
        }
        const cell2 = boardData[i][4 - i];
        if (cell2 !== 'FREE' && !markedNumbers.includes(cell2)) {
            diag2Complete = false;
        }
    }
    
    return diag1Complete || diag2Complete;
}
// ==================== GAME CYCLE MANAGEMENT ====================
async function startGameCycle() {
    console.log('🔄 Starting OPTIMIZED 24/7 game cycle...');
    
    // Clear any existing intervals first (prevent duplicates)
    if (global.gameCycleInterval) {
        clearInterval(global.gameCycleInterval);
        console.log('🧹 Cleared previous game cycle interval');
    }
    
    // Clean up any old games first
    await cleanupOldGames();
    
    // Create first game immediately
    await createMultiplayerGame();
    console.log('🆕 First game created');
    
    // Check for games every 30 seconds (NOT 10 seconds!)
    global.gameCycleInterval = setInterval(async () => {
        try {
            console.log('🔄 Game cycle check running...');
            
            // 1. First, clean up completed/cancelled games
            await cleanupOldGames();
            
            // 2. Count how many selection games are active (last 5 minutes only)
            const selectingGames = await pool.query(`
                SELECT COUNT(*) as count FROM multiplayer_games 
                WHERE status = 'selecting'
                AND created_at > NOW() - INTERVAL '5 minutes'
                AND selection_end_time > NOW() + INTERVAL '5 seconds'  -- At least 5 seconds left
            `);
            
            const selectingCount = parseInt(selectingGames.rows[0].count);
            console.log(`📊 Currently ${selectingCount} game(s) in selection phase`);
            
            // 3. Only create new game if we have FEWER than 2 selection games
            if (selectingCount < 2) {
                console.log(`📝 Need more games, creating new one...`);
                await createMultiplayerGame();
            }
            
            // 4. Check for games that need to start
            const gamesToStart = await pool.query(`
                SELECT * FROM multiplayer_games 
                WHERE status = 'selecting' 
                AND selection_end_time <= NOW()
                AND status != 'cancelled'
                LIMIT 2
            `);
            
            for (const game of gamesToStart.rows) {
                console.log(`⏰ Game ${game.id} selection time ended, checking players...`);
                await checkAndStartGame(game.id);
            }
            
        } catch (error) {
            console.error('❌ Error in game cycle:', error.message);
        }
    }, 30000); // Check every 30 seconds (NOT 10!)
}

// Add this cleanup function (place it right after startGameCycle)
async function cleanupOldGames() {
    try {
        // Clean up games older than 10 minutes (except active ones)
        const result = await pool.query(`
            DELETE FROM multiplayer_games 
            WHERE created_at < NOW() - INTERVAL '10 minutes'
            AND status IN ('cancelled', 'completed')
            RETURNING id
        `);
        
        if (result.rows.length > 0) {
            console.log(`🧹 Cleaned up ${result.rows.length} old games`);
        }
        
        // Also clean up any selecting games with 0 players for a while
        const zeroPlayerGames = await pool.query(`
            DELETE FROM multiplayer_games 
            WHERE status = 'selecting'
            AND created_at < NOW() - INTERVAL '2 minutes'
            AND id NOT IN (
                SELECT DISTINCT game_id FROM game_players
            )
            RETURNING id
        `);
        
        if (zeroPlayerGames.rows.length > 0) {
            console.log(`🧹 Cleaned up ${zeroPlayerGames.rows.length} empty games with no players`);
        }
    } catch (error) {
        console.error('Error cleaning up old games:', error.message);
    }
}

async function startGamePlay(gameId) {
    try {
        console.log(`🚀 Starting game play for ${gameId}`);
        
        // 1. SHUFFLING PHASE (30 seconds countdown)
        await pool.query(
            `UPDATE multiplayer_games 
             SET status = 'shuffling', start_time = $1
             WHERE id = $2`,
            [new Date().toISOString(), gameId]
        );
        
        broadcastToGame(gameId, {
            type: 'game_status',
            status: 'shuffling',
            message: '🎮 GAME STARTING! Shuffling numbers...',
            countdown: GAME_CONFIG.SHUFFLE_TIME
        });
        
        console.log(`🔢 Game ${gameId}: 30-second shuffle countdown started`);
        
        // Send countdown updates every second
        let shuffleCount = GAME_CONFIG.SHUFFLE_TIME;
        const shuffleInterval = setInterval(() => {
            shuffleCount--;
            broadcastToGame(gameId, {
                type: 'countdown',
                status: 'shuffling',
                seconds: shuffleCount,
                message: `Starting in ${shuffleCount} seconds...`
            });
            
            if (shuffleCount <= 0) {
                clearInterval(shuffleInterval);
            }
        }, 1000);
        
        // Wait for shuffle time
        setTimeout(async () => {
            clearInterval(shuffleInterval);
            
            // 2. ACTIVE PHASE
            const gameEndTime = new Date(Date.now() + GAME_CONFIG.GAME_DURATION);
            await pool.query(
                `UPDATE multiplayer_games 
                 SET status = 'active', end_time = $1, called_numbers = '[]'
                 WHERE id = $2`,
                [gameEndTime.toISOString(), gameId]
            );
            
            broadcastToGame(gameId, {
                type: 'game_status',
                status: 'active',
                message: '🎮 GAME ACTIVE! Numbers will be called every 5 seconds! 🍀',
                gameDuration: GAME_CONFIG.GAME_DURATION,
                endTime: gameEndTime.toISOString()
            });
            
            console.log(`🎮 Game ${gameId} now ACTIVE for 5 minutes (until ${gameEndTime.toLocaleTimeString()})`);
            
            // 3. Start calling numbers every 5 seconds
            callGameNumbers(gameId);
            
            // 4. Auto-end timer exactly after 5 minutes
            setTimeout(async () => {
                const gameResult = await pool.query(
                    `SELECT status, winner_id FROM multiplayer_games WHERE id = $1`,
                    [gameId]
                );
                
                const game = gameResult.rows[0];
                if (game.status === 'active' && !game.winner_id) {
                    console.log(`⏰ Game ${gameId} completed 5 minutes with no winner`);
                    await endGameNoWinner(gameId);
                }
            }, GAME_CONFIG.GAME_DURATION);
            
            // 5. Send game timer updates
            let minutesLeft = 4;
            let secondsLeft = 59;
            const gameTimer = setInterval(() => {
                secondsLeft--;
                if (secondsLeft < 0) {
                    minutesLeft--;
                    secondsLeft = 59;
                }
                
                if (minutesLeft >= 0) {
                    broadcastToGame(gameId, {
                        type: 'game_timer',
                        minutes: minutesLeft,
                        seconds: secondsLeft,
                        message: `Time remaining: ${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`
                    });
                }
                
                if (minutesLeft <= 0 && secondsLeft <= 0) {
                    clearInterval(gameTimer);
                }
            }, 1000);
            
            // Store for cleanup
            gameIntervals[gameId] = gameTimer;
            
        }, GAME_CONFIG.SHUFFLE_TIME * 1000); // 30 seconds
        
    } catch (error) {
        console.error('❌ Error starting game play:', error);
    }
}

async function callGameNumbers(gameId) {
    try {
        // Get game status
        const gameResult = await pool.query(
            `SELECT called_numbers, status, winner_id FROM multiplayer_games WHERE id = $1`,
            [gameId]
        );
        
        if (gameResult.rows.length === 0) {
            console.log(`❌ Game ${gameId} not found, stopping number calls`);
            return;
        }
        
        const game = gameResult.rows[0];
        
        // Stop if game is no longer active or already has a winner
        if (game.status !== 'active') {
            console.log(`⏹️ Game ${gameId} is ${game.status}, stopping number calls`);
            return;
        }
        
        if (game.winner_id) {
            console.log(`🏆 Game ${gameId} already has a winner, stopping number calls`);
            return;
        }
        
        let calledNumbers = game.called_numbers ? JSON.parse(game.called_numbers) : [];
        
        // Check if we've called all numbers
        if (calledNumbers.length >= GAME_CONFIG.MAX_CALLS) {
            console.log(`🎯 Game ${gameId}: Called all ${GAME_CONFIG.MAX_CALLS} numbers`);
            
            // Check if there's a winner before ending
            const hasWinner = await checkForWinners(gameId);
            
            if (!hasWinner) {
                console.log(`⏰ No winner after ${GAME_CONFIG.MAX_CALLS} numbers, ending game`);
                await endGameNoWinner(gameId);
            }
            return;
        }
        
        // Generate new number
        const newNumber = generateUniqueNumber(calledNumbers);
        calledNumbers.push(newNumber);
        
        // Update database
        await pool.query(
            `UPDATE multiplayer_games 
             SET called_numbers = $1, current_call = $2, last_call_time = NOW()
             WHERE id = $3`,
            [JSON.stringify(calledNumbers), newNumber, gameId]
        );
        
        // Broadcast to all players
        broadcastToGame(gameId, {
            type: 'number_called',
            number: newNumber,
            calledNumbers: calledNumbers,
            numberIndex: calledNumbers.length,
            totalNumbers: GAME_CONFIG.MAX_CALLS,
            nextCallIn: GAME_CONFIG.CALL_INTERVAL / 1000
        });
        
        console.log(`🔔 Game ${gameId}: Called ${newNumber} (${calledNumbers.length}/${GAME_CONFIG.MAX_CALLS})`);
        
        // Check for winners AFTER calling the number
        const hasWinner = await checkForWinners(gameId);
        
        // If there's a winner, stop calling numbers
        if (hasWinner) {
            console.log(`🏆 Game ${gameId} has a winner! Stopping number calls.`);
            return;
        }
        
        // Schedule next call
        setTimeout(() => callGameNumbers(gameId), GAME_CONFIG.CALL_INTERVAL);
        
    } catch (error) {
        console.error('❌ Error calling game numbers:', error);
    }
}

// ==================== ENHANCED FUNCTIONS ====================

function generateUniqueNumber(calledNumbers) {
    // If all numbers are called, return null
    if (calledNumbers.length >= 75) {
        console.log('⚠️ All 75 numbers have been called!');
        return null;
    }
    
    const letters = ['B', 'I', 'N', 'G', 'O'];
    let attempts = 0;
    let newNumber = null;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts && !newNumber) {
        const letterIndex = Math.floor(Math.random() * 5);
        const letter = letters[letterIndex];
        
        let min, max;
        switch(letter) {
            case 'B': min = 1; max = 15; break;
            case 'I': min = 16; max = 30; break;
            case 'N': min = 31; max = 45; break;
            case 'G': min = 46; max = 60; break;
            case 'O': min = 61; max = 75; break;
        }
        
        const number = Math.floor(Math.random() * (max - min + 1)) + min;
        const candidate = letter + number;
        
        if (!calledNumbers.includes(candidate)) {
            newNumber = candidate;
            break;
        }
        attempts++;
    }
    
    // Fallback: find any unused number by scanning
    if (!newNumber) {
        for (const letter of letters) {
            let min, max;
            switch(letter) {
                case 'B': min = 1; max = 15; break;
                case 'I': min = 16; max = 30; break;
                case 'N': min = 31; max = 45; break;
                case 'G': min = 46; max = 60; break;
                case 'O': min = 61; max = 75; break;
            }
            for (let num = min; num <= max; num++) {
                const candidate = letter + num;
                if (!calledNumbers.includes(candidate)) {
                    newNumber = candidate;
                    break;
                }
            }
            if (newNumber) break;
        }
    }
    
    return newNumber;
}

async function checkForWinners(gameId) {
    try {
        // Get all players who haven't won yet
        const playersResult = await pool.query(
            `SELECT user_id, boards, marked_numbers, username 
             FROM game_players 
             WHERE game_id = $1 AND has_bingo = false`,
            [gameId]
        );
        
        if (playersResult.rows.length === 0) {
            return false;
        }
        
        // Get called numbers
        const gameResult = await pool.query(
            `SELECT called_numbers, prize_pool FROM multiplayer_games WHERE id = $1`,
            [gameId]
        );
        
        if (gameResult.rows.length === 0) return false;
        
        const calledNumbers = gameResult.rows[0].called_numbers ? 
            JSON.parse(gameResult.rows[0].called_numbers) : [];
        const prizePool = parseFloat(gameResult.rows[0].prize_pool) || 0;
        
        const winners = [];
        
        // Check each player for BINGO
        for (const player of playersResult.rows) {
            const boards = JSON.parse(player.boards);
            const markedNumbers = player.marked_numbers ? 
                JSON.parse(player.marked_numbers) : [];
            
            for (const board of boards) {
                if (checkBoardForBingo(board.boardData, markedNumbers, calledNumbers)) {
                    winners.push({
                        userId: player.user_id,
                        username: player.username,
                        boardNumber: board.boardNumber,
                        boardId: board.boardId
                    });
                    break; // Player only needs one winning board
                }
            }
        }
        
        if (winners.length > 0) {
            console.log(`🏆 Found ${winners.length} winner(s) in game ${gameId}`);
            await declareWinners(gameId, winners, prizePool);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error checking for winners:', error);
        return false;
    }
}

async function declareWinners(gameId, winners, prizePool) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Calculate prize per winner
        const prizePerWinner = Math.floor(prizePool / winners.length);
        
        // 1. Update database
        await client.query(
            `UPDATE multiplayer_games 
             SET status = 'completed', 
                 winner_id = $1,
                 winners = $2,
                 prize_distribution = $3,
                 end_time = NOW()
             WHERE id = $4`,
            [winners[0].userId, JSON.stringify(winners), JSON.stringify({ prizePerWinner, totalWinners: winners.length }), gameId]
        );
        
        // 2. Update in-memory storage (activeMultiplayerGames)
        if (activeMultiplayerGames[gameId]) {
            activeMultiplayerGames[gameId].status = 'completed';
            activeMultiplayerGames[gameId].winners = winners;
            activeMultiplayerGames[gameId].prizePerWinner = prizePerWinner;
            activeMultiplayerGames[gameId].endTime = new Date().toISOString();
            
            // Mark winners in player objects
            for (const winner of winners) {
                if (activeMultiplayerGames[gameId].players[winner.userId]) {
                    activeMultiplayerGames[gameId].players[winner.userId].hasBingo = true;
                    
                    // Mark the specific board as winner
                    for (const board of activeMultiplayerGames[gameId].players[winner.userId].boards) {
                        if (board.boardNumber === winner.boardNumber) {
                            board.hasBingo = true;
                            break;
                        }
                    }
                }
            }
            
            // Save to file
            saveActiveMultiplayerGames();
        }
        
        // 3. Award prizes to each winner
        for (const winner of winners) {
            const user = users[winner.userId];
            if (user) {
                const oldBalance = user.balance;
                user.balance += prizePerWinner;
                user.totalWon = (user.totalWon || 0) + prizePerWinner;
                
                console.log(`💰 ${user.username}: ${oldBalance} → ${user.balance} ETB (+${prizePerWinner})`);
                
                // Mark player as winner in database
                await client.query(
                    `UPDATE game_players SET has_bingo = true WHERE game_id = $1 AND user_id = $2`,
                    [gameId, winner.userId]
                );
                
                // Record win transaction
                const winId = 'win_' + Date.now();
                games.push({
                    id: winId,
                    userId: winner.userId,
                    amount: prizePerWinner,
                    date: new Date().toISOString(),
                    type: 'win',
                    gameId: gameId,
                    boardNumber: winner.boardNumber
                });
                saveGames();
                
                // Notify winner via Telegram
                if (user.chatId) {
                    const prizeMessage = winners.length > 1 ?
                        `🏆 You won ${prizePerWinner} ETB (shared prize with ${winners.length} winners!)` :
                        `🏆 You won ${prizePerWinner} ETB!`;
                    
                    await sendTelegramMessage(user.chatId,
                        `🎉 *BINGO! YOU WON!* 🎉\n\n` +
                        `${prizeMessage}\n` +
                        `🔢 Board: #${winner.boardNumber}\n` +
                        `💰 New Balance: *${user.balance} ETB*\n\n` +
                        `🎮 Play again to win more!`
                    );
                }
            }
        }
        
        await client.query('COMMIT');
        saveUsers();
        
        // 4. Broadcast winners to all players
        const winnerAnnouncement = winners.length > 1 ?
            `🎉 *${winners.length} WINNERS!*\n\n` +
            winners.map((w, i) => `${i+1}. ${w.username} - ${prizePerWinner} ETB`).join('\n') :
            `🎉 *WINNER: ${winners[0].username}*\n💰 Prize: ${prizePerWinner} ETB`;
        
        broadcastToGame(gameId, {
            type: 'game_completed',
            winners: winners,
            prizePerWinner: prizePerWinner,
            totalWinners: winners.length,
            message: winnerAnnouncement
        });
        
        console.log(`✅ Game ${gameId} completed. ${winners.length} winner(s) awarded ${prizePerWinner} ETB each.`);
        
        // 5. Clean up after 30 seconds
        setTimeout(() => {
            cleanupGame(gameId);
        }, 30000);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error declaring winners:', error);
    } finally {
        client.release();
    }
}

async function endGameNoWinner(gameId) {
    try {
        console.log(`⏰ Game ${gameId} ended with no winner`);
        
        // 1. Update database
        await pool.query(
            `UPDATE multiplayer_games 
             SET status = 'completed_no_winner', end_time = NOW()
             WHERE id = $1`,
            [gameId]
        );
        
        // 2. Update in-memory storage
        if (activeMultiplayerGames[gameId]) {
            activeMultiplayerGames[gameId].status = 'completed_no_winner';
            activeMultiplayerGames[gameId].endTime = new Date().toISOString();
            saveActiveMultiplayerGames();
        }
        
        // 3. Refund 80% of bets to players
        const playersResult = await pool.query(
            `SELECT user_id, boards FROM game_players WHERE game_id = $1`,
            [gameId]
        );
        
        const refundRate = 0.8;
        let totalRefund = 0;
        
        for (const player of playersResult.rows) {
            const boards = JSON.parse(player.boards);
            const betAmount = boards.length * GAME_CONFIG.BOARD_PRICE;
            const refundAmount = betAmount * refundRate;
            
            const user = users[player.user_id];
            if (user) {
                user.balance += refundAmount;
                totalRefund += refundAmount;
                
                console.log(`💰 Refunded ${refundAmount} ETB to ${user.username}`);
                
                // Notify user
                if (user.chatId) {
                    await sendTelegramMessage(user.chatId,
                        `🤷 *GAME ENDED - NO WINNER*\n\n` +
                        `⏰ Time limit reached with no BINGO.\n` +
                        `💰 80% Refund: *${refundAmount.toFixed(1)} ETB*\n` +
                        `📊 New Balance: *${user.balance.toFixed(1)} ETB*\n\n` +
                        `🎮 Join another game!`
                    );
                }
            }
        }
        
        saveUsers();
        
        // 4. Broadcast to remaining players
        broadcastToGame(gameId, {
            type: 'game_ended',
            message: `🤷 *GAME ENDED - NO WINNER*\n💰 80% refund issued to all players.`
        });
        
        // 5. Clean up connections
        cleanupGameConnections(gameId);
        
        console.log(`✅ Game ${gameId} ended. Total refund: ${totalRefund} ETB`);
        
    } catch (error) {
        console.error('Error ending game:', error);
    }
}

// Cancel a game (refund players)
async function cancelGame(gameId) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Get all players in this game
        const playersResult = await client.query(
            `SELECT user_id, boards FROM game_players WHERE game_id = $1`,
            [gameId]
        );
        
        // Refund each player
        let totalRefund = 0;
        for (const row of playersResult.rows) {
            const boards = JSON.parse(row.boards);
            const refundAmount = boards.length * GAME_CONFIG.BOARD_PRICE;
            totalRefund += refundAmount;
            
            const user = users[row.user_id];
            if (user) {
                user.balance += refundAmount;
                console.log(`💰 Refunded ${refundAmount} ETB to ${user.username}`);
                
                // Notify user via Telegram
                if (user.chatId) {
                    await sendTelegramMessage(user.chatId,
                        `🔄 *Game Cancelled*\n\n` +
                        `Not enough players joined.\n` +
                        `💰 Refund: *${refundAmount} ETB*\n` +
                        `📊 New Balance: *${user.balance} ETB*\n\n` +
                        `🎮 Next game starting now!`
                    );
                }
            }
        }
        
        // Update game status in database
        await client.query(
            `UPDATE multiplayer_games SET status = 'cancelled', end_time = NOW() WHERE id = $1`,
            [gameId]
        );
        
        await client.query('COMMIT');
        saveUsers();
        
        console.log(`✅ Game ${gameId} cancelled. Total refund: ${totalRefund} ETB`);
        
        // ✅ 1. Remove from in-memory storage
        if (activeMultiplayerGames[gameId]) {
            delete activeMultiplayerGames[gameId];
            console.log(`🧹 Removed game ${gameId} from activeMultiplayerGames`);
        }
        
        // ✅ 2. Save the updated state to file
        saveActiveMultiplayerGames();
        
        // ✅ 3. Clean up WebSocket connections
        cleanupGameConnections(gameId);
        
        // ✅ 4. Create next game after delay
        setTimeout(async () => {
            console.log(`🔄 Creating next game after cancellation...`);
            await createMultiplayerGame();
        }, GAME_CONFIG.NEXT_GAME_DELAY || 2000);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error cancelling game:', error);
    } finally {
        client.release();
    }
}

// Clean up WebSocket connections for a game
function cleanupGameConnections(gameId) {
    const connections = gameConnections.get(gameId);
    if (connections) {
        connections.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close(1001, 'Game cancelled');
            }
        });
        gameConnections.delete(gameId);
        console.log(`🧹 Closed ${connections.size} WebSocket connections for game ${gameId}`);
    }
}
// Full game cleanup (called after game ends)
function cleanupGame(gameId) {
    // Clean WebSocket connections
    cleanupGameConnections(gameId);
    
    // Remove from memory if still present
    if (activeMultiplayerGames[gameId]) {
        delete activeMultiplayerGames[gameId];
        saveActiveMultiplayerGames();
    }
    
    // Clear timers
    if (gameTimers[gameId]) {
        clearTimeout(gameTimers[gameId]);
        delete gameTimers[gameId];
    }
    
    if (gameIntervals[gameId]) {
        clearInterval(gameIntervals[gameId]);
        delete gameIntervals[gameId];
    }
    
    console.log(`🧹 Full cleanup completed for game ${gameId}`);
}

// ==================== TELEGRAM FUNCTIONS ====================
async function setupTelegramWebhook() {
    try {
        if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN') {
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

// ==================== TELEGRAM WEBHOOK HANDLER ====================
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
    const userIdStr = userId.toString();
    
    // ✅ CRITICAL FIX: Define username from Telegram
    const username = update.message.from.username || update.message.from.first_name || 'User';
    
    console.log(`📝 Message from ${username} (${userIdStr}): ${text}`);
    
    // Initialize user if new
    if (!users[userIdStr]) {
        users[userIdStr] = {
            id: userIdStr,
            username: username,  // ✅ Now defined
            chatId: chatId,
            balance: 0,
            registered: false,
            isAgent: false,
            agentCode: 'AG' + userIdStr.slice(-6),
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            totalDeposited: 0,
            totalWon: 0
        };
        saveUsers();
        console.log(`👤 New user registered: ${username} (${userIdStr})`);
    }
    
    // Update last active time
    users[userIdStr].lastActive = new Date().toISOString();
    const user = users[userIdStr];
    
    // Handle /play command
if (text === '/play') {
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
        return;
    }
    
    // ✅ CORRECT: Open WebApp with user ID
    await sendTelegramMessage(chatId,
        `🎮 *SHEBA BINGO - MULTIPLAYER*\n\n` +
        `💰 Your Balance: *${user.balance} ETB*\n` +
        `🎲 Entry Fee: *${GAME_CONFIG.BOARD_PRICE} ETB* per board\n` +
        `🏆 Prize Pool: 80% of all bets\n` +
        `👥 Min Players: 2 | Max: Unlimited\n\n` +
        `🎯 *HOW TO PLAY:*\n` +
        `1️⃣ Select 1-3 boards\n` +
        `2️⃣ Mark numbers as they're called\n` +
        `3️⃣ Complete a row, column, or diagonal\n` +
        `4️⃣ Click "CLAIM BINGO" to win!\n\n` +
        `⏱️ Game starts in 25 seconds!\n\n` +
        `👇 *Click PLAY to start!*`,
        {
            inline_keyboard: [[
                { 
                    text: `🎮 PLAY NOW (${user.balance} ETB)`, 
                    web_app: { url: `${RENDER_URL}/?user=${userId}` }
                }
            ]]
        }
    );
}
            
            
            // Handle /start command  
if (text === '/start') {
    if (!user.registered) {
        // NEW USER - Show register button
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
        // ALREADY REGISTERED - Show main menu with PLAY button
        await sendTelegramMessage(chatId,
            `🎮 *Welcome back to SHEBA BINGO!* 🎰\n\n` +
            `💰 *Your Balance: ${user.balance} ETB*\n\n` +
            `⚡ Quick Actions:`,
            {
                inline_keyboard: [
                    [{ 
                        text: `🎮 PLAY NOW (${user.balance} ETB)`, 
                        web_app: { url: `${RENDER_URL}/?user=${userId}` }
                    }],
                    [
                        { text: "💰 DEPOSIT", callback_data: "deposit" },
                        { text: "📊 BALANCE", callback_data: "balance" }
                    ],
                    [
                        { text: "📖 INSTRUCTION", callback_data: "instruction" },
                        { text: "👥 INVITE", callback_data: "invite" }
                    ]
                ]
            }
        );
    }
}
            // Handle photo messages (screenshots for manual deposit)
            else if (update.message.photo) {
                const photo = update.message.photo[update.message.photo.length - 1];
                
                // Store manual deposit
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
                    `1. Use /deposit command\n` +
                    `2. Select TeleBirr or CBE\n` +
                    `3. Copy the confirmation SMS\n` +
                    `4. Paste the SMS text here\n\n` +
                    `💰 Your current balance: *${user.balance} ETB*`
                );
                
                console.log(`📸 Manual deposit from ${user.username}`);
                
                // Notify admin
                await sendTelegramMessage(ADMIN_CHAT_ID,
                    `📥 *MANUAL DEPOSIT SCREENSHOT*\n\n` +
                    `👤 User: ${user.username} (${userId})\n` +
                    `💰 Current Balance: ${user.balance} ETB\n` +
                    `🕐 Time: ${new Date().toLocaleString()}\n\n` +
                    `⚡ Review in admin panel:\n` +
                    `${RENDER_URL}/admin.html`
                );
            }
            // Handle text messages
            else if (text) {
                // Check if message looks like a transaction SMS
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
                
                // Handle commands
                if (text.startsWith('/')) {
                    switch(text) {
                        case '/deposit':
    await sendTelegramMessage(chatId,
        `💰 *CHOOSE PAYMENT METHOD - INSTANT DEPOSIT* 💰\n\n` +
        `*FOR INSTANT CREDIT (UNDER 1 MINUTE):*\n` +
        `1. Select your payment method below.\n` +
        `2. Complete the transfer.\n` +
        `3. **You will receive an SMS from 127 (Telebirr)**.\n` +
        `4. **COPY the ENTIRE SMS text** you receive.\n` +
        `5. **PASTE that SMS text directly here** in this chat.\n\n` +
        `✅ *Automatic processing!*\n` +
        `❌ Do NOT send screenshots for instant processing.`,
        {
            inline_keyboard: [
                [{ text: "📱 TeleBirr (INSTANT)", callback_data: "telebirr_instant" }],
                [{ text: "🏦 CBE Birr (INSTANT)", callback_data: "cbe_instant" }],
                [{ text: "🏛️ Bank of Abyssinia", callback_data: "boa_instant" }]
                
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
                    // Regular text message
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

// ==================== CALLBACK QUERY HANDLER ====================
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
            `✅ *REGISTRATION SUCCESSFUL!* 🎉\n\n` +
            `🎁 Welcome Bonus: *10 ETB*\n` +
            `💰 Current Balance: *${user.balance} ETB*\n\n` +
            `🎮 Click PLAY to start!`,
            {
                inline_keyboard: [
                    [{ 
                        text: `🎮 PLAY NOW (${user.balance} ETB)`, 
                        web_app: { url: `${RENDER_URL}/?user=${user.id}` }
                    }],
                    [
                        { text: "💰 DEPOSIT", callback_data: "deposit" },
                        { text: "📊 BALANCE", callback_data: "balance" }
                    ]
                ]
            }
        );
    } else {
        await sendTelegramMessage(chatId,
            `ℹ️ *አስቀድመው ተመዝግበዋል / Already Registered*\n\n` +
            `የአሁን ባላንስዎ / Your current balance: *${user.balance} ETB*\n\n` +
            `🎮 ጨዋታ ለመጀመር ከታች ያለውን ቁልፍ ይጫኑ።\n` +
            `🎮 Click PLAY below to start playing!`,
            {
                inline_keyboard: [
                    [{ 
                        text: "🎮 PLAY NOW", 
                        web_app: { url: `${RENDER_URL}/?user=${user.id}` }
                    }],
                    [
                        { text: "💰 DEPOSIT", callback_data: "deposit" },
                        { text: "📊 BALANCE", callback_data: "balance" }
                    ]
                ]
            }
        );
    }
    break;
                
            case 'play':
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
        `📱 *Telebirr አማራጭ / Telebirr Option*\n\n` +
        `*መመሪያ / Instructions:*\n\n` +
        `1️⃣ ገንዘብ ወደዚህ ቁጥር ይላኩ፡\n` +
        `   📞 *+251945343143* - Mearg Alemayoh\n\n` +
        `2️⃣ ገንዘብ ከላኩ በኋላ ከ *127* አጭር የጽሁፍ መልእክት (SMS) ይደርሳችኋል።\n\n` +
        `3️⃣ ያንን ሙሉ የSMS መልእክት *COPY* ያድርጉ (ረጅም ተጭነው Copy ይምረጡ)።\n\n` +
        `4️⃣ ከዚህ በታች ባለው የቴሌግራም መልእክት ማስገቢያ ላይ *PASTE* ያድርጉና ይላኩ።\n\n` +
        `5️⃣ ባላንስዎ በራስ-ሰር ይጨመራል (ከ1 ደቂቃ በታች)።\n\n` +
        `*ምሳሌ የሚላክ መልእክት (Example SMS):*\n` +
        `"Dear Mearg You have transferred ETB 40.00 to ... Your transaction number is DCJ90J52HV."\n\n` +
        `❌ *ማስታወሻ፡* ስክሪን ሾት አይላኩ። የSMS ጽሑፍ ብቻ ይላኩ።\n\n` +
        `✅ *ከተቸገሩ* @ShebaBingoSupport ይጠይቁ።`,
        {
            reply_markup: {
                inline_keyboard: [[
                    { text: "🔙 ተመለስ / Back", callback_data: "deposit" }
                ]]
            }
        }
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
                    `• TeleBirr:+251945343143\n` +
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
    // First show balance
    await sendTelegramMessage(chatId,
        `💰 *YOUR BALANCE*\n\n` +
        `💵 Available: *${user.balance} ETB*\n\n` +
        `⏰ *QUICK JOIN AVAILABLE!*\n` +
        `Click PLAY to instantly join the next game!\n` +
        `🎮 Game starts in 25 seconds!`,
        {
            inline_keyboard: [[
                { 
                    text: `🎮 PLAY NOW (${user.balance} ETB)`, 
                    web_app: { url: `${RENDER_URL}/?user=${userId}&autojoin=true` }
                }
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
        `📖 *HOW TO PLAY SHEBA BINGO / እንዴት እንደሚጫወቱ*\n\n` +
        
        `*🇬🇧 ENGLISH:*\n` +
        `1️⃣ /register - Get 10 ETB free bonus 🎁\n` +
        `2️⃣ /deposit - Add money (min 10 ETB) 💰\n` +
        `3️⃣ /play - Open the game and select 1-3 boards 🎮\n` +
        `4️⃣ Mark numbers as they are called ✅\n` +
        `5️⃣ Complete a row, column, or diagonal to win! 🏆\n` +
        `6️⃣ Click "CLAIM BINGO" when you win 🎯\n\n` +
        
        `*🇪🇹 አማርኛ:*\n` +
        `1️⃣ /register - 10 ብር ነፃ ቦነስ ያግኙ 🎁\n` +
        `2️⃣ /deposit - ገንዘብ ይሙሉ (ከ10 ብር በላይ) 💰\n` +
        `3️⃣ /play - ጨዋታውን ይክፈቱ እና 1-3 ቦርዶች ይምረጡ 🎮\n` +
        `4️⃣ ቁጥሮች ሲጠሩ ምልክት ያድርጉ ✅\n` +
        `5️⃣ ረድፍ፣ አምድ ወይም ሰያፍ ሲሞላ ያሸንፋሉ! 🏆\n` +
        `6️⃣ ሲያሸንፉ "CLAIM BINGO" የሚለውን ይጫኑ 🎯\n\n` +
        
        `💰 *Prize / ሽልማት:* 80% of all bets go to winners!\n` +
        `⏱️ *Games run / ጨዋታዎች:* 24/7 every 2 minutes\n` +
        `📞 *Support / ድጋፍ:* @ShebaBingoETBotSupport`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🎮 PLAY NOW", web_app: { url: `${RENDER_URL}/?user=${userId}` } }],
                    [{ text: "💰 DEPOSIT", callback_data: "deposit" }]
                ]
            }
        }
    );
    break;
                
            case 'support':
    await sendTelegramMessage(chatId,
        `📞 *SUPPORT & INSTANT DEPOSIT HELP*\n\n` +
        `👤 Admin: @ShebaBingoETBotSupport\n` +  // ← UPDATED
        `📱 Phone: +251945343143\n` +
        `⏰ 24/7 Support\n\n` +
        `📧 Contact for:\n` +
        `• Deposit issues\n` +
        `• Withdrawal help\n` +
        `• Game problems`
    );
    break;
                
            case 'invite':
    const referralLink = `https://t.me/ShebaBingoETBot?start=${userId}`;
    await sendTelegramMessage(chatId,
        `👥 *INVITE FRIENDS / ጓደኛ ጋብዝ*\n\n` +
        
        `*🇬🇧 ENGLISH:*\n` +
        `Share this link with your friends:\n` +
        `${referralLink}\n\n` +
        `🎁 Get *5 ETB bonus* when they register and deposit!\n\n` +
        
        `*🇪🇹 አማርኛ:*\n` +
        `ይህን ሊንክ ለጓደኞችዎ ያጋሩ:\n` +
        `${referralLink}\n\n` +
        `🎁 ጓደኛዎ ሲመዘገብ እና ገንዘብ ሲያስገባ *5 ብር ቦነስ* ያግኙ!`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📋 COPY LINK", callback_data: "copy_link" }],
                    [{ text: "🔙 BACK", callback_data: "menu" }]
                ]
            }
        }
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

// To this (actual implementation):
async function handleAdminCallback(data, callback) {
    try {
        const parts = data.split('_');
        const action = parts[1];
        const depositId = parts[2];
        
        if (action === 'approve') {
            const deposit = deposits.find(d => d.id === depositId);
            if (deposit && deposit.status === 'pending_manual') {
                const user = users[deposit.userId];
                if (user) {
                    deposit.status = 'approved';
                    deposit.approvedAt = new Date().toISOString();
                    user.balance += 50;
                    saveUsers();
                    saveDeposits();
                    
                    await sendTelegramMessage(deposit.chatId,
                        `✅ *MANUAL DEPOSIT APPROVED!*\n\n` +
                        `💰 Amount: *50 ETB*\n` +
                        `🎁 New Balance: *${user.balance} ETB*\n\n` +
                        `🎮 Click PLAY to start!`
                    );
                    
                    await sendTelegramMessage(callback.message.chat.id,
                        `✅ Manual deposit approved for ${user.username}`
                    );
                }
            }
        } else if (action === 'reject') {
            const deposit = deposits.find(d => d.id === depositId);
            if (deposit && deposit.status === 'pending_manual') {
                deposit.status = 'rejected';
                deposit.rejectedAt = new Date().toISOString();
                saveDeposits();
                
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
    } catch (error) {
        console.error('Admin callback error:', error);
    }
}

async function processInstantDeposit(userId, chatId, smsText) {
    try {
        const user = users[userId];
        if (!user) {
            await sendTelegramMessage(chatId, `❌ User not found. Please use /start first.`);
            return;
        }

        console.log(`🔍 Processing SMS from ${user.username}: ${smsText.substring(0, 80)}...`);

        // Extract Transaction ID - Enhanced for Telebirr
        let transactionId = null;
        const txIdPatterns = [
            // Primary Telebirr format - "Your transaction number is DCJ90J52HV"
            /transaction number is ([A-Z0-9]{10,})/i,
            
            // From the receipt link - "receipt/DCJ90J52HV"
            /receipt\/([A-Z0-9]{10,})/i,
            
            // Standard patterns
            /transaction (?:number|id) is (\w+)/i,
            /transaction #(\w+)/i,
            /reference (?:number|id) (\w+)/i,
            /reference (\w+)/i,
            
            // Common Ethiopian banking patterns
            /DA17G5W\w{3}/i,
            /DCJ[0-9A-Z]{7,}/i,
            
            // Match at end of line or after period
            /([A-Z0-9]{10,})\.?\s*$/m,
            
            // Generic transaction ID
            /(?:TXN|TRN|ID)[:\s]*([A-Z0-9]{10,})/i
        ];

        for (const pattern of txIdPatterns) {
            const match = smsText.match(pattern);
            if (match) {
                transactionId = match[1] || match[0];
                console.log(`📋 Found Transaction ID: ${transactionId}`);
                break;
            }
        }

        // Extract Amount - Enhanced for Telebirr
        let amount = null;
        const amountPatterns = [
            // Primary Telebirr format - "transferred ETB 40.00"
            /transferred ETB ([\d.]+)/i,
            
            // Standard formats
            /ETB\s*(\d+(?:\.\d{2})?)/i,
            /transferred\s*(\d+(?:\.\d{2})?)/i,
            /(\d+(?:\.\d{2})?)\s*ETB/i,
            /ETB (\d+(?:\.\d{2})?)/i,
            
            // Amount with description
            /(?:amount|AMT|birr)[:\s]*([\d.]+)/i,
            
            // Fallback - find any number with decimal
            /\b(\d+\.\d{2})\b/
        ];

        for (const pattern of amountPatterns) {
            const match = smsText.match(pattern);
            if (match) {
                amount = parseFloat(match[1]);
                console.log(`💰 Found Amount: ${amount} ETB`);
                if (amount >= 10) break;
            }
        }

        // Validation with better error messages
        if (!transactionId) {
            await sendTelegramMessage(chatId,
                `❌ *Unable to parse message / መልእክቱ ሊታወቅ አልቻለም*\n\n` +
                `Please copy the *complete SMS* you received from Telebirr.\n` +
                `እባክዎ ከቴሌብር የደረሳችሁን *ሙሉ የSMS መልእክት* ይላኩ።\n\n` +
                `Example / ምሳሌ:\n` +
                `"Dear Mearg You have transferred ETB 40.00 ... Your transaction number is DCJ90J52HV."\n\n` +
                `If problem persists, contact @ShebaBingoETBotSupport.`
            );
            return;
        }
        
        if (!amount || amount < 10) {
            await sendTelegramMessage(chatId,
                `❌ *Valid amount not found / ትክክለኛ ያልሆነ መጠን*\n\n` +
                `Minimum deposit is *10 ETB*.\n` +
                `Found / የተገኘ: ${amount || 'nothing / ምንም'}\n\n` +
                `Please paste the complete SMS including the amount.\n` +
                `እባክዎ መጠኑን የያዘ ሙሉ መልእክት ይላኩ።`
            );
            return;
        }

        // Check for duplicate
        const isDuplicate = deposits.some(d => 
            d.transactionId === transactionId && d.status === 'approved'
        );
        
        if (isDuplicate) {
            await sendTelegramMessage(chatId,
                `⚠️ *Deposit Already Processed / ክፍያው አስቀድሞ ተመዝግቧል*\n\n` +
                `Transaction ID *${transactionId}* was already credited.\n` +
                `If this is a mistake, contact @ShebaBingoETBotSupport.`
            );
            return;
        }

        // Create deposit record
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

        // ✅ UPDATED: Notify user with confirmation and ONLY PLAY NOW button
        await sendTelegramMessage(chatId,
            `✅ *Deposit successful! / ክፍያው ተሳክቷል!*\n\n` +
            `Amount added / ተጨማሪ ገንዘብ: *${amount.toFixed(1)} ETB*\n` +
            `Transaction / የክፍያ መለያ: *${transactionId}*\n` +
            `New balance / አሁን ያለዎት ባላንስ: *${user.balance.toFixed(1)} ETB*\n\n` +
            `🎮 Click PLAY to start!`,
            {
                reply_markup: {
                    inline_keyboard: [[
                        { 
                            text: "🎮 PLAY NOW", 
                            web_app: { url: `${RENDER_URL}/?user=${userId}` }
                        }
                    ]]
                }
            }
        );

        // Alert admin
        await sendTelegramMessage(ADMIN_CHAT_ID,
            `⚡ *INSTANT DEPOSIT*\n` +
            `👤 ${user.username}\n` +
            `💰 ${amount} ETB\n` +
            `🆔 ${transactionId}\n` +
            `💵 New: ${user.balance} ETB`
        );
        
    } catch (error) {
        console.error('Error processing instant deposit:', error);
        await sendTelegramMessage(chatId,
            `❌ *Error Processing Deposit*\n\n` +
            `Please contact @ShebaBingoETBotSupport`
        );
    }
}
// ==================== API ENDPOINTS ====================
// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Redirect game.html to index.html
app.get('/game.html', (req, res) => {
    const userId = req.query.user;
    console.log(`🔄 Redirecting /game.html?user=${userId} to /?user=${userId}`);
    res.redirect(301, `/?user=${userId || ''}`);
});

app.get('/game', (req, res) => {
    res.redirect(301, `/?user=${req.query.user || ''}`);
});

// Get active games
app.get('/api/games/active', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT mg.*, COUNT(gp.user_id) as player_count
            FROM multiplayer_games mg
            LEFT JOIN game_players gp ON mg.id = gp.game_id
            WHERE mg.status IN ('selecting', 'shuffling', 'active')
            GROUP BY mg.id
            ORDER BY mg.created_at DESC
            LIMIT 10
        `);
        
        res.json({ success: true, games: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create or join game
app.post('/api/game/join', async (req, res) => {
    try {
        const { userId, boardCount = 1, boardNumbers = [] } = req.body;
        
        if (!users[userId]) {
            return res.json({ success: false, error: 'User not found. Please use /start in Telegram first.' });
        }
        
        const user = users[userId];
        
        // Validate board count
        if (boardCount < 1 || boardCount > GAME_CONFIG.MAX_BOARDS_PER_PLAYER) {
            return res.json({ 
                success: false, 
                error: `Invalid board count. Choose 1-${GAME_CONFIG.MAX_BOARDS_PER_PLAYER} boards.` 
            });
        }
        
        const totalCost = boardCount * GAME_CONFIG.BOARD_PRICE;
        
        // Check balance
        if (user.balance < totalCost) {
            return res.json({ 
                success: false, 
                error: 'Insufficient balance',
                required: totalCost,
                current: user.balance
            });
        }
        
        // Find available game or create new
        let gameResult = await pool.query(`
            SELECT mg.*, COUNT(gp.user_id) as player_count
            FROM multiplayer_games mg
            LEFT JOIN game_players gp ON mg.id = gp.game_id
            WHERE mg.status = 'selecting'
            GROUP BY mg.id
            HAVING COUNT(gp.user_id) < $1
            ORDER BY mg.created_at ASC
            LIMIT 1
        `, [GAME_CONFIG.MAX_PLAYERS]);
        
        let gameId, gameNumber;
        
        if (gameResult.rows.length > 0) {
            gameId = gameResult.rows[0].id;
            gameNumber = gameResult.rows[0].game_number;
        } else {
            const newGame = await createMultiplayerGame();
            if (!newGame.success) {
                return res.json({ success: false, error: newGame.error });
            }
            gameId = newGame.gameId;
            gameNumber = newGame.gameNumber;
        }
        
        // Check if user already in this game
        const existingPlayer = await pool.query(
            `SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2`,
            [gameId, userId]
        );
        
        if (existingPlayer.rows.length > 0) {
            return res.json({ 
                success: false, 
                error: 'Already in this game',
                gameId: gameId
            });
        }
        
        // Join the game
        const joinResult = await joinMultiplayerGame(gameId, userId, boardCount, boardNumbers);
        
        if (!joinResult.success) {
            return res.json({ success: false, error: joinResult.error });
        }
        
        res.json({
            success: true,
            gameId: gameId,
            gameNumber: gameNumber,
            boards: joinResult.boards,
            prizePool: joinResult.prizePool,
            playerCount: joinResult.playerCount,
            gameStatus: 'selecting',
            selectionTime: GAME_CONFIG.SELECTION_TIME,
            yourBalance: user.balance
        });
        
    } catch (error) {
        console.error('Error in game join:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get game state
app.get('/api/game/:gameId/state/:userId', async (req, res) => {
    try {
        const { gameId, userId } = req.params;
        const gameState = await getGameState(gameId, userId);
        
        if (!gameState) {
            return res.json({ success: false, error: 'Game not found' });
        }
        
        res.json({ success: true, ...gameState });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mark number
app.post('/api/game/mark-number', async (req, res) => {
    try {
        const { gameId, userId, number } = req.body;
        
        const marked = await markPlayerNumber(gameId, userId, number);
        
        if (marked) {
            res.json({ success: true, message: 'Number marked' });
        } else {
            res.json({ success: false, error: 'Number already marked or not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Claim BINGO
app.post('/api/game/claim-bingo', async (req, res) => {
    try {
        const { gameId, userId } = req.body;
        
        const isValid = await checkBingo(gameId, userId);
        
        if (isValid) {
            const result = await declareWinner(gameId, userId);
            
            if (result.success) {
                res.json({ 
                    success: true, 
                    message: 'BINGO claimed successfully!',
                    prize: result.prize
                });
            } else {
                res.json({ success: false, error: result.error });
            }
        } else {
            res.json({ success: false, error: 'No valid BINGO pattern found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Leave game
app.post('/api/game/leave', async (req, res) => {
    try {
        const { gameId, userId } = req.body;
        
        await pool.query(
            `DELETE FROM game_players WHERE game_id = $1 AND user_id = $2`,
            [gameId, userId]
        );
        
        // Update player count in broadcast
        broadcastToGame(gameId, {
            type: 'player_left',
            userId: userId,
            playerCount: await getPlayerCount(gameId)
        });
        
        res.json({ success: true, message: 'Left game' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user balance
app.get('/api/user/:id/balance', (req, res) => {
    const userId = req.params.id;  // This is already a string from URL
    const user = users[userId];
    
    if (user) {
        res.json({ success: true, balance: user.balance, username: user.username });
    } else {
        // Create new user if not exists
        users[userId] = {  // ✅ Already using string
            id: userId,
            username: 'Player_' + userId.slice(-4),
            balance: 0,
            registered: false,
            // ...
        };
        saveUsers();
        res.json({ success: true, balance: 0 });
    }
});

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

// Get system overview
app.get('/api/admin/overview', async (req, res) => {
    try {
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
        
        // Get active games from database
        const gamesResult = await pool.query(
            `SELECT COUNT(*) as game_count, 
                    COALESCE(SUM(player_count), 0) as total_players
             FROM (
                 SELECT mg.id, COUNT(gp.user_id) as player_count
                 FROM multiplayer_games mg
                 LEFT JOIN game_players gp ON mg.id = gp.game_id
                 WHERE mg.status IN ('selecting', 'shuffling', 'active')
                 GROUP BY mg.id
             ) active_games`
        );
        
        const activeMultiplayerGames = parseInt(gamesResult.rows[0]?.game_count) || 0;
        const playersInGames = parseInt(gamesResult.rows[0]?.total_players) || 0;
        
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
                playersInGames: playersInGames
            },
            system: {
                uptime: process.uptime(),
                timestamp: now.toISOString(),
                autoDepositSystem: 'operational',
                multiplayerSystem: 'active'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get pending deposits
app.get('/api/admin/deposits/pending', (req, res) => {
    const pending = deposits.filter(d => d.status === 'pending_manual');
    res.json({ success: true, deposits: pending, count: pending.length });
});

// Approve manual deposit
app.post('/api/admin/deposit/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount = 50 } = req.body;
        
        const deposit = deposits.find(d => d.id === id);
        if (!deposit) {
            return res.json({ success: false, error: 'Deposit not found' });
        }
        
        const user = users[deposit.userId];
        if (!user) {
            return res.json({ success: false, error: 'User not found' });
        }
        
        deposit.status = 'approved';
        deposit.approvedAmount = amount;
        deposit.approvedAt = new Date().toISOString();
        deposit.approvedBy = 'admin';
        
        user.balance += amount;
        user.totalDeposited = (user.totalDeposited || 0) + amount;
        
        saveUsers();
        saveDeposits();
        
        // Notify user
        if (user.chatId) {
            await sendTelegramMessage(user.chatId,
                `✅ *MANUAL DEPOSIT APPROVED!*\n\n` +
                `💰 Amount: *${amount} ETB*\n` +
                `🎁 New Balance: *${user.balance} ETB*\n\n` +
                `🎮 Click PLAY to start!`
            );
        }
        
        res.json({ 
            success: true, 
            message: 'Deposit approved',
            approvedAmount: amount,
            newBalance: user.balance
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// WebSocket endpoint
app.get('/game-ws', (req, res) => {
    res.json({ 
        message: 'WebSocket endpoint is active',
        url: `ws://${req.headers.host}/game-ws`
    });
});

// Get user's active games
app.get('/api/user/:id/games', async (req, res) => {
    try {
        const userId = req.params.id;
        
        const result = await pool.query(`
            SELECT mg.*, gp.boards, gp.marked_numbers
            FROM multiplayer_games mg
            INNER JOIN game_players gp ON mg.id = gp.game_id
            WHERE gp.user_id = $1 
            AND mg.status IN ('selecting', 'shuffling', 'active')
            ORDER BY mg.created_at DESC
            LIMIT 5
        `, [userId]);
        
        res.json({ success: true, games: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update user balance (for script.js)
app.post('/api/user/update-balance', async (req, res) => {
    try {
        const { userId, balance } = req.body;
        
        if (!users[userId]) {
            return res.json({ success: false, error: 'User not found' });
        }
        
        users[userId].balance = balance;
        saveUsers();
        
        res.json({ success: true, newBalance: balance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add this route to test the game flow
app.get('/api/test-game-flow', async (req, res) => {
    try {
        // Create a test game
        const game = await createMultiplayerGame();
        
        // Add a test player
        const testUserId = 'test_user_123';
        const testUser = {
            id: testUserId,
            username: 'Test Player',
            balance: 100,
            registered: true
        };
        
        users[testUserId] = testUser;
        
        // Join the game
        const joinResult = await joinMultiplayerGame(game.gameId, testUserId, 1, []);
        
        res.json({
            success: true,
            message: 'Test game created',
            gameId: game.gameId,
            gameNumber: game.gameNumber,
            joinResult: joinResult,
            selectionTimeLeft: GAME_CONFIG.SELECTION_TIME,
            playersNeeded: GAME_CONFIG.MIN_PLAYERS
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MULTIPLAYER API ENDPOINTS (ADD THESE) ====================



// 1. Join multiplayer game (matches frontend call)

app.post('/api/multiplayer/join', async (req, res) => {
    console.log('🔥 JOIN ENDPOINT CALLED!', req.body);
    
    try {
        const { userId, boardCount = 1, boardNumbers = [] } = req.body;
        
        console.log(`📥 Join request: userId=${userId}, boardCount=${boardCount}`);
        
        // Check if user exists
        const user = users[userId];
        if (!user) {
            console.log(`❌ User not found: ${userId}`);
            return res.json({ success: false, error: 'User not found. Please register first.' });
        }
        
        const totalCost = boardCount * 10; // 10 ETB per board
        
        if (user.balance < totalCost) {
            console.log(`❌ Insufficient balance: ${user.balance} < ${totalCost}`);
            return res.json({ success: false, error: `Insufficient balance. Need ${totalCost} ETB` });
        }
        
        // Find existing waiting game
        let gameId = null;
        for (const gid in activeMultiplayerGames) {
            if (activeMultiplayerGames[gid].status === 'waiting') {
                gameId = gid;
                break;
            }
        }
        
        // If no game exists, create one
        if (!gameId) {
            gameId = 'GAME_' + Date.now().toString(36);
            const gameNumber = Object.keys(activeMultiplayerGames).length + 1;
            
            activeMultiplayerGames[gameId] = {
                id: gameId,
                gameNumber: gameNumber,
                status: 'waiting',
                players: {},
                calledNumbers: [],
                prizePool: 0,
                createdAt: new Date().toISOString(),
                selectionEndTime: new Date(Date.now() + 25000).toISOString()
            };
            console.log(`🆕 Created new game: ${gameId}`);
            saveActiveMultiplayerGames();
        }
        
        const game = activeMultiplayerGames[gameId];
        
        // Generate boards
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
        
        // Add player to game
        game.players[userId] = {
            id: userId,
            username: user.username,
            boards: boards,
            markedNumbers: [],
            hasBingo: false,
            totalBet: totalCost,
            joinedAt: new Date().toISOString()
        };
        
        // Deduct balance
        user.balance -= totalCost;
        game.prizePool += totalCost * 0.8;
        
        saveUsers();
        saveActiveMultiplayerGames();
        
        console.log(`✅ ${user.username} joined game ${gameId} with ${boardCount} boards`);
        
        res.json({
            success: true,
            gameId: gameId,
            gameNumber: game.gameNumber,
            boards: boards,
            prizePool: game.prizePool,
            playerCount: Object.keys(game.players).length,
            selectionTimeLeft: Math.max(0, Math.floor((new Date(game.selectionEndTime) - new Date()) / 1000))
        });
        
    } catch (error) {
        console.error('❌ Join error:', error);
        res.json({ success: false, error: error.message });
    }
});

// 2. Get active multiplayer games (matches frontend call)
app.get('/api/multiplayer/games', async (req, res) => {
    try {
        console.log('📡 GET /api/multiplayer/games - Fetching active games...');
        
        // Get games from file-based activeMultiplayerGames
        const games = [];
        
        for (const gameId in activeMultiplayerGames) {
            const game = activeMultiplayerGames[gameId];
            // Only show games that are waiting or selecting (not started or finished)
            if (game.status === 'waiting' || game.status === 'selecting') {
                const playerCount = Object.keys(game.players || {}).length;
                const timeLeft = game.selectionEndTime ? 
                    Math.max(0, Math.floor((new Date(game.selectionEndTime) - new Date()) / 1000)) : 25;
                
                games.push({
                    id: game.id,
                    gameNumber: game.gameNumber || 1,
                    players: playerCount,
                    prizePool: game.prizePool || 0,
                    status: game.status,
                    timeLeft: timeLeft
                });
            }
        }
        
        console.log(`📊 Found ${games.length} active game(s)`);
        res.json({ success: true, games: games });
        
    } catch (error) {
        console.error('❌ Error getting multiplayer games:', error);
        res.json({ success: false, games: [], error: error.message });
    }
});

// 3. Get multiplayer game state (matches frontend call)
app.get('/api/multiplayer/state/:gameId/:userId', async (req, res) => {
    try {
        const { gameId, userId } = req.params;
        
        // Check file-based games first
        let game = activeMultiplayerGames[gameId];
        
        // If not in file, check database
        if (!game) {
            const dbResult = await pool.query(
                `SELECT * FROM multiplayer_games WHERE id = $1`,
                [gameId]
            );
            if (dbResult.rows.length > 0) {
                game = dbResult.rows[0];
                game.players = await getGamePlayersFromDB(gameId);
            }
        }
        
        if (!game) {
            return res.json({ success: false, error: 'Game not found' });
        }
        
        const player = game.players?.[userId];
        if (!player) {
            // Check database for player
            const dbPlayer = await pool.query(
                `SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2`,
                [gameId, userId]
            );
            if (dbPlayer.rows.length === 0) {
                return res.json({ success: false, error: 'Not in this game' });
            }
        }
        
        // Get player list
        const playerList = [];
        if (game.players) {
            for (const pid in game.players) {
                playerList.push(game.players[pid].username);
            }
        } else {
            const dbPlayers = await pool.query(
                `SELECT u.username FROM game_players gp
                 JOIN users u ON gp.user_id = u.id
                 WHERE gp.game_id = $1`,
                [gameId]
            );
            for (const p of dbPlayers.rows) {
                playerList.push(p.username);
            }
        }
        
        res.json({
            success: true,
            game: {
                id: game.id,
                gameNumber: game.gameNumber,
                status: game.status,
                calledNumbers: game.calledNumbers || game.called_numbers || [],
                currentCall: game.currentCall || game.current_call,
                prizePool: game.prizePool || game.prize_pool,
                players: playerList.length,
                playerList: playerList,
                startTime: game.startTime || game.start_time,
                endTime: game.endTime || game.end_time,
                timeLeft: game.endTime ? Math.max(0, new Date(game.endTime) - new Date()) : 
                          game.end_time ? Math.max(0, new Date(game.end_time) - new Date()) : 0
            },
            player: {
                boards: player?.boards || (game.players?.[userId]?.boards) || [],
                markedNumbers: player?.markedNumbers || (game.players?.[userId]?.markedNumbers) || [],
                hasBingo: player?.hasBingo || (game.players?.[userId]?.hasBingo) || false
            }
        });
        
    } catch (error) {
        console.error('Multiplayer state error:', error);
        res.json({ success: false, error: error.message });
    }
});

// 4. Get next game start time
app.get('/api/game/next-start', async (req, res) => {
    try {
        let nextStartTime = null;
        
        // Check file-based games
        for (const gameId in activeMultiplayerGames) {
            const game = activeMultiplayerGames[gameId];
            if (game.status === 'waiting' && game.selectionEndTime) {
                const endTime = new Date(game.selectionEndTime);
                if (endTime > new Date()) {
                    if (!nextStartTime || endTime < nextStartTime) {
                        nextStartTime = endTime;
                    }
                }
            }
        }
        
        // Check database
        const dbResult = await pool.query(`
            SELECT selection_end_time FROM multiplayer_games 
            WHERE status = 'waiting' AND selection_end_time > NOW()
            ORDER BY selection_end_time ASC 
            LIMIT 1
        `);
        
        if (dbResult.rows.length > 0) {
            const dbEndTime = new Date(dbResult.rows[0].selection_end_time);
            if (!nextStartTime || dbEndTime < nextStartTime) {
                nextStartTime = dbEndTime;
            }
        }
        
        if (nextStartTime) {
            const secondsLeft = Math.max(0, Math.floor((nextStartTime - new Date()) / 1000));
            res.json({ success: true, secondsLeft: secondsLeft });
        } else {
            // Default: next game in 25 seconds
            res.json({ success: true, secondsLeft: 25 });
        }
        
    } catch (error) {
        console.error('Error getting next start:', error);
        res.json({ success: true, secondsLeft: 25 });
    }
});

// ==================== SERVE FRONTEND ====================
// 2. Static files

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== SERVER KEEP-ALIVE ====================
// ⬇️⬇️⬇️ ADD THE KEEP-ALIVE CODE HERE ⬇️⬇️⬇️

// Prevent Render free tier from sleeping
// Render free tier sleeps after 15 minutes of inactivity
// So ping every 10 minutes to stay alive
const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes (600 seconds)

let keepAliveCount = 0;

setInterval(async () => {
    try {
        // Self-ping using the health endpoint
        const response = await fetch(`http://localhost:${PORT}/api/health`);
        keepAliveCount++;
        console.log(`💓 Keep-alive ping #${keepAliveCount} sent at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        console.log(`⚠️ Keep-alive ping failed:`, error.message);
    }
}, KEEP_ALIVE_INTERVAL);

// Add health check endpoint (if you don't already have one)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        activeGames: Object.keys(activeMultiplayerGames).length
    });
});



// Helper function to get game players from database
async function getGamePlayersFromDB(gameId) {
    try {
        const result = await pool.query(
            `SELECT user_id, boards, marked_numbers, has_bingo 
             FROM game_players WHERE game_id = $1`,
            [gameId]
        );
        
        const players = {};
        for (const row of result.rows) {
            const user = users[row.user_id];
            players[row.user_id] = {
                id: row.user_id,
                username: user?.username || 'Player',
                boards: JSON.parse(row.boards),
                markedNumbers: JSON.parse(row.marked_numbers || '[]'),
                hasBingo: row.has_bingo
            };
        }
        return players;
    } catch (error) {
        console.error('Error getting game players:', error);
        return {};
    }
}





// ==================== START SERVER ====================
// 🧹 CLEANUP FUNCTION (place this just above server.listen)
async function cleanupStuckGames() {
    try {
        console.log('🧹 Cleaning up stuck games...');
        
        // Cancel all selecting games older than 2 minutes
        const result = await pool.query(`
            UPDATE multiplayer_games 
            SET status = 'cancelled', end_time = NOW()
            WHERE status = 'selecting'
            AND created_at < NOW() - INTERVAL '2 minutes'
            RETURNING id
        `);
        
        console.log(`🧹 Cancelled ${result.rows.length} stuck games`);
        
        // Delete very old games
        const deleteResult = await pool.query(`
            DELETE FROM multiplayer_games 
            WHERE created_at < NOW() - INTERVAL '1 hour'
            RETURNING id
        `);
        
        console.log(`🧹 Deleted ${deleteResult.rows.length} old games`);
        
    } catch (error) {
        console.error('Error cleaning up stuck games:', error);
    }
}

// ==================== START SERVER ====================
// STEP 6: START SERVER (ONLY ONCE)
const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    
    // Initialize everything after server starts
    await initializeDatabase();
    await migrateDatabase();
    await cleanupStuckGames();
    await setupTelegramWebhook();
    startGameCycle();
    
    console.log('✅ All systems initialized');
});



// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    
    // Close WebSocket connections
    wss.close();
    
    // Close database connection
    await pool.end();
    
    // Save data to files
    saveUsers();
    saveDeposits();
    saveGames();
    
    console.log('Data saved, server shutting down...');
    process.exit(0);
});





// Initialize database tables
async function initializeDatabase() {
    try {
        // Update multiplayer_games table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS multiplayer_games (
                id VARCHAR(50) PRIMARY KEY,
                game_number INTEGER,
                status VARCHAR(20) DEFAULT 'selecting',
                prize_pool DECIMAL(10,2) DEFAULT 0,
                called_numbers JSONB DEFAULT '[]',
                current_call VARCHAR(5),
                start_time TIMESTAMP,
                end_time TIMESTAMP,
                selection_end_time TIMESTAMP,
                winner_id BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_boards INTEGER DEFAULT 0,
                min_players INTEGER DEFAULT 2,
                max_players INTEGER DEFAULT 100,
                game_mode VARCHAR(20) DEFAULT 'classic'
            )
        `);
        
        // ✅ FIX: Use BIGINT for user_id
        await pool.query(`
            CREATE TABLE IF NOT EXISTS game_players (
                id SERIAL PRIMARY KEY,
                game_id VARCHAR(50) REFERENCES multiplayer_games(id) ON DELETE CASCADE,
                user_id BIGINT,
                boards JSONB,
                marked_numbers JSONB DEFAULT '[]',
                has_bingo BOOLEAN DEFAULT FALSE,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                board_count INTEGER DEFAULT 1,
                total_paid DECIMAL(10,2) DEFAULT 0,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(game_id, user_id)
            )
        `);
        
        console.log('✅ Database tables initialized/updated');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// ==================== DATABASE MIGRATION ====================
async function migrateDatabase() {
    try {
        console.log('🔄 Running database migrations...');
        
        // ✅ FIX: Change user_id column from INTEGER to BIGINT
        // First drop the foreign key constraint if it exists
        try {
            await pool.query(`ALTER TABLE game_players DROP CONSTRAINT game_players_user_id_fkey`);
        } catch (e) {
            // Constraint might not exist, ignore error
        }
        
        // Change column type to BIGINT
        await pool.query(`
            ALTER TABLE game_players 
            ALTER COLUMN user_id TYPE BIGINT
        `);
        
        // Also update winner_id in multiplayer_games
        await pool.query(`
            ALTER TABLE multiplayer_games 
            ALTER COLUMN winner_id TYPE BIGINT
        `);
        
        // Add missing columns to multiplayer_games
        await pool.query(`
            ALTER TABLE multiplayer_games 
            ADD COLUMN IF NOT EXISTS total_boards INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS min_players INTEGER DEFAULT 2,
            ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 100,
            ADD COLUMN IF NOT EXISTS game_mode VARCHAR(20) DEFAULT 'classic'
        `);
        
        // Add missing columns to game_players
        await pool.query(`
            ALTER TABLE game_players 
            ADD COLUMN IF NOT EXISTS board_count INTEGER DEFAULT 1,
            ADD COLUMN IF NOT EXISTS total_paid DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        
        console.log('✅ Database migrations completed');
    } catch (error) {
        console.error('❌ Database migration error:', error.message);
    }
}
