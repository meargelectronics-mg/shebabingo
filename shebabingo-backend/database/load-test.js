const { Pool } = require('pg');
require('dotenv').config();

async function loadTest() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  console.log('⚡ Running database load test...\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    ssl: false
  });

  const startTime = Date.now();
  const concurrentUsers = 10; // Start with 10, not 50
  const promises = [];

  for (let i = 0; i < concurrentUsers; i++) {
    promises.push(simulatePlayer(i, pool));
  }

  async function simulatePlayer(playerId, pool) {
    const client = await pool.connect();
    const telegramId = 1000000000 + playerId;
    
    try {
      await client.query('BEGIN');
      
      // 1. Register/update user
      await client.query(
        `INSERT INTO users (telegram_id, username, balance) 
         VALUES ($1, $2, 100.00) 
         ON CONFLICT (telegram_id) DO UPDATE SET balance = 100.00`,
        [telegramId, `loadtest_player_${playerId}`]
      );
      
      // 2. Get user ID
      const user = await client.query(
        'SELECT id FROM users WHERE telegram_id = $1',
        [telegramId]
      );
      
      if (user.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const userId = user.rows[0].id;
      
      // 3. Create deposit
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, status, payment_method)
         VALUES ($1, 'deposit', 50.00, 'completed', 'telebirr')`,
        [userId]
      );
      
      await client.query('COMMIT');
      return { playerId, success: true };
      
    } catch (error) {
      await client.query('ROLLBACK');
      return { playerId, success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  const results = await Promise.all(promises);
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  const successes = results.filter(r => r.success).length;
  const failures = results.filter(r => !r.success).length;
  
  console.log(`📊 Load Test Results:`);
  console.log(`   Time: ${duration.toFixed(2)} seconds`);
  console.log(`   Concurrent Users: ${concurrentUsers}`);
  console.log(`   Successful: ${successes}`);
  console.log(`   Failed: ${failures}`);
  console.log(`   Throughput: ${(concurrentUsers / duration).toFixed(2)} users/sec\n`);
  
  if (failures > 0) {
    console.log('⚠️  Failures (first 3):');
    results.filter(r => !r.success).slice(0, 3).forEach(r => {
      console.log(`   Player ${r.playerId}: ${r.error}`);
    });
  }
  
  // Cleanup test data
  console.log('\n🧹 Cleaning up test data...');
  for (let i = 0; i < concurrentUsers; i++) {
    const telegramId = 1000000000 + i;
    try {
      await pool.query(
        `DELETE FROM transactions 
         WHERE user_id IN (SELECT id FROM users WHERE telegram_id = $1)`,
        [telegramId]
      );
      await pool.query(
        'DELETE FROM users WHERE telegram_id = $1',
        [telegramId]
      );
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  
  console.log('✅ Cleanup complete');
  await pool.end();
}

loadTest().catch(console.error);