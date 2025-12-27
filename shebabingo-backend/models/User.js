const pool = require('../config/database');

class User {
  static async create(telegram_id, username = null) {
    const result = await pool.query(
      `INSERT INTO users (telegram_id, username, balance, created_at) 
       VALUES ($1, $2, 0.00, NOW()) 
       RETURNING id, telegram_id, username, balance, created_at`,
      [telegram_id, username || `Player_${telegram_id}`]
    );
    return result.rows[0];
  }

  static async findByTelegramId(telegram_id) {
    const result = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegram_id]
    );
    return result.rows[0];
  }

  static async updateBalance(telegram_id, amount, operation = 'add') {
    const query = operation === 'add' 
      ? 'UPDATE users SET balance = balance + $1 WHERE telegram_id = $2 RETURNING balance'
      : 'UPDATE users SET balance = balance - $1 WHERE telegram_id = $2 RETURNING balance';
    
    const result = await pool.query(query, [amount, telegram_id]);
    return result.rows[0]?.balance || 0;
  }

  static async getBalance(telegram_id) {
    const result = await pool.query(
      'SELECT balance FROM users WHERE telegram_id = $1',
      [telegram_id]
    );
    return parseFloat(result.rows[0]?.balance) || 0;
  }

  static async canPlay(telegram_id, betAmount) {
    const balance = await this.getBalance(telegram_id);
    return {
      canPlay: balance >= betAmount,
      balance,
      deficit: Math.max(0, betAmount - balance)
    };
  }

  static async getAllUsers(limit = 100, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }
}

module.exports = User;