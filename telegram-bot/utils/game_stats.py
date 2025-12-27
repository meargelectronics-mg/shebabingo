import random
from datetime import datetime, timedelta
from typing import Dict, List
from .database import Database

class GameStatistics:
    def __init__(self):
        self.db = Database()
    
    def get_platform_stats(self) -> Dict:
        """Get platform statistics"""
        users = self.db.load_json(self.db.users_file)
        
        total_balance = sum(user.get("balance", 0) for user in users.values())
        total_users = len(users)
        
        # Calculate active users (last 24 hours)
        active_users = 0
        for user in users.values():
            last_active = user.get("last_active")
            if last_active:
                last_active_dt = datetime.fromisoformat(last_active)
                if datetime.now() - last_active_dt < timedelta(hours=24):
                    active_users += 1
        
        # Simulate some game activity
        total_wagered = sum(user.get("total_wagered", 0) for user in users.values())
        total_won = sum(user.get("total_won", 0) for user in users.values())
        
        # Simulate active games
        active_games = random.randint(1, min(20, total_users // 2))
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_balance": total_balance,
            "total_wagered": total_wagered,
            "total_won": total_won,
            "active_games": active_games,
            "platform_profit": total_wagered - total_won
        }
    
    def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Get top players by balance"""
        users = self.db.load_json(self.db.users_file)
        
        # Sort users by balance
        sorted_users = sorted(
            users.values(),
            key=lambda x: x.get("balance", 0),
            reverse=True
        )
        
        leaderboard = []
        for i, user in enumerate(sorted_users[:limit], 1):
            games_played = user.get("game_stats", {}).get("games_played", 0)
            games_won = user.get("game_stats", {}).get("games_won", 0)
            win_rate = (games_won / games_played * 100) if games_played > 0 else 0
            
            leaderboard.append({
                "rank": i,
                "user_id": user.get("user_id"),
                "username": user.get("username", f"User_{user.get('user_id')}"),
                "first_name": user.get("first_name", "Unknown"),
                "balance": user.get("balance", 0),
                "games_played": games_played,
                "win_rate": round(win_rate, 1),
                "total_won": user.get("total_won", 0)
            })
        
        return leaderboard
    
    def update_user_game_stats(self, user_id: int, bet_amount: float, won: bool = False, win_amount: float = 0):
        """Update user game statistics"""
        user = self.db.get_user(user_id)
        if not user:
            return
        
        # Initialize game stats if not exists
        if "game_stats" not in user:
            user["game_stats"] = {
                "games_played": 0,
                "games_won": 0,
                "total_bets": 0,
                "last_game": None
            }
        
        # Update stats
        user["game_stats"]["games_played"] += 1
        user["game_stats"]["total_bets"] += bet_amount
        user["game_stats"]["last_game"] = datetime.now().isoformat()
        
        if won:
            user["game_stats"]["games_won"] += 1
            user["total_won"] = user.get("total_won", 0) + win_amount
        
        user["total_wagered"] = user.get("total_wagered", 0) + bet_amount
        
        self.db.save_user(user_id, user)