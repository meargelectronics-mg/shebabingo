// ==================== SHEBA BINGO - PRODUCTION SERVER ====================
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

app.use(cors({
    origin: ['https://shebabingo-bot.onrender.com', 'https://t.me'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// ==================== CONFIGURATION ====================
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN not set!');
    process.exit(1);
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Mg@sheba#23';
const RENDER_URL = process.env.RENDER_URL || 'https://shebabingo-bot.onrender.com';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '6297094384';

console.log('='.repeat(60));
console.log('🚀 SHEBA BINGO - PRODUCTION SERVER');
console.log('='.repeat(60));

// ==================== POSTGRESQL DATABASE ====================
const DATABASE_URL = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20
});

pool.on('error', (err) => {
    console.error('❌ Database error:', err.message);
});

async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS multiplayer_games (
                id VARCHAR(50) PRIMARY KEY,
                game_number INTEGER,
                status VARCHAR(20) DEFAULT 'waiting',
                prize_pool DECIMAL(10,2) DEFAULT 0,
                called_numbers JSONB DEFAULT '[]',
                current_call VARCHAR(10),
                start_time TIMESTAMP,
                end_time TIMESTAMP,
                selection_end_time TIMESTAMP,
                winner_id BIGINT,
                players_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS game_players (
                id SERIAL PRIMARY KEY,
                game_id VARCHAR(50) REFERENCES multiplayer_games(id) ON DELETE CASCADE,
                user_id BIGINT,
                boards JSONB,
                marked_numbers JSONB DEFAULT '[]',
                has_bingo BOOLEAN DEFAULT FALSE,
                bet_amount DECIMAL(10,2) DEFAULT 0,
                joined_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(game_id, user_id)
            )
        `);
        
        console.log('✅ Database initialized');
    } catch (error) {
        console.error('Database init error:', error);
    }
}
initDatabase();

// ==================== FILE STORAGE (USERS & DEPOSITS ONLY) ====================
let users = {};
let deposits = [];
let games = [];

const USERS_FILE = path.join(__dirname, 'users.json');
const DEPOSITS_FILE = path.join(__dirname, 'deposits.json');
const GAMES_FILE = path.join(__dirname, 'games.json');

if (fs.existsSync(USERS_FILE)) {
    try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch(e) {}
}
if (fs.existsSync(DEPOSITS_FILE)) {
    try { deposits = JSON.parse(fs.readFileSync(DEPOSITS_FILE, 'utf8')); } catch(e) {}
}
if (fs.existsSync(GAMES_FILE)) {
    try { games = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8')); } catch(e) {}
}

function saveUsers() { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); }
function saveDeposits() { fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits, null, 2)); }
function saveGames() { fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2)); }

// ==================== GAME CONFIGURATION ====================
const GAME_CONFIG = {
    BOARD_PRICE: 10,
    PRIZE_POOL_PERCENT: 80,
    MAX_CALLS: 45,
    CALL_INTERVAL: 3000,
    SELECTION_TIME: 25,
    SHUFFLE_TIME: 5,
    GAME_DURATION: 90000,
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 999,
    MAX_BOARDS_PER_PLAYER: 3,
    TOTAL_BOARDS: 400
};

// ==================== WEBSOCKET ====================
const wss = new WebSocket.Server({ server, path: '/ws' });
const gameConnections = new Map();

wss.on('connection', (ws, req) => {
    const params = new URLSearchParams(req.url.split('?')[1] || '');
    const gameId = params.get('gameId');
    const userId = params.get('userId');
    
    if (!gameId || !userId) {
        ws.close(1008, 'Missing parameters');
        return;
    }
    
    ws.gameId = gameId;
    ws.userId = userId;
    
    if (!gameConnections.has(gameId)) gameConnections.set(gameId, new Set());
    gameConnections.get(gameId).add(ws);
    
    ws.on('close', () => {
        const conn = gameConnections.get(gameId);
        if (conn) {
            conn.delete(ws);
            if (conn.size === 0) gameConnections.delete(gameId);
        }
    });
});

function broadcastToGame(gameId, payload) {
    const conn = gameConnections.get(gameId);
    if (!conn) return;
    const msg = JSON.stringify(payload);
    conn.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(msg); });
}

// ==================== GAME FUNCTIONS ====================
function generateBingoBoard() {
    const board = [];
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
    const B = shuffle([...Array(15).keys()].map(i => i + 1)).slice(0, 5).sort((a,b)=>a-b);
    const I = shuffle([...Array(15).keys()].map(i => i + 16)).slice(0, 5).sort((a,b)=>a-b);
    const N = shuffle([...Array(15).keys()].map(i => i + 31)).slice(0, 4).sort((a,b)=>a-b);
    const G = shuffle([...Array(15).keys()].map(i => i + 46)).slice(0, 5).sort((a,b)=>a-b);
    const O = shuffle([...Array(15).keys()].map(i => i + 61)).slice(0, 5).sort((a,b)=>a-b);
    let nIdx = 0;
    for (let row = 0; row < 5; row++) {
        board.push([B[row], I[row], row === 2 ? 'FREE' : N[nIdx++], G[row], O[row]]);
    }
    return board;
}

function checkBoardForBingo(boardData, markedNumbers, calledNumbers) {
    const calledNums = calledNumbers.map(cn => {
        const m = cn.match(/\d+/);
        return m ? parseInt(m[0]) : cn;
    });
    
    for (let row = 0; row < 5; row++) {
        let complete = true;
        for (let col = 0; col < 5; col++) {
            const cell = boardData[row][col];
            if (cell !== 'FREE' && !markedNumbers.includes(cell) && !calledNums.includes(cell)) {
                complete = false;
                break;
            }
        }
        if (complete) return true;
    }
    
    for (let col = 0; col < 5; col++) {
        let complete = true;
        for (let row = 0; row < 5; row++) {
            const cell = boardData[row][col];
            if (cell !== 'FREE' && !markedNumbers.includes(cell) && !calledNums.includes(cell)) {
                complete = false;
                break;
            }
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

function generateUniqueNumber(calledNumbers) {
    if (calledNumbers.length >= 75) return null;
    const letters = ['B','I','N','G','O'];
    const ranges = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] };
    let attempts = 0;
    while (attempts < 100) {
        const letter = letters[Math.floor(Math.random() * 5)];
        const [min, max] = ranges[letter];
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        const candidate = `${letter}${num}`;
        if (!calledNumbers.includes(candidate)) return candidate;
        attempts++;
    }
    return null;
}

async function getNextGameNumber() {
    try {
        const res = await pool.query("SELECT COALESCE(MAX(game_number), 0) + 1 FROM multiplayer_games WHERE DATE(created_at) = CURRENT_DATE");
        return res.rows[0].coalesce;
    } catch(e) { return 1; }
}

// ==================== GAME CREATION & FLOW ====================
async function createMultiplayerGame() {
    const gameId = 'GAME_' + Date.now().toString(36);
    const gameNumber = await getNextGameNumber();
    const selectionEndTime = new Date(Date.now() + GAME_CONFIG.SELECTION_TIME * 1000);
    
    try {
        await pool.query(
            `INSERT INTO multiplayer_games (id, game_number, status, selection_end_time) 
             VALUES ($1, $2, $3, $4)`,
            [gameId, gameNumber, 'waiting', selectionEndTime.toISOString()]
        );
        
        console.log(`🆕 Game #${gameNumber} created`);
        
        setTimeout(async () => {
            await checkAndStartGame(gameId);
        }, GAME_CONFIG.SELECTION_TIME * 1000);
        
        return { success: true, gameId, gameNumber };
    } catch (error) {
        console.error('Game creation error:', error);
        return { success: false };
    }
}

async function checkAndStartGame(gameId) {
    try {
        const gameRes = await pool.query(`SELECT status FROM multiplayer_games WHERE id = $1`, [gameId]);
        if (gameRes.rows.length === 0) return;
        if (gameRes.rows[0].status !== 'waiting') return;
        
        const playerRes = await pool.query(`SELECT COUNT(*) FROM game_players WHERE game_id = $1`, [gameId]);
        const playerCount = parseInt(playerRes.rows[0].count);
        
        if (playerCount >= GAME_CONFIG.MIN_PLAYERS) {
            await startGamePlay(gameId);
        } else {
            await cancelGame(gameId);
        }
    } catch (error) {
        console.error('Check game error:', error);
    }
}

async function startGamePlay(gameId) {
    try {
        await pool.query(
            `UPDATE multiplayer_games SET status = 'shuffling', start_time = NOW() WHERE id = $1`,
            [gameId]
        );
        
        broadcastToGame(gameId, { type: 'game_status', status: 'shuffling', message: '🎮 GAME STARTING! Shuffling...' });
        
        setTimeout(async () => {
            await pool.query(
                `UPDATE multiplayer_games 
                 SET status = 'active', end_time = NOW() + INTERVAL '${GAME_CONFIG.GAME_DURATION/1000} seconds', 
                     called_numbers = '[]'::jsonb
                 WHERE id = $1`,
                [gameId]
            );
            
            broadcastToGame(gameId, { type: 'game_status', status: 'active', message: '🎮 GAME ACTIVE!' });
            
            callGameNumbers(gameId);
            
            setTimeout(async () => {
                const check = await pool.query(`SELECT status FROM multiplayer_games WHERE id = $1`, [gameId]);
                if (check.rows[0]?.status === 'active') {
                    await endGameNoWinner(gameId);
                }
            }, GAME_CONFIG.GAME_DURATION);
            
        }, GAME_CONFIG.SHUFFLE_TIME * 1000);
        
    } catch (error) {
        console.error('Start game error:', error);
    }
}

async function callGameNumbers(gameId) {
    try {
        const gameRes = await pool.query(
            `SELECT called_numbers, status FROM multiplayer_games WHERE id = $1 AND status = 'active'`,
            [gameId]
        );
        if (gameRes.rows.length === 0) return;
        
        let called = gameRes.rows[0].called_numbers || [];
        if (called.length >= GAME_CONFIG.MAX_CALLS) {
            await endGameNoWinner(gameId);
            return;
        }
        
        const newNumber = generateUniqueNumber(called);
        if (!newNumber) {
            await endGameNoWinner(gameId);
            return;
        }
        
        called.push(newNumber);
        await pool.query(
            `UPDATE multiplayer_games SET called_numbers = $1, current_call = $2 WHERE id = $3`,
            [JSON.stringify(called), newNumber, gameId]
        );
        
        broadcastToGame(gameId, {
            type: 'number_called',
            number: newNumber,
            calledNumbers: called,
            callCount: called.length
        });
        
        const winners = await checkForWinners(gameId);
        if (winners.length > 0) {
            await declareWinners(gameId, winners);
            return;
        }
        
        setTimeout(() => callGameNumbers(gameId), GAME_CONFIG.CALL_INTERVAL);
        
    } catch (error) {
        console.error('Call numbers error:', error);
    }
}

async function checkForWinners(gameId) {
    try {
        const playersRes = await pool.query(
            `SELECT user_id, boards, marked_numbers FROM game_players WHERE game_id = $1 AND has_bingo = false`,
            [gameId]
        );
        if (playersRes.rows.length === 0) return [];
        
        const gameRes = await pool.query(`SELECT called_numbers FROM multiplayer_games WHERE id = $1`, [gameId]);
        const called = gameRes.rows[0]?.called_numbers || [];
        const calledNums = called.map(c => { const m = c.match(/\d+/); return m ? parseInt(m[0]) : c; });
        
        const winners = [];
        for (const p of playersRes.rows) {
            const boards = JSON.parse(p.boards);
            const marked = p.marked_numbers ? JSON.parse(p.marked_numbers) : [];
            for (const board of boards) {
                if (checkBoardForBingo(board.boardData, marked, calledNums)) {
                    winners.push({ userId: p.user_id, boardNumber: board.boardNumber, boardId: board.boardId });
                    break;
                }
            }
        }
        return winners;
    } catch (error) {
        console.error('Check winners error:', error);
        return [];
    }
}

async function declareWinners(gameId, winners) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const gameRes = await client.query(`SELECT prize_pool FROM multiplayer_games WHERE id = $1`, [gameId]);
        const prizePool = parseFloat(gameRes.rows[0]?.prize_pool) || 0;
        const prizePerWinner = Math.floor(prizePool / winners.length);
        
        for (const w of winners) {
            const user = users[w.userId];
            if (user) {
                user.balance += prizePerWinner;
                user.totalWon = (user.totalWon || 0) + prizePerWinner;
                if (user.chatId) {
                    await sendTelegramMessage(user.chatId,
                        `🎉 *BINGO! YOU WON!*\n\n🏆 Prize: ${prizePerWinner} ETB\n💰 New Balance: ${user.balance} ETB`
                    );
                }
            }
            await client.query(`UPDATE game_players SET has_bingo = true WHERE game_id = $1 AND user_id = $2`, [gameId, w.userId]);
        }
        
        await client.query(
            `UPDATE multiplayer_games SET status = 'completed', winner_id = $1, end_time = NOW() WHERE id = $2`,
            [winners[0]?.userId, gameId]
        );
        
        await client.query('COMMIT');
        saveUsers();
        
        broadcastToGame(gameId, {
            type: 'game_completed',
            winners: winners.map(w => ({ userId: w.userId, username: users[w.userId]?.username || 'Player' })),
            prizePerWinner
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Declare winners error:', error);
    } finally {
        client.release();
    }
}

async function endGameNoWinner(gameId) {
    try {
        await pool.query(`UPDATE multiplayer_games SET status = 'completed', end_time = NOW() WHERE id = $1`, [gameId]);
        broadcastToGame(gameId, { type: 'game_ended', message: 'No winner this game!' });
    } catch (error) {
        console.error('End game error:', error);
    }
}

async function cancelGame(gameId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const players = await client.query(`SELECT user_id, boards FROM game_players WHERE game_id = $1`, [gameId]);
        for (const p of players.rows) {
            const boards = JSON.parse(p.boards);
            const refund = boards.length * GAME_CONFIG.BOARD_PRICE;
            const user = users[p.user_id];
            if (user) {
                user.balance += refund;
                if (user.chatId) {
                    await sendTelegramMessage(user.chatId, `🔄 Game Cancelled - Refund: ${refund} ETB`);
                }
            }
        }
        
        await client.query(`UPDATE multiplayer_games SET status = 'cancelled', end_time = NOW() WHERE id = $1`, [gameId]);
        await client.query('COMMIT');
        saveUsers();
        
        setTimeout(() => createMultiplayerGame(), 2000);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Cancel game error:', error);
    } finally {
        client.release();
    }
}

async function joinMultiplayerGame(gameId, userId, boardCount, boardNumbers) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const user = users[userId];
        if (!user) throw new Error('User not found');
        
        const totalCost = boardCount * GAME_CONFIG.BOARD_PRICE;
        if (user.balance < totalCost) throw new Error('Insufficient balance');
        
        const boards = [];
        for (let i = 0; i < boardCount; i++) {
            boards.push({
                boardNumber: boardNumbers[i] || Math.floor(Math.random() * 400) + 1,
                boardData: generateBingoBoard(),
                markedNumbers: [],
                hasBingo: false,
                boardId: `B${i+1}`
            });
        }
        
        await client.query(
            `INSERT INTO game_players (game_id, user_id, boards, bet_amount) VALUES ($1, $2, $3, $4)`,
            [gameId, userId, JSON.stringify(boards), totalCost]
        );
        
        user.balance -= totalCost;
        saveUsers();
        
        const prizeContribution = totalCost * (GAME_CONFIG.PRIZE_POOL_PERCENT / 100);
        await client.query(`UPDATE multiplayer_games SET prize_pool = prize_pool + $1 WHERE id = $2`, [prizeContribution, gameId]);
        
        const playerRes = await client.query(`SELECT COUNT(*) FROM game_players WHERE game_id = $1`, [gameId]);
        const playerCount = parseInt(playerRes.rows[0].count);
        await client.query(`UPDATE multiplayer_games SET players_count = $1 WHERE id = $2`, [playerCount, gameId]);
        
        const gameRes = await client.query(`SELECT selection_end_time, prize_pool FROM multiplayer_games WHERE id = $1`, [gameId]);
        const selectionTimeLeft = Math.max(0, Math.floor((new Date(gameRes.rows[0].selection_end_time) - new Date()) / 1000));
        
        if (playerCount >= GAME_CONFIG.MIN_PLAYERS) {
            const statusRes = await client.query(`SELECT status FROM multiplayer_games WHERE id = $1`, [gameId]);
            if (statusRes.rows[0].status === 'waiting') {
                await client.query(
                    `UPDATE multiplayer_games SET status = 'shuffling', start_time = NOW() WHERE id = $1`,
                    [gameId]
                );
                setTimeout(() => startGamePlay(gameId), 5000);
            }
        }
        
        await client.query('COMMIT');
        
        return {
            success: true,
            gameId,
            boards,
            prizePool: parseFloat(gameRes.rows[0].prize_pool) || 0,
            playerCount,
            selectionTimeLeft
        };
        
    } catch (error) {
        await client.query('ROLLBACK');
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}

async function getGameState(gameId, userId) {
    try {
        const gameRes = await pool.query(`SELECT * FROM multiplayer_games WHERE id = $1`, [gameId]);
        if (gameRes.rows.length === 0) return null;
        const game = gameRes.rows[0];
        
        const playerRes = await pool.query(`SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2`, [gameId, userId]);
        
        const playersRes = await pool.query(`
            SELECT gp.user_id, gp.boards, u.username 
            FROM game_players gp
            LEFT JOIN (SELECT key::bigint as id, value->>'username' as username FROM json_each_text($1::json)) u 
            ON gp.user_id = u.id
            WHERE gp.game_id = $2
        `, [JSON.stringify(users), gameId]);
        
        return {
            game: {
                id: game.id,
                gameNumber: game.game_number,
                status: game.status,
                prizePool: parseFloat(game.prize_pool) || 0,
                calledNumbers: game.called_numbers || [],
                currentCall: game.current_call,
                players: playersRes.rows.length,
                playerList: playersRes.rows.map(p => p.username || `Player ${p.user_id}`),
                startTime: game.start_time,
                endTime: game.end_time,
                selectionEndTime: game.selection_end_time,
                timeLeft: game.end_time ? Math.max(0, new Date(game.end_time) - new Date()) : 0
            },
            player: playerRes.rows[0] ? {
                boards: JSON.parse(playerRes.rows[0].boards),
                markedNumbers: playerRes.rows[0].marked_numbers ? JSON.parse(playerRes.rows[0].marked_numbers) : [],
                hasBingo: playerRes.rows[0].has_bingo
            } : null
        };
    } catch (error) {
        console.error('Get game state error:', error);
        return null;
    }
}

// ==================== TELEGRAM FUNCTIONS ====================
async function sendTelegramMessage(chatId, text, replyMarkup = null) {
    try {
        const payload = { chat_id: chatId, text, parse_mode: 'Markdown' };
        if (replyMarkup) payload.reply_markup = replyMarkup;
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, payload);
    } catch (error) {
        console.error('Telegram send error:', error.message);
    }
}

// ==================== API ENDPOINTS ====================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/multiplayer/games', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT mg.id, mg.game_number, mg.status, mg.prize_pool, mg.selection_end_time,
                   COUNT(gp.user_id) as player_count
            FROM multiplayer_games mg
            LEFT JOIN game_players gp ON mg.id = gp.game_id
            WHERE mg.status IN ('waiting', 'shuffling')
            GROUP BY mg.id
            ORDER BY mg.created_at ASC
        `);
        
        const games = result.rows.map(row => ({
            id: row.id,
            gameNumber: row.game_number,
            players: parseInt(row.player_count),
            prizePool: parseFloat(row.prize_pool),
            status: row.status,
            timeLeft: Math.max(0, Math.floor((new Date(row.selection_end_time) - new Date()) / 1000))
        }));
        
        res.json({ success: true, games });
    } catch (error) {
        res.json({ success: false, games: [] });
    }
});

app.post('/api/multiplayer/join', async (req, res) => {
    try {
        const { userId, boardCount = 1, boardNumbers = [] } = req.body;
        
        let gameId = null;
        const activeGames = await pool.query(
            `SELECT id FROM multiplayer_games WHERE status = 'waiting' LIMIT 1`
        );
        
        if (activeGames.rows.length > 0) {
            gameId = activeGames.rows[0].id;
        } else {
            const newGame = await createMultiplayerGame();
            if (!newGame.success) return res.json({ success: false, error: 'Failed to create game' });
            gameId = newGame.gameId;
        }
        
        const result = await joinMultiplayerGame(gameId, userId, boardCount, boardNumbers);
        res.json(result);
        
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/multiplayer/state/:gameId/:userId', async (req, res) => {
    const state = await getGameState(req.params.gameId, req.params.userId);
    res.json(state ? { success: true, ...state } : { success: false, error: 'Game not found' });
});

app.post('/api/multiplayer/claim', async (req, res) => {
    try {
        const { gameId, userId, boardId } = req.body;
        
        const winners = await checkForWinners(gameId);
        const playerWinner = winners.find(w => w.userId == userId);
        
        if (playerWinner) {
            await declareWinners(gameId, winners);
            const gameRes = await pool.query(`SELECT prize_pool FROM multiplayer_games WHERE id = $1`, [gameId]);
            const prize = Math.floor(parseFloat(gameRes.rows[0]?.prize_pool) / winners.length);
            res.json({ success: true, prize });
        } else {
            res.json({ success: false, error: 'No BINGO pattern found' });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/api/user/:id/balance', (req, res) => {
    const user = users[req.params.id];
    if (user) {
        res.json({ success: true, balance: user.balance, username: user.username });
    } else {
        users[req.params.id] = {
            id: req.params.id,
            username: 'Player_' + req.params.id.slice(-4),
            balance: 100,
            registered: false
        };
        saveUsers();
        res.json({ success: true, balance: 100, username: users[req.params.id].username });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

async function startGameCycle() {
    await createMultiplayerGame();
    setInterval(async () => {
        const active = await pool.query(`SELECT COUNT(*) FROM multiplayer_games WHERE status = 'waiting'`);
        if (parseInt(active.rows[0].count) === 0) {
            await createMultiplayerGame();
        }
    }, 30000);
}

server.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🎮 Game URL: ${RENDER_URL}`);
    await startGameCycle();
    console.log('✅ All systems ready');
});

process.on('SIGTERM', () => {
    console.log('Shutting down...');
    server.close();
    process.exit(0);
});
