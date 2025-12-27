import os
import json
import random
import re
from datetime import datetime, timedelta
from telegram import (
    Update, 
    InlineKeyboardButton, 
    InlineKeyboardMarkup, 
    WebAppInfo,
    ReplyKeyboardMarkup,
    KeyboardButton
)
from telegram.ext import (
    Application, 
    CommandHandler, 
    ContextTypes, 
    MessageHandler, 
    filters,
    CallbackQueryHandler,
    ConversationHandler
)
from telegram.constants import ParseMode
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BOT_TOKEN = os.getenv("8274404754:AAGnc1QeczvHP51dIryK2sK-E8aUUyiO6Zc")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://meargelectronics-mg.github.io/shebabingo/")
ADMIN_CHAT_ID = os.getenv("6297094384")  # Your Telegram user ID

# Conversation states
DEPOSIT_AMOUNT, DEPOSIT_PROOF, WITHDRAW_AMOUNT, WITHDRAW_DETAILS = range(4)

# Payment details (UPDATE WITH YOUR ACTUAL DETAILS)
PAYMENT_DETAILS = {
    "telebirr": {
        "name": "Telebirr",
        "number": "+251945343143",
        "name_on_account": "yosef alemayoh",
        "min_amount": 10,
        "max_amount": 5000,
        "processing": "1-2 minutes",
        "type": "mobile_money"
    },
    "cbe": {
        "name": "CBE Birr",
        "number": "1000193615547",
        "name_on_account": "Mearg Alemayoh",
        "min_amount": 10,
        "max_amount": 10000,
        "processing": "1-2 minutes",
        "type": "mobile_money"
    },
    "boa": {
        "name": "Bank of Abyssinia",
        "account": "65637448",
        "branch": "Main Branch",
        "name_on_account": "Mearg Alemayoh",
        "min_amount": 20,
        "max_amount": 20000,
        "processing": "1-2 minutes",
        "type": "bank_transfer"
    }
}

# Load/save database
def load_database():
    try:
        with open('users_db.json', 'r') as f:
            return json.load(f)
    except:
        return {}

def save_database(data):
    with open('users_db.json', 'w') as f:
        json.dump(data, f, indent=2)

def load_transactions():
    try:
        with open('transactions_db.json', 'r') as f:
            return json.load(f)
    except:
        return []

def save_transactions(data):
    with open('transactions_db.json', 'w') as f:
        json.dump(data, f, indent=2)

def get_user(user_id, username="", first_name=""):
    """Get or create user"""
    db = load_database()
    
    if str(user_id) not in db:
        db[str(user_id)] = {
            "user_id": user_id,
            "username": username or f"user_{user_id}",
            "first_name": first_name or "Player",
            "balance": 0.0,
            "total_deposited": 0.0,
            "total_withdrawn": 0.0,
            "total_won": 0.0,
            "total_wagered": 0.0,
            "joined_date": datetime.now().isoformat(),
            "last_active": datetime.now().isoformat(),
            "deposit_count": 0,
            "withdrawal_count": 0,
            "games_played": 0,
            "games_won": 0,
            "status": "active",
            "verification_level": "basic"
        }
        save_database(db)
    
    user = db[str(user_id)]
    user["last_active"] = datetime.now().isoformat()
    save_database(db)
    return user

def update_user_balance(user_id, amount, transaction_type):
    """Update user balance and record transaction"""
    db = load_database()
    user = db[str(user_id)]
    
    if transaction_type == "deposit":
        user["balance"] += amount
        user["total_deposited"] += amount
        user["deposit_count"] += 1
    elif transaction_type == "withdraw":
        user["balance"] -= amount
        user["total_withdrawn"] += amount
        user["withdrawal_count"] += 1
    elif transaction_type == "win":
        user["balance"] += amount
        user["total_won"] += amount
    elif transaction_type == "bet":
        user["balance"] -= amount
        user["total_wagered"] += amount
        user["games_played"] += 1
    
    db[str(user_id)] = user
    save_database(db)
    return user["balance"]

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Main menu with professional interface"""
    user = get_user(
        update.effective_user.id,
        update.effective_user.username,
        update.effective_user.first_name
    )
    
    # Main menu keyboard
    keyboard = [
        [InlineKeyboardButton("🎮 PLAY BINGO", web_app=WebAppInfo(url=WEB_APP_URL))],
        [
            InlineKeyboardButton("💰 DEPOSIT", callback_data="deposit_menu"),
            InlineKeyboardButton("🏦 WITHDRAW", callback_data="withdraw_menu")
        ],
        [
            InlineKeyboardButton("📊 MY STATS", callback_data="my_stats"),
            InlineKeyboardButton("🏆 LEADERBOARD", callback_data="leaderboard")
        ],
        [
            InlineKeyboardButton("📱 SUPPORT", url="https://t.me/ShebaBingoSupport"),
            InlineKeyboardButton("ℹ️ HELP", callback_data="help_menu")
        ]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    message = (
        f"🎯 *SHEBA BINGO - PREMIUM GAMING*\n\n"
        f"👤 Welcome, *{user['first_name']}*!\n"
        f"💰 Balance: *${user['balance']:,.2f}*\n\n"
        f"*Quick Actions:*\n"
        f"• 🎮 PLAY - Start a new game\n"
        f"• 💰 DEPOSIT - Add funds instantly\n"
        f"• 🏦 WITHDRAW - Cash out winnings\n\n"
        f"*📞 Support: @ShebaBingoSupport*\n"
        f"*⚡ Instant Payouts | 🔒 Secure*\n"
    )
    
    await update.message.reply_text(
        message,
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )

async def deposit_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Deposit options menu"""
    query = update.callback_query
    await query.answer()
    
    user = get_user(query.from_user.id)
    
    keyboard = [
        [
            InlineKeyboardButton("📱 Telebirr", callback_data="deposit_telebirr"),
            InlineKeyboardButton("🏦 CBE Birr", callback_data="deposit_cbe")
        ],
        [
            InlineKeyboardButton("🇪🇹 BOA", callback_data="deposit_boa"),
            InlineKeyboardButton("🔙 Back", callback_data="main_menu")
        ]        
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    message = (
        f"💰 *DEPOSIT FUNDS*\n\n"
        f"*Current Balance:* ${user['balance']:,.2f}\n"
        f"*Minimum Deposit:* $10\n\n"
        f"*Select Payment Method:*\n"
        f"• 📱 Telebirr - Instant (1-2 min)\n"
        f"• 🏦 CBE Birr - Instant (1-2 min)\n"
        f"• 🇪🇹 BOA - Instant (1-2 min)\n"
        f"*✅ All methods are secure and verified*"
    )
    
    await query.edit_message_text(
        text=message,
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )

async def handle_deposit_method(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle deposit method selection"""
    query = update.callback_query
    await query.answer()
    
    user = get_user(query.from_user.id)
    method = query.data.replace("deposit_", "")
    
    # Store selected method
    context.user_data["deposit_method"] = method
    
    if method in ["telebirr", "cbe", "boa"]:
        details = PAYMENT_DETAILS[method]
        
        if method in ["telebirr", "cbe"]:
            message = (
                f"📱 *{details['name']} DEPOSIT*\n\n"
                f"*Send to:* `{details['number']}`\n"
                f"*Account Name:* {details['name_on_account']}\n"
                f"*Reference:* `SB{user['user_id']}`\n\n"
                f"*📝 Instructions:*\n"
                f"1. Open {details['name']} app\n"
                f"2. Send money to above number\n"
                f"3. Use reference: *SB{user['user_id']}*\n"
                f"4. Take screenshot\n"
                f"5. Send screenshot here\n\n"
                f"*Minimum:* ${details['min_amount']}\n"
                f"*Maximum:* ${details['max_amount']}\n"
                f"*Processing:* {details['processing']}\n\n"
                f"⚠️ *Without correct reference, deposit will be delayed*"
            )
        else:  # BOA
            message = (
                f"🏦 *{details['name']} DEPOSIT*\n\n"
                f"*Account:* `{details['account']}`\n"
                f"*Branch:* {details['branch']}\n"
                f"*Name:* {details['name_on_account']}\n"
                f"*Reference:* `SB{user['user_id']}`\n\n"
                f"*📝 Instructions:*\n"
                f"1. Transfer to above account\n"
                f"2. Include reference: *SB{user['user_id']}*\n"
                f"3. Take transaction slip screenshot\n"
                f"4. Send screenshot here\n\n"
                f"*Minimum:* ${details['min_amount']}\n"
                f"*Maximum:* ${details['max_amount']}\n"
                f"*Processing:* {details['processing']}"
            )
    
    keyboard = [
        [InlineKeyboardButton("💵 ENTER AMOUNT", callback_data="enter_deposit_amount")],
        [InlineKeyboardButton("🔙 Back", callback_data="deposit_menu")]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        text=message,
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )

async def enter_deposit_amount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Enter deposit amount"""
    query = update.callback_query
    await query.answer()
    
    method = context.user_data.get("deposit_method", "telebirr")
    details = PAYMENT_DETAILS.get(method, PAYMENT_DETAILS["telebirr"])
    
    await query.edit_message_text(
        text=f"💵 *ENTER DEPOSIT AMOUNT*\n\n"
             f"*Method:* {details['name']}\n"
             f"*Minimum:* ${details['min_amount']}\n"
             f"*Maximum:* ${details['max_amount']}\n\n"
             f"Please send the amount you want to deposit.\n"
             f"Example: *50* for $50\n\n"
             f"⚠️ Amount must be between ${details['min_amount']}-${details['max_amount']}",
        parse_mode=ParseMode.MARKDOWN
    )
    
    return DEPOSIT_AMOUNT

async def handle_deposit_amount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle deposit amount input"""
    try:
        amount = float(update.message.text)
        method = context.user_data.get("deposit_method", "telebirr")
        details = PAYMENT_DETAILS.get(method, PAYMENT_DETAILS["telebirr"])
        
        if amount < details["min_amount"]:
            await update.message.reply_text(
                f"❌ *AMOUNT TOO LOW*\n\n"
                f"Minimum deposit for {details['name']} is ${details['min_amount']}.\n"
                f"Please enter a valid amount.",
                parse_mode=ParseMode.MARKDOWN
            )
            return DEPOSIT_AMOUNT
        
        if amount > details["max_amount"]:
            await update.message.reply_text(
                f"❌ *AMOUNT TOO HIGH*\n\n"
                f"Maximum deposit for {details['name']} is ${details['max_amount']}.\n"
                f"Please enter a smaller amount or split into multiple deposits.",
                parse_mode=ParseMode.MARKDOWN
            )
            return DEPOSIT_AMOUNT
        
        # Store amount
        context.user_data["deposit_amount"] = amount
        
        # Show payment instructions again
        user = get_user(update.effective_user.id)
        
        if method in ["telebirr", "cbe"]:
            instructions = (
                f"📱 *SEND ${amount:,.2f} TO {details['name'].upper()}*\n\n"
                f"*Number:* `{details['number']}`\n"
                f"*Name:* {details['name_on_account']}\n"
                f"*Reference:* `SB{user['user_id']}`\n\n"
                f"*After sending:*\n"
                f"1. Take screenshot of successful transfer\n"
                f"2. Send screenshot here\n"
                f"3. Wait 1 minutes for verification\n\n"
                f"⚠️ *IMPORTANT:* Include reference *SB{user['user_id']}*"
            )
        else:
            instructions = (
                f"🏦 *TRANSFER ${amount:,.2f} TO {details['name'].upper()}*\n\n"
                f"*Account:* `{details['account']}`\n"
                f"*Branch:* {details['branch']}\n"
                f"*Name:* {details['name_on_account']}\n"
                f"*Reference:* `SB{user['user_id']}`\n\n"
                f"*After transferring:*\n"
                f"1. Take screenshot of transaction slip\n"
                f"2. Send screenshot here\n"
                f"3. Wait 1 minutes for verification"
            )
        
        await update.message.reply_text(
            instructions,
            parse_mode=ParseMode.MARKDOWN
        )
        
        return DEPOSIT_PROOF
        
    except ValueError:
        await update.message.reply_text(
            "❌ *INVALID AMOUNT*\n\n"
            "Please enter a valid number.\n"
            "Example: *50* for 50 ETB",
            parse_mode=ParseMode.MARKDOWN
        )
        return DEPOSIT_AMOUNT

async def handle_deposit_proof(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle deposit proof (screenshot)"""
    if update.message.photo:
        user = get_user(update.effective_user.id)
        amount = context.user_data.get("deposit_amount", 0)
        method = context.user_data.get("deposit_method", "telebirr")
        details = PAYMENT_DETAILS.get(method, PAYMENT_DETAILS["telebirr"])
        
        # Generate deposit ID
        deposit_id = f"DP{datetime.now().strftime('%Y%m%d%H%M%S')}{user['user_id']}"
        
        # Save transaction
        transactions = load_transactions()
        transaction = {
            "id": deposit_id,
            "user_id": user['user_id'],
            "username": user['username'],
            "type": "deposit",
            "amount": amount,
            "method": method,
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "reference": f"SB{user['user_id']}"
        }
        transactions.append(transaction)
        save_transactions(transactions)
        
        # Notify admin
        admin_message = (
            f"🆕 *NEW DEPOSIT REQUEST*\n\n"
            f"*ID:* {deposit_id}\n"
            f"*User:* @{user['username']} ({user['user_id']})\n"
            f"*Amount:* ${amount:,.2f}\n"
            f"*Method:* {details['name']}\n"
            f"*Reference:* SB{user['user_id']}\n"
            f"*Time:* {datetime.now().strftime('%H:%M:%S')}\n\n"
            f"*To approve:*\n"
            f"1. Check payment received\n"
            f"2. Verify amount matches\n"
            f"3. Click button below"
        )
        
        admin_keyboard = [
            [
                InlineKeyboardButton("✅ APPROVE", callback_data=f"approve_deposit_{deposit_id}"),
                InlineKeyboardButton("❌ REJECT", callback_data=f"reject_deposit_{deposit_id}")
            ]
        ]
        admin_reply_markup = InlineKeyboardMarkup(admin_keyboard)
        
        try:
            await context.bot.send_message(
                chat_id=ADMIN_CHAT_ID,
                text=admin_message,
                reply_markup=admin_reply_markup,
                parse_mode=ParseMode.MARKDOWN
            )
        except Exception as e:
            print(f"Failed to notify admin: {e}")
        
        # Confirm to user
        await update.message.reply_text(
            f"✅ *DEPOSIT REQUEST SUBMITTED*\n\n"
            f"*ID:* {deposit_id}\n"
            f"*Amount:* ${amount:,.2f}\n"
            f"*Method:* {details['name']}\n"
            f"*Status:* Under Review\n"
            f"*Processing:* 1 minutes\n\n"
            f"We'll notify you once funds are added to your account.\n"
            f"Thank you for choosing Sheba Bingo! 🎯",
            parse_mode=ParseMode.MARKDOWN
        )
        
        # Clear conversation data
        context.user_data.clear()
        return ConversationHandler.END
    
    else:
        await update.message.reply_text(
            "📸 *PLEASE SEND SCREENSHOT*\n\n"
            "We need a screenshot of the successful payment.\n"
            "Please send the screenshot now.",
            parse_mode=ParseMode.MARKDOWN
        )
        return DEPOSIT_PROOF

async def approve_deposit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin approves deposit"""
    query = update.callback_query
    await query.answer()
    
    deposit_id = query.data.replace("approve_deposit_", "")
    transactions = load_transactions()
    
    # Find and update transaction
    for tx in transactions:
        if tx["id"] == deposit_id and tx["status"] == "pending":
            tx["status"] = "approved"
            tx["approved_at"] = datetime.now().isoformat()
            tx["approved_by"] = "admin"
            
            # Update user balance
            new_balance = update_user_balance(tx["user_id"], tx["amount"], "deposit")
            
            # Save transactions
            save_transactions(transactions)
            
            # Notify user
            try:
                await context.bot.send_message(
                    chat_id=tx["user_id"],
                    text=f"✅ *DEPOSIT APPROVED*\n\n"
                         f"*ID:* {deposit_id}\n"
                         f"*Amount:* ${tx['amount']:,.2f}\n"
                         f"*New Balance:* ${new_balance:,.2f}\n\n"
                         f"Your deposit has been verified and added to your account.\n"
                         f"Thank you for choosing Sheba Bingo! 🎯",
                    parse_mode=ParseMode.MARKDOWN
                )
            except:
                pass
            
            # Update admin message
            await query.edit_message_text(
                text=f"✅ *DEPOSIT APPROVED*\n\n"
                     f"*ID:* {deposit_id}\n"
                     f"*User:* {tx['username']}\n"
                     f"*Amount:* ${tx['amount']:,.2f}\n"
                     f"*Time:* {datetime.now().strftime('%H:%M:%S')}\n\n"
                     f"Funds added to user's account.",
                parse_mode=ParseMode.MARKDOWN
            )
            return
    
    await query.answer("Deposit not found or already processed", show_alert=True)

async def withdraw_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Withdrawal menu"""
    query = update.callback_query
    await query.answer()
    
    user = get_user(query.from_user.id)
    
    if user["balance"] < 20:
        keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="main_menu")]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            text=f"⚠️ *MINIMUM WITHDRAWAL: $20*\n\n"
                 f"*Your Balance:* ${user['balance']:,.2f}\n\n"
                 f"Please deposit or win more to reach minimum withdrawal amount.",
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )
        return
    
    keyboard = [
        [
            InlineKeyboardButton("📱 Telebirr", callback_data="withdraw_telebirr"),
            InlineKeyboardButton("🏦 CBE Birr", callback_data="withdraw_cbe")
        ],
        [
            InlineKeyboardButton("🇪🇹 BOA", callback_data="withdraw_boa"),
            InlineKeyboardButton("🔙 Back", callback_data="main_menu")
        ]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    message = (
        f"🏦 *WITHDRAW FUNDS*\n\n"
        f"*Available Balance:* ${user['balance']:,.2f}\n"
        f"*Minimum Withdrawal:* 50 ETB\n"
        f"*Maximum Daily:* 1,000 ETB\n"
        f"*Processing:* 3-5 minutes\n\n"
        f"*Select withdrawal method:*"
    )
    
    await query.edit_message_text(
        text=message,
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )

async def handle_withdraw_method(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle withdrawal method selection"""
    query = update.callback_query
    await query.answer()
    
    user = get_user(query.from_user.id)
    method = query.data.replace("withdraw_", "")
    
    # Store method
    context.user_data["withdraw_method"] = method
    
    if method in ["telebirr", "cbe"]:
        message = (
            f"📱 *{method.upper()} WITHDRAWAL*\n\n"
            f"*Available Balance:* ${user['balance']:,.2f}\n"
            f"*Minimum:* 50 ETB\n"
            f"*Maximum:* 1,000 ETB\n\n"
            f"Enter amount to withdraw:"
        )
    else:
        message = (
            f"🏦 *BANK WITHDRAWAL*\n\n"
            f"*Available Balance:* ${user['balance']:,.2f}\n"
            f"*Minimum:* 50 ETB\n"
            f"*Maximum:* 1,000 ETB\n\n"
            f"Enter amount to withdraw:"
        )
    
    await query.edit_message_text(
        text=message,
        parse_mode=ParseMode.MARKDOWN
    )
    
    return WITHDRAW_AMOUNT

async def handle_withdraw_amount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle withdrawal amount"""
    try:
        amount = float(update.message.text)
        user = get_user(update.effective_user.id)
        method = context.user_data.get("withdraw_method", "telebirr")
        
        # Validate amount
        if amount < 20:
            await update.message.reply_text(
                "❌ *MINIMUM WITHDRAWAL IS 50 ETB*\n\n"
                "Please enter at least 50.",
                parse_mode=ParseMode.MARKDOWN
            )
            return WITHDRAW_AMOUNT
        
        if amount > 1000:
            await update.message.reply_text(
                "❌ *MAXIMUM DAILY WITHDRAWAL IS 1,000 ETB*\n\n"
                "Please enter a smaller amount.",
                parse_mode=ParseMode.MARKDOWN
            )
            return WITHDRAW_AMOUNT
        
        if amount > user["balance"]:
            await update.message.reply_text(
                f"❌ *INSUFFICIENT BALANCE*\n\n"
                f"*Available:* ${user['balance']:,.2f}\n"
                f"*Requested:* ${amount:,.2f}\n\n"
                f"Please enter a smaller amount.",
                parse_mode=ParseMode.MARKDOWN
            )
            return WITHDRAW_AMOUNT
        
        # Store amount
        context.user_data["withdraw_amount"] = amount
        
        # Ask for account details
        if method in ["telebirr", "cbe"]:
            await update.message.reply_text(
                f"📱 *ENTER YOUR {method.upper()} NUMBER*\n\n"
                f"*Amount:* ${amount:,.2f}\n\n"
                f"Please send your {method} phone number.\n"
                f"Format: *+2519XXXXXXXX* or *09XXXXXXXX*\n\n"
                f"⚠️ Account must match your username",
                parse_mode=ParseMode.MARKDOWN
            )
        else:
            await update.message.reply_text(
                f"🏦 *ENTER BANK DETAILS*\n\n"
                f"*Amount:* ${amount:,.2f}\n\n"
                f"Please send:\n"
                f"1. Bank Name\n"
                f"2. Account Number\n"
                f"3. Account Holder Name\n\n"
                f"Example:\n"
                f"*Bank of Abyssinia\n"
                f"65637448\n"
                f"Mearg Alemayoh*",
                parse_mode=ParseMode.MARKDOWN
            )
        
        return WITHDRAW_DETAILS
        
    except ValueError:
        await update.message.reply_text(
            "❌ *INVALID AMOUNT*\n\n"
            "Please enter a valid number.\n"
            "Example: *50* for 50 ETB",
            parse_mode=ParseMode.MARKDOWN
        )
        return WITHDRAW_AMOUNT

async def handle_withdraw_details(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle withdrawal account details"""
    account_details = update.message.text
    user = get_user(update.effective_user.id)
    amount = context.user_data.get("withdraw_amount", 0)
    method = context.user_data.get("withdraw_method", "telebirr")
    
    # Validate phone number for mobile money
    if method in ["telebirr", "cbe"]:
        if not re.match(r'^(\+2519\d{8}|09\d{8})$', account_details):
            await update.message.reply_text(
                "❌ *INVALID PHONE NUMBER*\n\n"
                "Please enter a valid Ethiopian phone number.\n"
                "Format: *+2519XXXXXXXX* or *09XXXXXXXX*",
                parse_mode=ParseMode.MARKDOWN
            )
            return WITHDRAW_DETAILS
    
    # Generate withdrawal ID
    withdrawal_id = f"WD{datetime.now().strftime('%Y%m%d%H%M%S')}{user['user_id']}"
    
    # Deduct balance immediately
    new_balance = update_user_balance(user['user_id'], amount, "withdraw")
    
    # Save transaction
    transactions = load_transactions()
    transaction = {
        "id": withdrawal_id,
        "user_id": user['user_id'],
        "username": user['username'],
        "type": "withdraw",
        "amount": amount,
        "method": method,
        "account_details": account_details,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "previous_balance": user['balance'],
        "new_balance": new_balance
    }
    transactions.append(transaction)
    save_transactions(transactions)
    
    # Notify admin
    admin_message = (
        f"🆕 *NEW WITHDRAWAL REQUEST*\n\n"
        f"*ID:* {withdrawal_id}\n"
        f"*User:* @{user['username']} ({user['user_id']})\n"
        f"*Amount:* ${amount:,.2f}\n"
        f"*Method:* {method}\n"
        f"*Details:* {account_details}\n"
        f"*New Balance:* ${new_balance:,.2f}\n"
        f"*Time:* {datetime.now().strftime('%H:%M:%S')}\n\n"
        f"*To process:*\n"
        f"1. Send money to above account\n"
        f"2. Click button below"
    )
    
    admin_keyboard = [
        [
            InlineKeyboardButton("✅ COMPLETE", callback_data=f"complete_withdraw_{withdrawal_id}"),
            InlineKeyboardButton("❌ REJECT", callback_data=f"reject_withdraw_{withdrawal_id}")
        ]
    ]
    admin_reply_markup = InlineKeyboardMarkup(admin_keyboard)
    
    try:
        await context.bot.send_message(
            chat_id=ADMIN_CHAT_ID,
            text=admin_message,
            reply_markup=admin_reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )
    except Exception as e:
        print(f"Failed to notify admin: {e}")
    
    # Confirm to user
    await update.message.reply_text(
        f"✅ *WITHDRAWAL REQUEST SUBMITTED*\n\n"
        f"*ID:* {withdrawal_id}\n"
        f"*Amount:* ${amount:,.2f}\n"
        f"*Method:* {method}\n"
        f"*New Balance:* ${new_balance:,.2f}\n"
        f"*Status:* Processing\n"
        f"*Time:* 3-5 Minutes\n\n"
        f"We'll notify you once payment is sent.\n"
        f"Thank you for choosing Sheba Bingo! 🎯",
        parse_mode=ParseMode.MARKDOWN
    )
    
    # Clear conversation data
    context.user_data.clear()
    return ConversationHandler.END

async def complete_withdrawal(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin completes withdrawal"""
    query = update.callback_query
    await query.answer()
    
    withdrawal_id = query.data.replace("complete_withdraw_", "")
    transactions = load_transactions()
    
    # Find and update transaction
    for tx in transactions:
        if tx["id"] == withdrawal_id and tx["status"] == "pending":
            tx["status"] = "completed"
            tx["completed_at"] = datetime.now().isoformat()
            tx["completed_by"] = "admin"
            
            # Save transactions
            save_transactions(transactions)
            
            # Notify user
            try:
                await context.bot.send_message(
                    chat_id=tx["user_id"],
                    text=f"✅ *WITHDRAWAL COMPLETED*\n\n"
                         f"*ID:* {withdrawal_id}\n"
                         f"*Amount:* ${tx['amount']:,.2f}\n"
                         f"*Method:* {tx['method']}\n"
                         f"*Status:* Payment Sent\n\n"
                         f"Your withdrawal has been processed.\n"
                         f"Funds should arrive within 5 minutes.\n\n"
                         f"Thank you for choosing Sheba Bingo! 🎯",
                    parse_mode=ParseMode.MARKDOWN
                )
            except:
                pass
            
            # Update admin message
            await query.edit_message_text(
                text=f"✅ *WITHDRAWAL COMPLETED*\n\n"
                     f"*ID:* {withdrawal_id}\n"
                     f"*User:* {tx['username']}\n"
                     f"*Amount:* ${tx['amount']:,.2f}\n"
                     f"*Method:* {tx['method']}\n"
                     f"*Time:* {datetime.now().strftime('%H:%M:%S')}\n\n"
                     f"Payment sent to user.",
                parse_mode=ParseMode.MARKDOWN
            )
            return
    
    await query.answer("Withdrawal not found or already processed", show_alert=True)

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Cancel conversation"""
    await update.message.reply_text(
        "❌ Operation cancelled.",
        parse_mode=ParseMode.MARKDOWN
    )
    context.user_data.clear()
    return ConversationHandler.END

async def main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Return to main menu"""
    query = update.callback_query
    await query.answer()
    
    user = get_user(query.from_user.id)
    
    keyboard = [
        [InlineKeyboardButton("🎮 PLAY BINGO", web_app=WebAppInfo(url=WEB_APP_URL))],
        [
            InlineKeyboardButton("💰 DEPOSIT", callback_data="deposit_menu"),
            InlineKeyboardButton("🏦 WITHDRAW", callback_data="withdraw_menu")
        ],
        [
            InlineKeyboardButton("📊 MY STATS", callback_data="my_stats"),
            InlineKeyboardButton("🏆 LEADERBOARD", callback_data="leaderboard")
        ],
        [
            InlineKeyboardButton("📱 SUPPORT", url="https://t.me/ShebaBingoSupport"),
            InlineKeyboardButton("ℹ️ HELP", callback_data="help_menu")
        ]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    message = (
        f"🎯 *SHEBA BINGO - MAIN MENU*\n\n"
        f"👤 Welcome back, *{user['first_name']}*!\n"
        f"💰 Balance: *${user['balance']:,.2f}*\n\n"
        f"*Quick Actions:*\n"
        f"• 🎮 PLAY - Start a new game\n"
        f"• 💰 DEPOSIT - Add funds instantly\n"
        f"• 🏦 WITHDRAW - Cash out winnings\n\n"
        f"*📞 Support: @ShebaBingoSupport*"
    )
    
    await query.edit_message_text(
        text=message,
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )

async def my_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show user statistics"""
    query = update.callback_query
    await query.answer()
    
    user = get_user(query.from_user.id)
    win_rate = (user["games_won"] / user["games_played"] * 100) if user["games_played"] > 0 else 0
    
    message = (
        f"📊 *YOUR STATISTICS*\n\n"
        f"👤 *Player:* {user['first_name']}\n"
        f"🆔 *ID:* SB{user['user_id']}\n"
        f"📅 *Joined:* {datetime.fromisoformat(user['joined_date']).strftime('%Y-%m-%d')}\n\n"
        f"💰 *FINANCIAL*\n"
        f"• Balance: *${user['balance']:,.2f}*\n"
        f"• Total Deposited: *${user['total_deposited']:,.2f}*\n"
        f"• Total Withdrawn: *${user['total_withdrawn']:,.2f}*\n"
        f"• Total Won: *${user['total_won']:,.2f}*\n\n"
        f"🎮 *GAMING*\n"
        f"• Games Played: *{user['games_played']}*\n"
        f"• Games Won: *{user['games_won']}*\n"
        f"• Win Rate: *{win_rate:.1f}%*\n"
        f"• Total Wagered: *${user['total_wagered']:,.2f}*\n\n"
        f"*Keep playing to improve your stats!* 🚀"
    )
    
    keyboard = [
        [InlineKeyboardButton("🎮 PLAY NOW", web_app=WebAppInfo(url=WEB_APP_URL))],
        [InlineKeyboardButton("🔙 Back", callback_data="main_menu")]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        text=message,
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )

async def help_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Help menu"""
    query = update.callback_query
    await query.answer()
    
    message = (
        f"ℹ️ *HOW TO PLAY SHEBA BINGO*\n\n"
        f"*1️⃣ DEPOSIT FUNDS*\n"
        f"• Click DEPOSIT button\n"
        f"• Select payment method\n"
        f"• Send money & screenshot\n"
        f"• Wait 1 minutes\n\n"
        f"*2️⃣ PLAY BINGO*\n"
        f"• Click PLAY BINGO\n"
        f"• Select 1-3 boards (10 ETB each)\n"
        f"• Mark numbers as called\n"
        f"• Complete patterns to win\n\n"
        f"*3️⃣ WINNING PATTERNS*\n"
        f"• Any row/column/diagonal\n"
        f"• Four corners\n"
        f"• Full house\n\n"
        f"*4️⃣ WITHDRAW WINNINGS*\n"
        f"• Minimum: 50 ETB\n"
        f"• Processing: 3 minutes\n"
        f"• Available 24/7\n\n"
        f"*📞 Support:* @ShebaBingoSupport\n"
        f"*⚡ Instant Deposits*\n"
        f"*🔒 Secure & Verified*"
    )
    
    keyboard = [
        [InlineKeyboardButton("🎮 PLAY NOW", web_app=WebAppInfo(url=WEB_APP_URL))],
        [InlineKeyboardButton("💰 DEPOSIT", callback_data="deposit_menu")],
        [InlineKeyboardButton("🔙 Back", callback_data="main_menu")]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        text=message,
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )

def main():
    """Start the bot"""
    if not BOT_TOKEN:
        print("❌ ERROR: BOT_TOKEN not found in .env file")
        print("Create a .env file with:")
        print("BOT_TOKEN=your_bot_token_here")
        print("ADMIN_CHAT_ID=your_user_id_here")
        print("WEB_APP_URL=https://meargelectronics-mg.github.io/shebabingo/")
        exit(1)
    
    app = Application.builder().token(BOT_TOKEN).build()
    
    # Conversation handler for deposits
    deposit_conv = ConversationHandler(
        entry_points=[CallbackQueryHandler(enter_deposit_amount, pattern="^enter_deposit_amount$")],
        states={
            DEPOSIT_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, handle_deposit_amount)],
            DEPOSIT_PROOF: [MessageHandler(filters.PHOTO | filters.TEXT, handle_deposit_proof)]
        },
        fallbacks=[CommandHandler("cancel", cancel)]
    )
    
    # Conversation handler for withdrawals
    withdraw_conv = ConversationHandler(
        entry_points=[
            CallbackQueryHandler(handle_withdraw_method, pattern="^withdraw_telebirr$"),
            CallbackQueryHandler(handle_withdraw_method, pattern="^withdraw_cbe$"),
            CallbackQueryHandler(handle_withdraw_method, pattern="^withdraw_boa$"),
            CallbackQueryHandler(handle_withdraw_method, pattern="^withdraw_bank$")
        ],
        states={
            WITHDRAW_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, handle_withdraw_amount)],
            WITHDRAW_DETAILS: [MessageHandler(filters.TEXT & ~filters.COMMAND, handle_withdraw_details)]
        },
        fallbacks=[CommandHandler("cancel", cancel)]
    )
    
    # Command handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("deposit", deposit_menu))
    app.add_handler(CommandHandler("withdraw", withdraw_menu))
    app.add_handler(CommandHandler("stats", my_stats))
    app.add_handler(CommandHandler("help", help_menu))
    
    # Callback query handlers
    app.add_handler(CallbackQueryHandler(deposit_menu, pattern="^deposit_menu$"))
    app.add_handler(CallbackQueryHandler(withdraw_menu, pattern="^withdraw_menu$"))
    app.add_handler(CallbackQueryHandler(my_stats, pattern="^my_stats$"))
    app.add_handler(CallbackQueryHandler(help_menu, pattern="^help_menu$"))
    app.add_handler(CallbackQueryHandler(main_menu, pattern="^main_menu$"))
    
    # Deposit methods
    app.add_handler(CallbackQueryHandler(handle_deposit_method, pattern="^deposit_"))
    
    # Admin actions
    app.add_handler(CallbackQueryHandler(approve_deposit, pattern="^approve_deposit_"))
    app.add_handler(CallbackQueryHandler(complete_withdrawal, pattern="^complete_withdraw_"))
    
    # Conversation handlers
    app.add_handler(deposit_conv)
    app.add_handler(withdraw_conv)
    
    print("🎯 SHEBA BINGO - PROFESSIONAL GAMING BOT")
    print(f"✅ Bot Token: {BOT_TOKEN[:10]}...")
    print(f"✅ Admin ID: {ADMIN_CHAT_ID}")
    print(f"✅ Web App: {WEB_APP_URL}")
    print("✅ Payment Methods: Telebirr, CBE Birr, BOA")
    print("✅ Withdrawal System: Manual processing")
    print("✅ Real-time Admin Notifications")
    print("🤖 Send /start to begin")
    
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()