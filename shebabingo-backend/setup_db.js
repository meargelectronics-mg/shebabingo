// setup.js - Database initialization script
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'postgres', // Connect to default database first
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
    });

    try {
        console.log('🔄 Setting up ShebaBingo database...');
        
        // 1. Create database if it doesn't exist
        await pool.query(`CREATE DATABASE ${process.env.DB_NAME || 'shebabingo_db'}`);
        console.log('✅ Database created');
        
        // 2. Connect to the new database
        pool.end();
        
        const appPool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'shebabingo_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
        });
        
        // 3. Read and execute schema
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📊 Creating tables...');
        await appPool.query(schemaSql);
        
        // 4. Insert initial payment methods
        await appPool.query(`
            INSERT INTO payment_methods (name, account_number, account_name, instructions, is_active) 
            VALUES 
            ('Telebirr', '0990204142', 'Fasil', 'Send money to this Telebirr account', TRUE),
            ('CBE Birr', '100023456789', 'Sheba Bingo CBE', 'Send to CBE account', TRUE),
            ('Bank of Abyssinia', '180579656', 'Sheba Bingo BOA', 'Send to BOA account', TRUE)
        `);
        
        console.log('✅ Database setup completed successfully!');
        console.log('\n📋 Tables created:');
        console.log('   • users');
        console.log('   • transactions');
        console.log('   • games');
        console.log('   • game_players');
        console.log('   • admin_earnings');
        console.log('   • audit_log');
        console.log('   • payment_methods');
        
        await appPool.end();
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        // If database already exists, continue with table creation
        if (error.message.includes('already exists')) {
            console.log('ℹ️ Database already exists, creating tables...');
            await createTables();
        }
    }
}

async function createTables() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'shebabingo_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
    });
    
    try {
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ Tables created/updated successfully!');
    } catch (error) {
        console.error('❌ Table creation failed:', error.message);
    } finally {
        await pool.end();
    }
}

setupDatabase();