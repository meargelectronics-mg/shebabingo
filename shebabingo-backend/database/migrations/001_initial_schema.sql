-- Migration file for initial schema
-- Run this after the basic tables are created

-- Add user level/tier if needed
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;

-- Add referral system if needed
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;

-- Add session tracking for security
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    
    INDEX idx_sessions_token (session_token),
    INDEX idx_sessions_user (user_id)
);

-- Add audit log for important actions
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action)
);