// ==================== SHEBABINGO DATABASE MODULE ====================
// Save this as: C:\Users\Leul.K\Desktop\shebabingo-pro\shebabingo-backend\database.js

const { Pool } = require('pg');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'shebabingo_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'shebabingo@23',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });
        
        // Test connection on creation
        this.testConnection();
    }

    async testConnection() {
        try {
            const client = await this.pool.connect();
            console.log('✅ Connected to PostgreSQL database');
            
            // Check if tables exist, create if not
            await this.ensureTables();
            
            client.release();
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            // Don't crash - retry in background
            setTimeout(() => this.testConnection(), 5000);
        }
    }

    async ensureTables() {
        try {
            // Create tables if they don't exist
            await this.createTables();
            console.log('✅ Database tables verified');
        } catch (error) {
            console.error('❌ Error ensuring tables:', error);
        }
    }

    async createTables() {
        const createTablesSQL = `
            -- Users table (Simplified for Telegram bot)
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                telegram_id BIGINT UNIQUE NOT NULL,
                username VARCHAR(100),
                balance DECIMAL(10,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT NOW(),
                
                -- Index for fast lookups by telegram_id
                CONSTRAINT unique_telegram_id UNIQUE (telegram_id)
            );

            -- Transactions table (For deposits, withdrawals, bets, wins)
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                
                -- Transaction type: 'deposit', 'withdraw', 'bet', 'win', 'bonus', 'commission'
                type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'bet', 'win', 'bonus', 'commission', 'refund')),
                
                -- Amount (positive always)
                amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
                
                -- Status: 'pending', 'completed', 'rejected', 'cancelled'
                status VARCHAR(20) DEFAULT 'pending' 
                    CHECK (status IN ('pending', 'completed', 'rejected', 'cancelled')),
                
                -- For deposits: stores the SMS text user pasted
                raw_sms_text TEXT,
                
                -- For deposits: payment method (telebirr, cbe, etc.)
                payment_method VARCHAR(50),
                
                -- For deposits: transaction ID from bank/telebirr
                payment_reference VARCHAR(100),
                
                -- JSON metadata for flexibility
                metadata JSONB DEFAULT '{}',
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT NOW(),
                processed_at TIMESTAMP,
                
                -- Admin who processed
                processed_by VARCHAR(100)
            );

            -- Games table (For multiplayer bingo)
            CREATE TABLE IF NOT EXISTS games (
                id SERIAL PRIMARY KEY,
                
                -- Game status: 'waiting', 'active', 'finished', 'cancelled'
                status VARCHAR(20) DEFAULT 'waiting' 
                    CHECK (status IN ('waiting', 'active', 'finished', 'cancelled')),
                
                -- Game settings
                bet_amount DECIMAL(10,2) NOT NULL DEFAULT 10.00,
                prize_pool DECIMAL(10,2) DEFAULT 0.00,
                
                -- Numbers that have been called
                called_numbers JSONB DEFAULT '[]'::jsonb,
                
                -- Winner information
                winner_id INTEGER REFERENCES users(id),
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT NOW(),
                started_at TIMESTAMP,
                finished_at TIMESTAMP
            );

            -- Game players table (Links users to games)
            CREATE TABLE IF NOT EXISTS game_players (
                game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                
                -- Player's bingo board (array of numbers)
                board_numbers JSONB NOT NULL,
                
                -- Numbers marked by player
                marked_numbers JSONB DEFAULT '[]'::jsonb,
                
                -- Has this player declared BINGO?
                has_bingo BOOLEAN DEFAULT FALSE,
                
                -- When did they join
                joined_at TIMESTAMP DEFAULT NOW(),
                
                PRIMARY KEY (game_id, user_id)
            );

            -- Create indexes
            CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
            CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
            CREATE INDEX IF NOT EXISTS idx_game_players_game ON game_players(game_id);
        `;
        
        await this.query(createTablesSQL);
    }

    // ==================== USER OPERATIONS ====================
    async getUserByTelegramId(telegramId) {
        const query = 'SELECT * FROM users WHERE telegram_id = $1';
        const result = await this.query(query, [telegramId]);
        return result.rows[0] || null;
    }

    async createUser(telegramId, username = null) {
        const query = `
            INSERT INTO users (telegram_id, username, balance, created_at)
            VALUES ($1, $2, 0.00, NOW())
            ON CONFLICT (telegram_id) 
            DO UPDATE SET username = EXCLUDED.username
            RETURNING *`;
        
        const result = await this.query(query, [telegramId, username]);
        return result.rows[0];
    }

    async updateUserBalance(userId, amount) {
        const query = `
            UPDATE users 
            SET balance = balance + $1 
            WHERE id = $2 
            RETURNING *`;
        const result = await this.query(query, [amount, userId]);
        return result.rows[0];
    }

    async getUserBalance(userId) {
        const query = 'SELECT balance FROM users WHERE id = $1';
        const result = await this.query(query, [userId]);
        return result.rows[0] ? parseFloat(result.rows[0].balance) : 0;
    }

    // ==================== TRANSACTION OPERATIONS ====================
    async createTransaction(data) {
        const {
            user_id,
            type,
            amount,
            status = 'pending',
            raw_sms_text = null,
            payment_method = null,
            payment_reference = null,
            metadata = {}
        } = data;

        const query = `
            INSERT INTO transactions 
            (user_id, type, amount, status, raw_sms_text, payment_method, 
             payment_reference, metadata, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING *`;
        
        const params = [
            user_id,
            type,
            amount,
            status,
            raw_sms_text,
            payment_method,
            payment_reference,
            metadata
        ];

        const result = await this.query(query, params);
        return result.rows[0];
    }

    async updateTransactionStatus(transactionId, status, metadata = {}, processedBy = null) {
        const query = `
            UPDATE transactions 
            SET status = $1, 
                metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
                processed_at = NOW(),
                processed_by = $3
            WHERE id = $4
            RETURNING *`;
        
        const result = await this.query(query, [
            status, 
            JSON.stringify(metadata), 
            processedBy, 
            transactionId
        ]);
        return result.rows[0];
    }

    async getPendingTransactions(type = null) {
        let query = 'SELECT * FROM transactions WHERE status = $1';
        const params = ['pending'];
        
        if (type) {
            query += ' AND type = $2';
            params.push(type);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await this.query(query, params);
        return result.rows;
    }

    async getTransactionById(transactionId) {
        const query = `
            SELECT t.*, u.telegram_id, u.username, u.balance as user_balance 
            FROM transactions t 
            JOIN users u ON t.user_id = u.id 
            WHERE t.id = $1`;
        
        const result = await this.query(query, [transactionId]);
        return result.rows[0];
    }

    async getUserTransactions(userId, limit = 10) {
        const query = `
            SELECT t.*, u.telegram_id, u.username 
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            WHERE t.user_id = $1
            ORDER BY t.created_at DESC
            LIMIT $2`;
        
        const result = await this.query(query, [userId, limit]);
        return result.rows;
    }

    // ==================== GAME OPERATIONS ====================
    async createGame(betAmount = 10.00) {
        const query = `
            INSERT INTO games (bet_amount, created_at)
            VALUES ($1, NOW())
            RETURNING *`;
        
        const result = await this.query(query, [betAmount]);
        return result.rows[0];
    }

    async getActiveGame() {
        const query = `
            SELECT * FROM games 
            WHERE status IN ('waiting', 'active')
            ORDER BY created_at DESC
            LIMIT 1`;
        
        const result = await this.query(query);
        return result.rows[0] || null;
    }

    async updateGameStatus(gameId, status, data = {}) {
        let query = 'UPDATE games SET status = $1';
        const params = [status];
        let paramCount = 2;
        
        if (status === 'active' && !data.started_at) {
            query += ', started_at = NOW()';
        } else if (status === 'finished' && !data.finished_at) {
            query += ', finished_at = NOW()';
        }
        
        if (data.prize_pool !== undefined) {
            query += `, prize_pool = $${paramCount}`;
            params.push(data.prize_pool);
            paramCount++;
        }
        
        if (data.called_numbers !== undefined) {
            query += `, called_numbers = $${paramCount}`;
            params.push(data.called_numbers);
            paramCount++;
        }
        
        if (data.winner_id !== undefined) {
            query += `, winner_id = $${paramCount}`;
            params.push(data.winner_id);
            paramCount++;
        }
        
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(gameId);
        
        const result = await this.query(query, params);
        return result.rows[0];
    }

    async addPlayerToGame(gameId, userId, boardNumbers) {
        const query = `
            INSERT INTO game_players (game_id, user_id, board_numbers, joined_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (game_id, user_id) 
            DO UPDATE SET board_numbers = EXCLUDED.board_numbers
            RETURNING *`;
        
        const result = await this.query(query, [gameId, userId, boardNumbers]);
        return result.rows[0];
    }

    async markNumberForPlayer(gameId, userId, number) {
        const query = `
            UPDATE game_players 
            SET marked_numbers = COALESCE(marked_numbers, '[]'::jsonb) || $1::jsonb
            WHERE game_id = $2 AND user_id = $3
            RETURNING *`;
        
        const result = await this.query(query, [JSON.stringify([number]), gameId, userId]);
        return result.rows[0];
    }

    async declareBingo(gameId, userId) {
        const query = `
            UPDATE game_players 
            SET has_bingo = TRUE
            WHERE game_id = $1 AND user_id = $2
            RETURNING *`;
        
        const result = await this.query(query, [gameId, userId]);
        return result.rows[0];
    }

    async getGamePlayers(gameId) {
        const query = `
            SELECT gp.*, u.telegram_id, u.username, u.balance
            FROM game_players gp
            JOIN users u ON gp.user_id = u.id
            WHERE gp.game_id = $1`;
        
        const result = await this.query(query, [gameId]);
        return result.rows;
    }

    // ==================== ADMIN STATISTICS ====================
    async getDashboardStats() {
        const stats = {};
        
        // Total users
        const usersResult = await this.query('SELECT COUNT(*) as count FROM users');
        stats.totalUsers = parseInt(usersResult.rows[0].count);
        
        // Total balance
        const balanceResult = await this.query('SELECT SUM(balance) as total FROM users');
        stats.totalBalance = parseFloat(balanceResult.rows[0].total) || 0;
        
        // Total deposits
        const depositsResult = await this.query(`
            SELECT SUM(amount) as total 
            FROM transactions 
            WHERE type = 'deposit' AND status = 'completed'`);
        stats.totalDeposits = parseFloat(depositsResult.rows[0].total) || 0;
        
        // Games played
        const gamesResult = await this.query(`
            SELECT COUNT(*) as count 
            FROM games 
            WHERE status = 'finished'`);
        stats.gamesPlayed = parseInt(gamesResult.rows[0].count);
        
        // Pending transactions
        const pendingResult = await this.query(`
            SELECT COUNT(*) as count 
            FROM transactions 
            WHERE status = 'pending'`);
        stats.pendingTransactions = parseInt(pendingResult.rows[0].count);
        
        return stats;
    }

    // ==================== UTILITY METHODS ====================
    async query(text, params = []) {
        try {
            return await this.pool.query(text, params);
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    }

    async close() {
        await this.pool.end();
    }
}

// Create and export a singleton instance
const db = new Database();
module.exports = db;