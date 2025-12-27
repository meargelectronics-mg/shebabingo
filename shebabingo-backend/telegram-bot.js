// telegram-bot.js - SEPARATE from index.js
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Your bot token from @BotFather
const token = process.env.BOT_TOKEN || '8274404754:AAF1q7ofQdkpMor6Gn6kRmQ7TBHE8o3toBg';
const bot = new TelegramBot(token, { polling: true });

// Your backend API URL
const API_BASE = 'http://localhost:3000';

console.log('🤖 ShebaBingo Telegram Bot started...');

// ==================== COMMAND HANDLERS ====================

// /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    
    bot.sendMessage(chatId, 
        `🎉 Welcome to ShebaBingo, ${username}!\n\n` +
        `Use /play to start a game\n` +
        `Use /deposit to add funds\n` +
        `Use /balance to check your balance\n\n` +
        `🎁 New users get 10 ETB welcome bonus!`
    );
    
    // Register user with backend
    fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            telegram_id: userId,
            username: username
        })
    }).catch(console.error);
});

// /deposit command (Geez Bingo style)
bot.onText(/\/deposit/, (msg) => {
    const chatId = msg.chat.id;
    
    // Show payment options EXACTLY like Geez Bingo
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { 
                        text: "የ Telebirr አካውንት", 
                        callback_data: "deposit_telebirr" 
                    }
                ],
                [
                    { 
                        text: "CBE Birr", 
                        callback_data: "deposit_cbe" 
                    }
                ],
                [
                    { 
                        text: "Bank of Abyssinia", 
                        callback_data: "deposit_boa" 
                    }
                ]
            ]
        }
    };
    
    bot.sendMessage(chatId, 
        `Please select the bank option you wish to use for the top-up.`,
        options
    );
});

// Handle callback queries (button clicks)
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    if (data === 'deposit_telebirr') {
        const instructions = `የ Telebirr አካውንት
0990204142 - ShebaBingo

መመሪያ

1. ከላይ ባለው የ Telebirr አካውንት ገንዘቡን ያስገቡ
2. ብሩን ስትልኩ የከፈላችሁትን መረጃ የያዝ አጭር የጹሁፍ መልክት(sms) ከ Telebirr ይደርሳችኋል
3. የደረሳችሁን አጭር የጹሁፍ መልክት(sms) ሙሉዉን ኮፒ(copy) በማረግ ከታሽ ባለው የቴሌግራም የጹሁፍ ማስገቢአው ላይ ፔስት(paste) በማረግ ይላኩት

የሚያጋጥማቹ የክፍያ ችግር ካለ @AdminSupport በዚ ሳፖርት ማዉራት ይችላሉ`;
        
        bot.sendMessage(chatId, instructions);
        
        // Listen for the next message (SMS text)
        const listenerId = bot.once('message', async (smsMsg) => {
            if (smsMsg.chat.id === chatId && smsMsg.text) {
                const smsText = smsMsg.text;
                
                // Check if it looks like a Telebirr SMS
                if (smsText.includes('transferred ETB') && smsText.includes('Ethio telecom')) {
                    
                    // Show processing message (like Geez Bingo)
                    bot.sendMessage(chatId, 
                        `Deposit request received. Your top-up will be done in 1 minute.`
                    );
                    
                    try {
                        // Send to backend API
                        const response = await fetch(`${API_BASE}/api/deposit/sms`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                telegram_id: smsMsg.from.id,
                                sms_text: smsText
                            })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            console.log(`Deposit request sent: ${result.deposit_id}`);
                        } else {
                            bot.sendMessage(chatId, 
                                `❌ Error: ${result.error || 'Please paste the complete Telebirr SMS'}`
                            );
                        }
                        
                    } catch (error) {
                        bot.sendMessage(chatId, `❌ Server error: ${error.message}`);
                    }
                    
                } else {
                    bot.sendMessage(chatId, 
                        `❌ That doesn't look like a Telebirr SMS. Please paste the complete message from Telebirr.`
                    );
                }
                
                // Remove the listener
                bot.removeListener('message', listenerId);
            }
        });
        
        // Set timeout for listener (5 minutes)
        setTimeout(() => {
            bot.removeListener('message', listenerId);
        }, 5 * 60 * 1000);
        
    }
    
    // Answer the callback query (removes "loading" on button)
    bot.answerCallbackQuery(callbackQuery.id);
});

// /balance command
bot.onText(/\/balance/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    try {
        const response = await fetch(`${API_BASE}/api/user/${userId}/balance`);
        const data = await response.json();
        
        bot.sendMessage(chatId,
            `💰 Your Balance\n\n` +
            `Available: ${data.balance || 0} ETB\n\n` +
            `Use /deposit to add more funds\n` +
            `Use /play to start a game`
        );
    } catch (error) {
        bot.sendMessage(chatId, `❌ Error fetching balance`);
    }
});

// /play command
bot.onText(/\/play/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId,
        `🎮 Starting ShebaBingo...\n\n` +
        `🍀 Best of luck on your gaming adventure!\n\n` +
        `Minimum bet: 10 ETB\n` +
        `Current prize pool: 0 ETB\n\n` +
        `Opening game interface...`
    );
    
    // Here you would open your web app or start a game
});

// Error handling
bot.on('polling_error', (error) => {
    console.error('Bot polling error:', error);
});

console.log('✅ Bot is running and listening for commands...');