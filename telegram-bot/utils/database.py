import json
import os
from datetime import datetime

class Database:
    def __init__(self):
        self.users_file = "users.json"
        self.transactions_file = "transactions.json"
    
    def load_json(self, file_path):
        """Load JSON data from file"""
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                try:
                    return json.load(f)
                except json.JSONDecodeError:
                    return {}
        return {}
    
    def save_json(self, file_path, data):
        """Save data to JSON file"""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
    
    def get_user(self, user_id):
        """Get user by ID"""
        users = self.load_json(self.users_file)
        return users.get(str(user_id))
    
    def save_user(self, user_id, user_data):
        """Save or update user"""
        users = self.load_json(self.users_file)
        users[str(user_id)] = user_data
        self.save_json(self.users_file, users)
    
    def update_user_balance(self, user_id, amount, operation="add"):
        """Update user balance"""
        user = self.get_user(user_id)
        if not user:
            return 0
        
        if operation == "add":
            user["balance"] = user.get("balance", 0) + amount
        elif operation == "subtract":
            user["balance"] = max(0, user.get("balance", 0) - amount)
        
        user["last_active"] = datetime.now().isoformat()
        self.save_user(user_id, user)
        return user["balance"]
    
    def create_transaction(self, transaction_data):
        """Create a transaction record"""
        transactions = self.load_json(self.transactions_file)
        transaction_id = f"TX{datetime.now().strftime('%Y%m%d%H%M%S')}"
        transaction_data["id"] = transaction_id
        transaction_data["created_at"] = datetime.now().isoformat()
        
        transactions[transaction_id] = transaction_data
        self.save_json(self.transactions_file, transactions)
        return transaction_id