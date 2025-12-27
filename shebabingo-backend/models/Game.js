const pool = require('../config/database');

class Game {
  static async create(game_id) {
    const result = await pool.query(
      `INSERT INTO games (game_id, status, created_at) 
       VALUES ($1, 'waiting', NOW()) 
       RETURNING *`,
      [game_id]
    );
    return result.rows[0];
  }

  static async findById(game_id) {
    const result = await pool.query(
      'SELECT * FROM games WHERE game_id = $1',
      [game_id]
    );
    return result.rows[0];
  }

  static async update(game_id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
    
    fields.push('updated_at = NOW()');
    values.push(game_id);
    
    const result = await pool.query(
      `UPDATE games SET ${fields.join(', ')} WHERE game_id = $${paramCount} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  static async addBet(game_id, bet_amount, commission) {
    await pool.query(
      `UPDATE games 
       SET total_bets = COALESCE(total_bets, 0) + $1,
           commission = COALESCE(commission, 0) + $2,
           total_players = COALESCE(total_players, 0) + 1
       WHERE game_id = $3`,
      [bet_amount, commission, game_id]
    );
  }

  static async addWinner(game_id, winner_data) {
    await pool.query(
      `UPDATE games 
       SET winners = winners || $1::jsonb,
           status = 'finished'
       WHERE game_id = $2`,
      [JSON.stringify(winner_data), game_id]
    );
  }

  static async getAllGames(limit = 50) {
    const result = await pool.query(
      `SELECT * FROM games 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

module.exports = Game;