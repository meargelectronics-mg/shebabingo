const pool = require('../config/database');

class Transaction {
  static async create(user_id, telegram_id, type, amount, status = 'pending', metadata = {}) {
    const result = await pool.query(
      `INSERT INTO transactions 
       (user_id, telegram_id, type, amount, status, metadata, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW()) 
       RETURNING *`,
      [user_id, telegram_id, type, amount, status, JSON.stringify(metadata)]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status, admin_notes = null) {
    const result = await pool.query(
      `UPDATE transactions 
       SET status = $1, admin_notes = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, admin_notes, id]
    );
    return result.rows[0];
  }

  static async getPendingDeposits() {
    const result = await pool.query(
      `SELECT t.*, u.username, u.balance as user_balance
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.status = 'pending' AND t.type = 'deposit'
       ORDER BY t.created_at DESC`
    );
    return result.rows;
  }

  static async getPendingWithdrawals() {
    const result = await pool.query(
      `SELECT t.*, u.username, u.balance as user_balance
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.status = 'processing' AND t.type = 'withdraw'
       ORDER BY t.created_at DESC`
    );
    return result.rows;
  }

  static async getUserTransactions(telegram_id, limit = 50) {
    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE telegram_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [telegram_id, limit]
    );
    return result.rows;
  }

  static async getCommissionStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalResult, todayResult] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total 
         FROM transactions 
         WHERE type = 'commission' AND status = 'completed'`
      ),
      pool.query(
        `SELECT COALESCE(SUM(amount), 0) as today 
         FROM transactions 
         WHERE type = 'commission' AND status = 'completed' 
         AND created_at >= $1`,
        [today]
      )
    ]);
    
    return {
      total: parseFloat(totalResult.rows[0].total),
      today: parseFloat(todayResult.rows[0].today)
    };
  }
}

module.exports = Transaction;