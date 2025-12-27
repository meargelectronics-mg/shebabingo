import os
import json
import logging
from typing import Dict, Optional
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    filters,
    ContextTypes,
)

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Load environment
TOKEN = os.getenv("8274404754:AAGnc1QeczvHP51dIryK2sK-E8aUUyiO6Zc")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://github.com/meargelectronics-mg/shebabingo/")

class ShebaBingoBot:
    def __init__(self):
        self.users_file = "users.json"
        self.users = self.load_users()
    
    def load_users(self) -> Dict:
        """Load users from JSON file"""
        if os.path.exists(self.users_file):
            with open(self.users_file, "r") as f:
                return json.load(f)
        return {}
    
    def save_users(self):
        """Save users to JSON file"""
        with open(self.users_file, "w") as f:
            json.dump(self.users, f, indent=2)
    
    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        user = update.effective_user
        user_id = str(user.id)
        
        # Register new user
        if user_id not in self.users:
            self.users[user_id] = {
                "username": user.username,
                "first_name": user.first_name,
                "balance": 10.0,  # Welcome bonus
                "total_won": 0,
                "games_played": 0,
                "joined_at": update.message.date.isoformat(),
            }
            self.save_users()
        
        # Create welcome message
        user_data = self.users[user_id]
        
        welcome_text = f"""
🎯 *Welcome to ShebaBingo, {user.first_name}!*

💰 *Balance:* {user_data['balance']:.1f} ETB
🎮 *Games Played:* {user_data['games_played']}
🏆 *Total Won:* {user_data['total_won']:.1f} ETB

*How to Play:*
1️⃣ Tap PLAY BINGO below
2️⃣ Select 1-3 boards (10 ETB each)
3️⃣ Mark numbers as called
4️⃣ Complete line to win!
5️⃣ Claim your prize instantly

📱 *Minimum Requirements:*
• Telegram app (latest version)
• Internet connection
        """
        
        # Create keyboard with Web App button
        keyboard = [
            [
                InlineKeyboardButton(
                    "🎮 PLAY BINGO",
                    web_app=WebAppInfo(url=f"{WEB_APP_URL}?tg={user_id}")
                )
            ],
            [
                InlineKeyboardButton("💰 Deposit", callback_data="deposit"),
                InlineKeyboardButton("📤 Withdraw", callback_data="withdraw"),
            ],
            [
                InlineKeyboardButton("📊 My Stats", callback_data="stats"),
                InlineKeyboardButton("❓ Help", callback_data="help"),
            ],
        ]
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            welcome_text,
            reply_markup=reply_markup,
            parse_mode="Markdown",
        )
    
    async def deposit(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle deposit request"""
        query = update.callback_query
        await query.answer()
        
        deposit_text = """
💳 *Deposit Instructions*

*Payment Methods:*
1. *Telebirr*: 0945 34 31 43
2. *CBE*: 1000193615547
3. *BOA*: 65637448

*Minimum:* 10 ETB

*Steps:*
1. Send money to any account above
2. Take screenshot of payment
3. Send screenshot here
4. We verify in 2 minutes
5. Balance updates automatically

💰 *Current Rates:*
• 10 ETB = 1 board
        """
        
        keyboard = [
            [InlineKeyboardButton("📸 Send Screenshot", callback_data="send_screenshot")],
            [InlineKeyboardButton("🔙 Back", callback_data="back")],
        ]
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            deposit_text,
            reply_markup=reply_markup,
            parse_mode="Markdown",
        )
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        help_text = """
🎯 *ShebaBingo Help*

*Game Rules:*
• Complete any row, column, or diagonal
• Maximum 3 boards per player
• Each board costs 10 ETB

*How to Win:*
1. Select boards during registration
2. Mark numbers as they're called
3. Click CLAIM BINGO when you complete a line
4. Win your share of the prize pool!

*Payment Issues?*
📞 Call: +251945343143
📱 Telegram: @ShebaBingoSupport

*Fraud Prevention:*
• All games are monitored
• Fake BINGO claims result in board elimination
• Multiple violations lead to account suspension
        """
        
        await update.message.reply_text(help_text, parse_mode="Markdown")
    
    async def handle_photo(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle payment screenshots"""
        user = update.effective_user
        await update.message.reply_text(
            f"📸 *Payment screenshot received, {user.first_name}!*\n\n"
            "Our admin will verify your deposit within 2 minutes.\n"
            "You'll receive a confirmation message here.",
            parse_mode="Markdown",
        )
        
        # Here you would forward to admin or save to database
        # For now, we'll just log it
        logger.info(f"Payment screenshot from user {user.id}")
    
    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle all callback queries"""
        query = update.callback_query
        await query.answer()
        
        data = query.data
        
        if data == "back":
            await self.start(update, context)
        elif data == "stats":
            await self.show_stats(update, context)
        elif data == "help":
            await self.help_command(update, context)
    
    async def show_stats(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Show user statistics"""
        query = update.callback_query
        user_id = str(query.from_user.id)
        
        if user_id in self.users:
            user_data = self.users[user_id]
            stats_text = f"""
📊 *Your Statistics*

💰 Balance: {user_data['balance']:.1f} ETB
🎮 Games Played: {user_data['games_played']}
🏆 Games Won: {user_data.get('games_won', 0)}
💵 Total Won: {user_data['total_won']:.1f} ETB
📈 Win Rate: {user_data.get('win_rate', 0):.1f}%
👑 Player Level: {self.get_player_level(user_data)}
            """
        else:
            stats_text = "No statistics available yet. Play a game!"
        
        keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="back")]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            stats_text,
            reply_markup=reply_markup,
            parse_mode="Markdown",
        )
    
    def get_player_level(self, user_data: Dict) -> str:
        """Calculate player level based on games played"""
        games = user_data.get("games_played", 0)
        if games >= 100:
            return "🏆 Bingo Master"
        elif games >= 50:
            return "⭐ Expert"
        elif games >= 20:
            return "🔥 Advanced"
        elif games >= 5:
            return "🚀 Intermediate"
        else:
            return "🎯 Beginner"

def main():
    """Start the bot"""
    if not TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN environment variable not set!")
        return
    
    # Create bot instance
    bot = ShebaBingoBot()
    
    # Build application
    application = Application.builder().token(TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", bot.start))
    application.add_handler(CommandHandler("help", bot.help_command))
    
    # Callback queries
    application.add_handler(CallbackQueryHandler(bot.handle_callback))
    
    # Photo handler for payment screenshots
    application.add_handler(MessageHandler(filters.PHOTO, bot.handle_photo))
    
    # Start bot
    logger.info("🤖 ShebaBingo Bot is starting...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()