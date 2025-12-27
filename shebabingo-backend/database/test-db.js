const { Pool } = require('pg');
require('dotenv').config();

async function testDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    console.log('🧪 Testing PostgreSQL connection...\n');
    
    // Test 1: Basic connection
    const client = await pool.connect();
    console.log('✅ 1. Connection successful');
    
    // Test 2: Check tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`✅ 2. Found ${tables.rows.length} tables`);
    
    // Test 3: Insert test user
    const testUser = await client.query(`
      INSERT INTO users (telegram_id, username, balance) 
      VALUES (123456789, 'test_player', 100.00)
      RETURNING id, telegram_id
    `);
    console.log(`✅ 3. Test user created: ID ${testUser.rows[0].id}`);
    
    // Test 4: Create test game
    const testGame = await client.query(`
      INSERT INTO games (status, bet_amount) 
      VALUES ('waiting', 10.00)
      RETURNING id
    `);
    console.log(`✅ 4. Test game created: ID ${testGame.rows[0].id}`);
    
    // Test 5: Test transactions
    const testTx = await client.query(`
      INSERT INTO transactions (user_id, type, amount, status, payment_method)
      VALUES ($1, 'deposit', 50.00, 'completed', 'telebirr')
      RETURNING id
    `, [testUser.rows[0].id]);
    console.log(`✅ 5. Test transaction created: ID ${testTx.rows[0].id}`);
    
    // Test 6: Cleanup
    await client.query('DELETE FROM transactions WHERE user_id = $1', [testUser.rows[0].id]);
    await client.query('DELETE FROM game_players WHERE user_id = $1', [testUser.rows[0].id]);
    await client.query('DELETE FROM games WHERE id = $1', [testGame.rows[0].id]);
    await client.query('DELETE FROM users WHERE id = $1', [testUser.rows[0].id]);
    console.log('✅ 6. Test data cleaned up');
    
    client.release();
    console.log('\n🎉 All database tests passed! Ready for live game.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Is PostgreSQL service running?');
    console.log('   2. Check DATABASE_URL in .env:', process.env.DATABASE_URL);
    console.log('   3. Run schema.sql to create tables');
    process.exit(1);
  }
}

testDatabase();