const pool = require('../config/database');

class PlayerBet {
  static async create(user_id, game_id, board_numbers, bet_amount) {
    const result = await pool.query(
      `INSERT INTO player_bets 
       (user_id, game_id, board_numbers, bet_amount, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [user_id, game_id, board_numbers, bet_amount]
    );
    return result.rows[0];
  }

  static async markAsWinner(id, prize_amount) {
    const result = await pool.query(
      `UPDATE player_bets 
       SET won = TRUE, prize_amount = $1 
       WHERE id = $2 
       RETURNING *`,
      [prize_amount, id]
    );
    return result.rows[0];
  }

  static async getUserBets(telegram_id, limit = 20) {
    const result = await pool.query(
      `SELECT pb.*, g.game_id, g.status as game_status
       FROM player_bets pb
       JOIN users u ON pb.user_id = u.id
       JOIN games g ON pb.game_id = g.game_id
       WHERE u.telegram_id = $1
       ORDER BY pb.created_at DESC
       LIMIT $2`,
      [telegram_id, limit]
    );
    return result.rows;
  }
}

module.exports = PlayerBet;