-- ==================== SHEBABINGO DATABASE SCHEMA ====================
-- Designed for easy Telegram bot integration like Geez Bingo
-- Save this as: shebabingo-backend/database/schema.sql

-- 1. Users table (Simplified for Telegram bot)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(100),
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Index for fast lookups by telegram_id
    INDEX idx_users_telegram (telegram_id)
);

-- 2. Transactions table (For deposits, withdrawals, bets, wins)
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
    
    -- Indexes
    INDEX idx_transactions_user (user_id),
    INDEX idx_transactions_status (status),
    INDEX idx_transactions_created (created_at DESC)
);

-- 3. Games table (For multiplayer bingo)
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


-- 4. Game players table (Links users to games)
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

-- Add these to your schema.sql after table creation:

-- Optimize frequently queried columns
CREATE INDEX IF NOT EXISTS idx_users_balance ON users(balance DESC);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON transactions(type, status);
CREATE INDEX IF NOT EXISTS idx_game_players_bingo ON game_players(has_bingo, game_id);

-- Partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_active_games ON games(id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pending_transactions ON transactions(id) 
WHERE status = 'pending' AND type IN ('deposit', 'withdraw');

-- JSONB indexes for faster board queries
CREATE INDEX IF NOT EXISTS idx_board_numbers ON game_players USING GIN (board_numbers);
CREATE INDEX IF NOT EXISTS idx_marked_numbers ON game_players USING GIN (marked_numbers);
-- Add to your existing schema.sql:

-- 5. Commission History (For owner earnings tracking)
CREATE TABLE IF NOT EXISTS commission_history (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    total_bets DECIMAL(10,2),
    commission_rate DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    commission_date TIMESTAMP DEFAULT NOW()
);

-- 6. Withdrawal History (Separate from transactions for clarity)
CREATE TABLE IF NOT EXISTS withdrawal_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    telegram_id BIGINT,
    amount DECIMAL(10,2),
    account_number VARCHAR(100),
    account_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    processed_by INTEGER,
    processed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Admin Logs (For security auditing)
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Payment Accounts (Store your bank/telebirr details securely)
CREATE TABLE IF NOT EXISTS payment_accounts (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    account_name VARCHAR(100),
    account_number VARCHAR(100) NOT NULL,
    qr_code_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    daily_limit DECIMAL(10,2),
    current_balance DECIMAL(10,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- 9. Game Settings (Configuration table)
CREATE TABLE IF NOT EXISTS game_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default payment accounts (YOUR ACTUAL ACCOUNTS)
INSERT INTO payment_accounts (provider, account_name, account_number, is_active) VALUES
('telebirr', 'ShebaBingo', '0914834341', TRUE),
('cbe', 'ShebaBingo Account', '100012234582', TRUE),
('boa', 'ShebaBingo', '65637448', TRUE)
ON CONFLICT (provider, account_number) DO NOTHING;

-- Insert default game settings
INSERT INTO game_settings (setting_key, setting_value, setting_type, description) VALUES
('bet_amount', '10', 'number', 'Bet amount per board'),
('max_boards_per_player', '3', 'number', 'Maximum boards a player can buy'),
('total_boards', '400', 'number', 'Total available boards per game'),
('selection_time', '25', 'number', 'Board selection time in seconds'),
('commission_rate', '0.20', 'number', 'Owner commission rate (20%)'),
('min_deposit', '10', 'number', 'Minimum deposit amount'),
('min_withdrawal', '50', 'number', 'Minimum withdrawal amount'),
('minimum_players', '5', 'number', 'Minimum players to start game'),
('admin_password', 'shebabingo@23', 'string', 'Admin panel password')
ON CONFLICT (setting_key) DO NOTHING;

