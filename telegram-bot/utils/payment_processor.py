import re
from datetime import datetime
from typing import Dict, Tuple
import config
from .database import Database

class PaymentProcessor:
    def __init__(self):
        self.db = Database()
    
    def validate_deposit(self, amount: float, method: str) -> Tuple[bool, str]:
        """Validate deposit request"""
        if amount < config.MIN_DEPOSIT:
            return False, f"Minimum deposit is ${config.MIN_DEPOSIT}"
        
        if method not in config.PAYMENT_METHODS:
            return False, "Invalid payment method"
        
        return True, "Valid"
    
    def validate_withdrawal(self, user_id: int, amount: float) -> Tuple[bool, str]:
        """Validate withdrawal request"""
        user = self.db.get_user(user_id)
        if not user:
            return False, "User not found"
        
        if amount < config.MIN_WITHDRAWAL:
            return False, f"Minimum withdrawal is ${config.MIN_WITHDRAWAL}"
        
        if amount > config.MAX_WITHDRAWAL:
            return False, f"Maximum withdrawal is ${config.MAX_WITHDRAWAL}"
        
        if amount > user.get("balance", 0):
            return False, "Insufficient balance"
        
        return True, "Valid"
    
    def process_deposit(self, user_id: int, amount: float, method: str, proof: str = "") -> Dict:
        """Process deposit request"""
        user = self.db.get_user(user_id)
        if not user:
            # Create new user
            from datetime import datetime
            user = {
                "user_id": user_id,
                "balance": 0,
                "total_won": 0,
                "total_wagered": 0,
                "joined_date": datetime.now().isoformat(),
                "last_active": datetime.now().isoformat(),
                "deposit_history": [],
                "withdrawal_requests": []
            }
        
        # Create deposit record
        deposit_data = {
            "user_id": user_id,
            "amount": amount,
            "method": method,
            "status": "pending",
            "proof": proof,
            "type": "deposit"
        }
        
        deposit_id = self.db.create_transaction(deposit_data)
        
        # Add to user's deposit history
        user["deposit_history"].append({
            "id": deposit_id,
            "amount": amount,
            "method": method,
            "status": "pending",
            "date": datetime.now().isoformat()
        })
        
        self.db.save_user(user_id, user)
        
        return {
            "success": True,
            "deposit_id": deposit_id,
            "amount": amount,
            "status": "pending",
            "message": "Deposit request submitted for admin approval"
        }
    
    def process_withdrawal(self, user_id: int, amount: float, method: str, account_details: str) -> Dict:
        """Process withdrawal request"""
        # Deduct amount immediately
        new_balance = self.db.update_user_balance(user_id, amount, "subtract")
        
        # Create withdrawal record
        withdrawal_data = {
            "user_id": user_id,
            "amount": amount,
            "method": method,
            "account_details": account_details,
            "status": "pending_approval",
            "type": "withdrawal"
        }
        
        withdrawal_id = self.db.create_transaction(withdrawal_data)
        
        return {
            "success": True,
            "withdrawal_id": withdrawal_id,
            "amount": amount,
            "new_balance": new_balance,
            "status": "pending_approval",
            "message": "Withdrawal request submitted"
        }
    
    def validate_phone_number(self, phone: str) -> bool:
        """Validate Ethiopian phone number"""
        # Ethiopian phone pattern: +2519XXXXXXXX or 09XXXXXXXX
        pattern = r'^(\+2519\d{8}|09\d{8})$'
        return bool(re.match(pattern, phone))