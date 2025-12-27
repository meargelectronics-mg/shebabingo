import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Bot Configuration
BOT_TOKEN = os.getenv("8274404754:AAGnc1QeczvHP51dIryK2sK-E8aUUyiO6Zc")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "6297094384")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://meargelectronics-mg.github.io/shebabingo/")

# Payment Configuration
PAYMENT_METHODS = {
    "telebirr": {
        "name": "Telebirr",
        "number": "+251-914834341",  # Change to your actual number
        "account_name": "yosef Alemayoh",
        "min_amount": 10,
        "fee": 0
    },
    "cbe": {
        "name": "CBE Birr",
        "number": "1000193615547",  # Change to your actual number
        "account_name": "Mearg Alemayehu",
        "min_amount": 10,
        "fee": 0
    },
    "boa": {
        "name": "Bank of Abyssinia",
        "account": "65637448",  # Change to your actual account
        "branch": "Main Branch",
        "account_name": "Mearg Alemayoh",
        "min_amount": 20,
        "fee": 0
    }
}

# Game Configuration
MIN_DEPOSIT = 10
MIN_WITHDRAWAL = 50
MAX_WITHDRAWAL = 10000
BET_PER_BOARD = 10
MAX_BOARDS = 3
COMMISSION_RATE = 0.20  # 20%

# Database Paths
USERS_DB = "users.json"
TRANSACTIONS_DB = "transactions.json"
WITHDRAWALS_DB = "withdrawals.json"
DEPOSITS_DB = "deposits.json"