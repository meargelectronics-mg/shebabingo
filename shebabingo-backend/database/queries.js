// Common database queries for ShebaBingo

module.exports = {
    // User queries
    GET_USER_BY_TELEGRAM: `
        SELECT u.*, 
               (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id AND t.type = 'win') as wins_count,
               (SELECT SUM(amount) FROM transactions t WHERE t.user_id = u.id AND t.type = 'win') as total_winnings
        FROM users u 
        WHERE u.telegram_id = ?`,

    GET_TOP_PLAYERS: `
        SELECT u.telegram_id, u.username, u.balance,
               COUNT(DISTINCT gp.game_id) as games_played,
               SUM(CASE WHEN t.type = 'win' THEN t.amount ELSE 0 END) as total_won
        FROM users u
        LEFT JOIN game_players gp ON u.id = gp.user_id
        LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'win'
        GROUP BY u.id
        ORDER BY u.balance DESC
        LIMIT 10`,

    // Transaction queries
    GET_DAILY_STATS: `
        SELECT 
            DATE(created_at) as date,
            COUNT(CASE WHEN type = 'deposit' THEN 1 END) as deposits,
            COUNT(CASE WHEN type = 'withdraw' THEN 1 END) as withdrawals,
            COUNT(CASE WHEN type = 'bet' THEN 1 END) as bets,
            SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as deposit_amount,
            SUM(CASE WHEN type = 'withdraw' THEN amount ELSE 0 END) as withdraw_amount
        FROM transactions
        WHERE status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 7`,

    // Game queries
    GET_RECENT_GAMES: `
        SELECT g.*, 
               u.telegram_id as winner_telegram_id,
               u.username as winner_username,
               COUNT(DISTINCT gp.user_id) as player_count
        FROM games g
        LEFT JOIN users u ON g.winner_id = u.id
        LEFT JOIN game_players gp ON g.id = gp.game_id
        WHERE g.status = 'finished'
        GROUP BY g.id, u.id
        ORDER BY g.finished_at DESC
        LIMIT 10`
};