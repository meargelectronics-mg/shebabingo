const { Pool } = require('pg');
require('dotenv').config();

async function testDatabase() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    console.log('💡 Add this to your .env file:');
    console.log('   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/shebabingo');
    process.exit(1);
  }

  console.log('🧪 Testing PostgreSQL connection...\n');
  console.log('📊 Using DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    // Test 1: Basic connection
    const client = await pool.connect();
    console.log('✅ 1. Connection successful');
    
    // Test 2: Check tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`✅ 2. Found ${tables.rows.length} tables:`);
    tables.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });
    
    // Test 3: Check if schema is initialized
    const expectedTables = ['users', 'transactions', 'games', 'game_players'];
    const missingTables = expectedTables.filter(table => 
      !tables.rows.find(t => t.table_name === table)
    );
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables.join(', '));
      console.log('💡 Run: psql -U postgres -d shebabingo -f database/schema.sql');
    } else {
      console.log('✅ All expected tables exist');
    }
    
    // Test 4: Insert test data (only if tables exist)
    if (missingTables.length === 0) {
      console.log('\n🧪 Testing CRUD operations...');
      
      // Create test user
      const testUser = await client.query(`
        INSERT INTO users (telegram_id, username, balance) 
        VALUES (999999999, 'test_player', 100.00)
        ON CONFLICT (telegram_id) DO UPDATE SET balance = 100.00
        RETURNING id, telegram_id, username, balance
      `);
      console.log(`✅ 4. Test user: ${testUser.rows[0].username} (ID: ${testUser.rows[0].id})`);
      
      // Create test transaction
      const testTx = await client.query(`
        INSERT INTO transactions (user_id, type, amount, status, payment_method)
        VALUES ($1, 'deposit', 50.00, 'completed', 'telebirr')
        RETURNING id, type, amount
      `, [testUser.rows[0].id]);
      console.log(`✅ 5. Test transaction: ${testTx.rows[0].type} $${testTx.rows[0].amount}`);
      
      // Create test game
      const testGame = await client.query(`
        INSERT INTO games (status, bet_amount, prize_pool) 
        VALUES ('waiting', 10.00, 0.00)
        RETURNING id, status
      `);
      console.log(`✅ 6. Test game: ${testGame.rows[0].status} (ID: ${testGame.rows[0].id})`);
      
      // Cleanup
      await client.query('DELETE FROM transactions WHERE user_id = $1', [testUser.rows[0].id]);
      await client.query('DELETE FROM game_players WHERE user_id = $1', [testUser.rows[0].id]);
      await client.query('DELETE FROM games WHERE id = $1', [testGame.rows[0].id]);
      await client.query('DELETE FROM users WHERE id = $1', [testUser.rows[0].id]);
      console.log('✅ 7. Test data cleaned up');
    }
    
    client.release();
    console.log('\n🎉 Database is ready!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting steps:');
    console.log('   1. Is PostgreSQL running?');
    console.log('      • Windows: Check "Services" for PostgreSQL');
    console.log('      • Run: services.msc');
    console.log('');
    console.log('   2. Is the database created?');
    console.log('      • Run in cmd: psql -U postgres -c "CREATE DATABASE shebabingo;"');
    console.log('');
    console.log('   3. Is your password correct?');
    console.log('      • Check .env file DATABASE_URL password');
    console.log('');
    console.log('   4. Run schema manually:');
    console.log('      • psql -U postgres -d shebabingo -f database/schema.sql');
    console.log('');
    console.log('   5. Quick connection test:');
    console.log('      • psql -U postgres -d shebabingo -c "SELECT 1;"');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase();