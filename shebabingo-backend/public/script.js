// Game Configuration
const CONFIG = {
    BET_AMOUNT: 10,
    TOTAL_BOARDS: 400,
    MAX_BOARDS_PER_PLAYER: 3,
    SELECTION_TIME: 25,
    SHUFFLE_TIME: 3,
    CHECKING_TIME: 3,
    BINGO_NUMBERS: {
        'B': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        'I': [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        'N': [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
        'G': [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
        'O': [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75]
    },
    
    GAME_MODES: {
        classic: {
            name: 'Classic Bingo',
            enabled: true,
            description: 'Complete any row, column, or diagonal',
            callInterval: 3000
        }
    },
    
    BOT_DIFFICULTY: {
        easy: {
            name: 'Easy',
            description: 'Marks numbers slowly',
            reactionTime: { min: 3000, max: 8000 },
            markChance: 0.7
        },
        medium: {
            name: 'Medium', 
            description: 'Strategic marking',
            reactionTime: { min: 2000, max: 5000 },
            markChance: 0.85
        },
        hard: {
            name: 'Hard',
            description: 'Multiple board strategy', 
            reactionTime: { min: 1000, max: 3000 },
            markChance: 0.95
        }
    },
    
    LAZYLOAD: {
        enabled: false,
        enableServiceWorker: false
    }
};

// Internationalization Support - Amharic & English Only
const TRANSLATIONS = {
    en: {
        // Game Status
        waiting: "Waiting for Next Game",
        selecting: "Selecting Boards",
        shuffling: "Shuffling Numbers...",
        started: "Game Started",
        checking: "Checking for BINGO...",
        finished: "Game Finished",
        
        // UI Elements
        balance: "Balance",
        prize: "Prize",
        players: "Players",
        bet: "Bet",
        called: "Called",
        currentCall: "Current Call",
        recentlyCalled: "Recently Called",
        howToWin: "How to Win",
        winCondition: "Row • Column • Diagonal",
        yourBoards: "Your Bingo Boards",
        claimBingo: "🎯 CLAIM BINGO",
        
        // Registration
        pricePerBoard: "Price per board:",
        maxBoards: "Max boards per player:",
        timeRemaining: "Time remaining:",
        boardsSelected: "Boards Selected:",
        totalCost: "Total Cost:",
        cancel: "Cancel",
        confirmJoin: "Confirm Selection & Join Game",
        
        // Messages
        boardTaken: "This board is already taken by another player!",
        maxBoardsReached: "Maximum 3 boards allowed per player",
        selectOneBoard: "Please select at least one board",
        insufficientBalance: "Insufficient balance",
        cannotClaimBingo: "You cannot claim BINGO at this time.",
        fraudDetected: "FRAUD DETECTED! You marked numbers that were not called. Board(s) eliminated!",
        noBingo: "All boards eliminated - No BINGO found!",
        allFraud: "All boards eliminated due to FRAUD! You marked uncalled numbers.",
        
        // Winner Notification
        you: "(YOU) 💹",
        nextGame: "Next game starting automatically...",
        seconds: "Sec",

        // New Features
        live: "LIVE",
        spectator: "Spectator Mode",
        watching: "Watching Game",
        joinNext: "Join Next Game",

        // NEW: Game title and other static text
        gameTitle: "🎯 ShebaBingo",
        supportTitle: "💬 Support",
        howToPlay: "How to Play",
        payments: "Payments",
        prizes: "Prizes",
        gameRules: "Game Rules",
        
        // NEW: Support modal content
        supportTelegram: "Contact us on Telegram",
        supportHelp: "Quick Help & FAQ",
        supportCall: "Call Support",
        supportContact: "Need more help? Contact us via Telegram or phone!",
        
        // NEW: Game instructions
        selectBoardsInstruction: "Select 1-3 boards during registration",
        markNumbersInstruction: "Mark numbers as they are called",
        winConditionInstruction: "Complete a row, column, or diagonal to win",
        claimBingoInstruction: 'Click "CLAIM BINGO" when you have a winning pattern',
        boardCostInstruction: "Each board costs 10 ETB to play",
        
        // NEW: Payment instructions
        minDeposit: "Minimum deposit: 10 ETB",
        minWithdrawal: "Minimum withdrawal: 50 ETB",
        supportedPayment: "Supported: Telebirr, CBE, BOA",
        withdrawalTime: "Withdrawals processed within 5 minutes",
        
        // NEW: Prize instructions
        autoPrize: "Prizes automatically added to balance",
        multipleWinners: "Multiple winners split the prize",
        
        // NEW: Call support
        callSupportTitle: "📞 Call Support",
        immediateAssistance: "For immediate assistance, call our support team:",
        supportNumber: "+251945343143",
        supportAvailability: "Available 24/7 for game support and account issues",
        
        // NEW: Fraud messages
        fraudClaimed: "🚨 You claimed BINGO without a valid pattern. Board eliminated!",
        
        // NEW: No winner message
        noWinnerRound: "No Winners This Round!",
        prizeCarryOver: "Prize carried over to next game",
        
        // NEW: Table headers
        bingoB: "B",
        bingoI: "I",
        bingoN: "N",
        bingoG: "G",
        bingoO: "O",
        
        // NEW: Game phases
        gameOver: "Game Over",
        selectingBoards: "Selecting Boards",
        shufflingNumbers: "Shuffling Numbers",
        gameInProgress: "Game In Progress",
        checkingBingo: "Checking Bingo",
        
        // NEW: Button texts
        playBingo: "🎮 PLAY BINGO",
        close: "Close",
        ok: "OK"
    },
    am: {
        // Game Status
        waiting: "የሚቀጥለው ጨዋታ በመጠበቅ ላይ",
        selecting: "ቦርዶች በመምረጥ ላይ",
        shuffling: "ቁጥሮች በማደባለቅ ላይ...",
        started: "ጨዋታው ጀምሯል",
        checking: "ቢንጎ በመፈተሽ ላይ...",
        finished: "ጨዋታው ተጠናቋል",
        
        // UI Elements
        balance: "ቀሪ ሂሳብ",
        prize: "ሽልማት",
        players: "ተጫዋቾች",
        bet: "ውርርድ",
        called: "የተጠራ",
        currentCall: "የአሁኑ ጥሪ",
        recentlyCalled: "በቅርብ ጊዜ የተጠሩ",
        howToWin: "እንዴት እንደሚያሸንፉ",
        winCondition: "ረድፍ • አምድ • ሰያፍ",
        yourBoards: "የእርስዎ ቢንጎ ቦርዶች",
        claimBingo: "🎯 ቢንጎ አለኝ",
        
        // Registration
        pricePerBoard: "የአንድ ቦርድ ዋጋ:",
        maxBoards: "ከፍተኛ ቦርዶች በአንድ ተጫዋች:",
        timeRemaining: "የቀረው ጊዜ:",
        boardsSelected: "የተመረጡ ቦርዶች:",
        totalCost: "ጠቅላላ ወጪ:",
        cancel: "ሰርዝ",
        confirmJoin: "ምርጫ አረጋግጥ እና ወደ ጨዋታ ይቀላቀሉ",
        
        // Messages
        boardTaken: "ይህ ቦርድ በሌላ ተጫዋች ተያዝቷል!",
        maxBoardsReached: "ከፍተኛው 3 ቦርዶች ብቻ ይፈቀዳሉ",
        selectOneBoard: "እባክዎ ቢያንስ አንድ ቦርድ ይምረጡ",
        insufficientBalance: "በቂ ቀሪ ሂሳብ የለም",
        cannotClaimBingo: "በዚህ ጊዜ ቢንጎ ማምጣት አይችሉም።",
        fraudDetected: "ማጭበርበር ተገኝቷል! ያልተጠሩ ቁጥሮችን ምልክት አድርገዋል። ቦርድ(ዎች) ተሰርዘዋል!",
        noBingo: "ሁሉም ቦርዶች ተሰርዘዋል - ቢንጎ አልተገኘም!",
        allFraud: "ሁሉም ቦርዶች በማጭበርበር ተሰርዘዋል! ያልተጠሩ ቁጥሮችን ምልክት አድርገዋል።",
        
        // Winner Notification
        you: "(አንተ) 💹",
        nextGame: "የሚቀጥለው ጨዋታ በራስ ሰር እየጀመረ...",
        seconds: "ሰከንድ",
        
        // New Features
        live: "ቀጥታ",
        spectator: "የተመልካች ሁነታ",
        watching: "ጨዋታን በመመልከት ላይ",
        joinNext: "ወደ ቀጣዩ ጨዋታ ይቀላቀሉ",
        
        // NEW: Game title and other static text
        gameTitle: "🎯 ሸባ ቢንጎ",
        supportTitle: "💬 ድጋፍ",
        howToPlay: "እንዴት እንደሚጫወቱ",
        payments: "ክፍያዎች",
        prizes: "ሽልማቶች",
        gameRules: "የጨዋታ ደንቦች",
        
        // NEW: Support modal content
        supportTelegram: "በቴሌግራም ያግኙን",
        supportHelp: "ፈጣን እገዛ እና ጥያቄዎች",
        supportCall: "ድጋፍ ይደውሉ",
        supportContact: "ተጨማሪ እገዛ የሚፈልጉ? በቴሌግራም ወይም ስልክ ያግኙን!",
        
        // NEW: Game instructions
        selectBoardsInstruction: "በምዝገባ ጊዜ 1-3 ቦርዶች ይምረጡ",
        markNumbersInstruction: "ቁጥሮች እየተጠሩ ምልክት ያድርጉ",
        winConditionInstruction: "ረድፍ፣ አምድ ወይም ሰያፍ ይጠናቀቁ",
        claimBingoInstruction: 'የማሸነፍ ንድፍ ሲኖርዎት "ቢንጎ አለኝ" ይጫኑ',
        boardCostInstruction: "እያንዳንዱ ቦርድ 10 ETB ያስከፍላል",
        
        // NEW: Payment instructions
        minDeposit: "አነስተኛ ተቀማጭ: 10 ETB",
        minWithdrawal: "አነስተኛ መልሶ ማውጣት: 50 ETB",
        supportedPayment: "የሚደገፉ: ቴሌቢር፣ ኢትዮጵያ ንግድ ባንክ፣ ባንክ ማስተላለፍ",
        withdrawalTime: "መልሶ ማውጣቶች በ5 ደቂቃዎች ውስጥ ይከናወናሉ",
        
        // NEW: Prize instructions
        autoPrize: "ሽልማቶች በራስ ሰር ወደ ቀሪ ሂሳብ ይጨመራሉ",
        multipleWinners: "ብዙ አሸናፊዎች ሽልማቱን ይካፈላሉ",
        
        // NEW: Call support
        callSupportTitle: "📞 ድጋፍ ይደውሉ",
        immediateAssistance: "ለፈጣን እገዛ፣ የድጋፍ ቡድናችንን ይደውሉ:",
        supportNumber: "+251945343143",
        supportAvailability: "ለጨዋታ ድጋፍ እና ሂሳብ ችግሮች 24/7 ይገኛል",
        
        // NEW: No winner message
        noWinnerRound: "በዚህ ዙር አሸናፊ የለም!",
        prizeCarryOver: "ሽልማቱ ለቀጣዩ ጨዋታ ይዛወራል",
        
        // NEW: Table headers
        bingoB: "B",
        bingoI: "I",
        bingoN: "N",
        bingoG: "G",
        bingoO: "O",
        
        // NEW: Game phases
        gameOver: "ጨዋታው አልቋል",
        selectingBoards: "ቦርዶች በመምረጥ ላይ",
        shufflingNumbers: "ቁጥሮች በማደባለቅ ላይ",
        gameInProgress: "ጨዋታው እየተካሄደ ነው",
        checkingBingo: "ቢንጎ በመፈተሽ ላይ",
        
        // NEW: Button texts
        playBingo: "🎮 ቢንጎ ተጫውት",
        close: "መዝጋት",
        ok: "እሺ"
    }
};

// Global Game State
let gameState = {
    // Player state
    currentPlayer: {
        id: null,
        name: 'Player',
        telegramName: '',
        balance: 0,
        boards: [],
        isActive: false,
        totalPaid: 0,
        username: 'Player'
    },
    
    // Multiplayer state
    allPlayers: [],
    activePlayers: [],
    winners: [],
    
    // Game state
    selectedBoards: new Set(),
    availableBoards: Array.from({length: CONFIG.TOTAL_BOARDS}, (_, i) => i + 1),
    gamePhase: 'waiting',
    calledNumbers: [],
    currentCall: null,
    selectionTimer: CONFIG.SELECTION_TIME,
    timerInterval: null,
    callInterval: null,
    
    // Game statistics
    totalPrizePool: 0,
    commissionRate: 0.20,
    ownerCommission: 0,
    totalCommissionEarned: 0,
    
    // Internationalization
    currentLanguage: 'en',
    
    // Track current board view
    currentBoardIndex: 0
};

// WebSocket and Game Connection
let gameSocket = null;
let currentGameId = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// DOM Elements
const elements = {
    // Main screen elements
    balanceValue: document.getElementById('balanceValue'),
    prizeValue: document.getElementById('prizeValue'),
    playersValue: document.getElementById('playersValue'),
    calledCount: document.getElementById('calledCount'),
    gameStatus: document.getElementById('gameStatus'),
    currentLetter: document.getElementById('currentLetter'),
    currentNumber: document.getElementById('currentNumber'),
    calledNumbersList: document.getElementById('calledNumbersList'),
    bingoGrid: document.getElementById('bingoGrid'),
    
    // Registration popup elements
    registrationPopup: document.getElementById('registrationPopup'),
    boardsGrid: document.getElementById('boardsGrid'),
    selectedCount: document.getElementById('selectedCount'),
    totalCost: document.getElementById('totalCost'),
    confirmSelection: document.getElementById('confirmSelection'),
    selectionTimer: document.getElementById('selectionTimer'),
    
    // Game play section elements
    gamePlaySection: document.getElementById('gamePlaySection'),
    boardsCarousel: document.getElementById('boardsCarousel'),
    currentBoard: document.getElementById('currentBoard'),
    
    // Language selector
    languageSelector: null
};

// Get user ID from URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user') || localStorage.getItem('sheba_user_id') || 'demo_user_' + Math.floor(Math.random() * 10000);

// Store user ID
localStorage.setItem('sheba_user_id', userId);
gameState.currentPlayer.id = userId;

// Get translation helper
function t(key) {
    return TRANSLATIONS[gameState.currentLanguage][key] || TRANSLATIONS.en[key] || key;
}

// ==================== INITIALIZATION ====================

// Initialize Telegram Web App
function initializeTelegram() {
    if (typeof window.Telegram !== 'undefined' && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        
        // Get user data from Telegram
        const telegramUser = tg.initDataUnsafe?.user;
        
        if (telegramUser?.id) {
            // User opened from Telegram button
            gameState.currentPlayer.id = telegramUser.id;
            gameState.currentPlayer.name = telegramUser.first_name || 'Telegram User';
            gameState.currentPlayer.telegramName = telegramUser.username ? 
                '@' + telegramUser.username : gameState.currentPlayer.name;
            
            // Configure Telegram Web App
            tg.expand();
            tg.enableClosingConfirmation();
            tg.setHeaderColor('#8b3de8');
            tg.setBackgroundColor('#d7b9f7');
            
            // Set back button behavior
            tg.BackButton.onClick(() => {
                tg.close();
            });
            
            console.log('✅ Telegram Web App initialized for user:', gameState.currentPlayer.name);
            return true;
        }
    }
    console.log('ℹ️ Running in browser mode');
    return false;
}

// Load user balance from server
async function loadBalanceFromServer() {
    try {
        const response = await fetch(`/api/user/${userId}/balance`);
        const data = await response.json();
        
        if (data.success) {
            gameState.currentPlayer.balance = data.balance;
            gameState.currentPlayer.username = data.username || gameState.currentPlayer.name;
            
            // Update display
            if (elements.balanceValue) {
                elements.balanceValue.textContent = data.balance;
            }
            
            console.log('💰 Balance loaded:', data.balance);
            return true;
        } else {
            // Fallback for testing
            gameState.currentPlayer.balance = 1000;
            if (elements.balanceValue) {
                elements.balanceValue.textContent = gameState.currentPlayer.balance;
            }
            return false;
        }
    } catch (error) {
        console.error('Error loading balance:', error);
        // Fallback for testing
        gameState.currentPlayer.balance = 1000;
        if (elements.balanceValue) {
            elements.balanceValue.textContent = gameState.currentPlayer.balance;
        }
        return false;
    }
}

// ==================== MULTIPLAYER WEBSOCKET CONNECTION ====================

function connectToMultiplayerServer(gameId) {
    if (!gameId) {
        console.error('❌ Cannot connect: No game ID provided');
        return;
    }
    
    currentGameId = gameId;
    
    // Determine WebSocket URL
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    let wsUrl;
    
    if (isLocalhost) {
        // Local development
        wsUrl = `ws://localhost:${window.location.port || 3000}/game-ws?gameId=${gameId}&userId=${userId}`;
    } else {
        // Production on Render
        const renderHost = window.location.host;
        wsUrl = `wss://${renderHost}/game-ws?gameId=${gameId}&userId=${userId}`;
    }
    
    console.log('🔗 Connecting to WebSocket:', wsUrl);
    
    // Close existing connection if any
    if (gameSocket) {
        gameSocket.close();
    }
    
    gameSocket = new WebSocket(wsUrl);
    
    // Set heartbeat
    gameSocket.isAlive = true;
    let heartbeatInterval;
    
    gameSocket.onopen = () => {
        console.log('✅ WebSocket CONNECTED to game:', gameId);
        reconnectAttempts = 0;
        
        // Start heartbeat
        heartbeatInterval = setInterval(() => {
            if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
                try {
                    gameSocket.send(JSON.stringify({ type: 'ping' }));
                } catch (error) {
                    console.log('Heartbeat send error:', error);
                }
            }
        }, 25000);
        
        // Request initial game state
        setTimeout(() => {
            if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
                gameSocket.send(JSON.stringify({ 
                    type: 'get_state',
                    gameId: gameId,
                    userId: userId,
                    timestamp: Date.now()
                }));
            }
        }, 1000);
    };
    
    gameSocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message:', data.type);
            
            // Handle heartbeat response
            if (data.type === 'pong') {
                gameSocket.isAlive = true;
                return;
            }
            
            handleGameMessage(data);
            
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    };
    
    gameSocket.onerror = (error) => {
        console.error('❌ WebSocket ERROR:', error);
        clearInterval(heartbeatInterval);
    };
    
    gameSocket.onclose = (event) => {
        console.log('🔌 WebSocket CLOSED:', event.code, event.reason);
        clearInterval(heartbeatInterval);
        gameSocket = null;
        
        // Try to reconnect
        if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(`🔄 Reconnecting (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
            
            setTimeout(() => {
                if (currentGameId) {
                    connectToMultiplayerServer(currentGameId);
                }
            }, 5000);
        }
    };
}

// Handle WebSocket messages
function handleGameMessage(message) {
    console.log('🎮 Processing message type:', message.type);
    
    switch(message.type) {
        case 'game_state':
            console.log('📊 Game state update received');
            updateGameFromServer(message.data);
            break;
            
        case 'player_joined':
            console.log(`👥 Player joined: ${message.username}`);
            updatePlayersCount(message.playerCount);
            break;
            
        case 'player_left':
            console.log(`👋 Player left: ${message.userId}`);
            updatePlayersCount(message.playerCount);
            break;
            
        case 'number_called':
            console.log(`🔔 Number called: ${message.number}`);
            handleNumberCalled(message.number, message.calledNumbers);
            break;
            
        case 'number_marked':
            console.log(`✅ Number marked by ${message.username}: ${message.number}`);
            break;
            
        case 'winner':
            console.log(`🏆 Winner: ${message.username} won ${message.prize} ETB`);
            handleWinnerMessage(message.userId, message.username, message.prize);
            break;
            
        case 'game_status':
            console.log(`🔄 Game status: ${message.status} - ${message.message}`);
            updateGameStatusDisplay(message.status, message.message);
            break;
            
        case 'game_ended':
            console.log('⏰ Game ended:', message.message);
            showGameEndedMessage(message.message);
            break;
            
        case 'chat':
            console.log(`💬 ${message.username}: ${message.message}`);
            break;
            
        default:
            console.log('Unknown message type:', message.type);
    }
}

// Update game from server data
function updateGameFromServer(serverState) {
    if (!serverState) return;
    
    console.log('🔄 Updating game from server state');
    
    // Update game phase
    if (serverState.game && serverState.game.status) {
        gameState.gamePhase = serverState.game.status;
        updateGameStatusDisplay();
        
        // Show/hide game play section based on status
        if (serverState.game.status === 'active' || serverState.game.status === 'shuffling') {
            elements.gamePlaySection.style.display = 'block';
        }
    }
    
    // Update players count
    if (serverState.players) {
        updatePlayersCount(serverState.players.length);
    }
    
    // Update prize pool
    if (serverState.game && serverState.game.prizePool) {
        gameState.totalPrizePool = serverState.game.prizePool;
        elements.prizeValue.textContent = Math.floor(gameState.totalPrizePool);
    }
    
    // Update called numbers
    if (serverState.game && serverState.game.calledNumbers) {
        gameState.calledNumbers = serverState.game.calledNumbers.map(cn => {
            const num = cn.replace(/[BINGO]/, '');
            return parseInt(num);
        });
        updateCalledNumbersList();
    }
    
    // Update current call
    if (serverState.game && serverState.game.currentCall) {
        const call = serverState.game.currentCall;
        const letter = call.charAt(0);
        const number = parseInt(call.substring(1));
        
        gameState.currentCall = { letter, number };
        updateGameDisplay();
    }
    
    // Update player's boards if they exist
    if (serverState.player && serverState.player.boards) {
        console.log('🎴 Loading player boards from server');
        
        gameState.currentPlayer.boards = serverState.player.boards.map(board => ({
            boardNumber: board.boardNumber,
            boardData: board.boardData,
            markedNumbers: new Set(board.markedNumbers || []),
            isWinner: false,
            isEliminated: false
        }));
        
        // Mark numbers on the boards
        if (serverState.player.markedNumbers && serverState.player.markedNumbers.length > 0) {
            serverState.player.markedNumbers.forEach(number => {
                gameState.currentPlayer.boards.forEach(board => {
                    if (!board.isEliminated) {
                        // Check if this number is on the board
                        for (let row = 0; row < 5; row++) {
                            for (let col = 0; col < 5; col++) {
                                if (board.boardData[row][col] === number) {
                                    board.markedNumbers.add(number);
                                }
                            }
                        }
                    }
                });
            });
        }
        
        // Display boards if we have them
        if (gameState.currentPlayer.boards.length > 0) {
            console.log(`📋 Displaying ${gameState.currentPlayer.boards.length} boards`);
            gameState.currentPlayer.isActive = true;
            displayCurrentPlayerBoards(0);
        }
    }
}

// ==================== GAME FLOW FUNCTIONS ====================

// Start game cycle
function startGameCycle() {
    console.log('🔄 Starting game cycle...');
    gameState.gamePhase = 'waiting';
    updateGameStatusDisplay();
    
    // Check for active games
    checkForActiveGames();
}

// Check for active games
async function checkForActiveGames() {
    try {
        console.log('🔍 Checking for active games...');
        const response = await fetch('/api/games/active');
        const data = await response.json();
        
        if (data.success && data.games && data.games.length > 0) {
            console.log(`🎮 Found ${data.games.length} active game(s)`);
            
            // Find a game in selection phase
            const selectingGame = data.games.find(game => 
                game.status === 'selecting' && 
                game.player_count < 100 // MAX_PLAYERS
            );
            
            if (selectingGame) {
                console.log(`🎯 Found game #${selectingGame.game_number}: ${selectingGame.id}`);
                console.log(`👥 Players: ${selectingGame.player_count}, Status: ${selectingGame.status}`);
                
                // Calculate time left
                if (selectingGame.selection_end_time) {
                    const endTime = new Date(selectingGame.selection_end_time);
                    const now = new Date();
                    const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
                    
                    console.log(`⏰ Selection ends in: ${timeLeft} seconds`);
                    
                    // If less than 5 seconds left, skip and wait for next game
                    if (timeLeft < 5) {
                        console.log('⚠️ Too little time left, waiting for next game');
                        showWaitForNextGame(`Next game starting soon...`);
                        setTimeout(() => checkForActiveGames(), 5000);
                        return;
                    }
                    
                    // Set the timer from server
                    gameState.selectionTimer = timeLeft;
                }
                
                // Show registration popup to join this game
                openRegistrationPopup();
                return;
            }
            
            // Check for active/shuffling games to watch
            const activeGame = data.games.find(game => 
                game.status === 'shuffling' || game.status === 'active'
            );
            
            if (activeGame) {
                console.log(`👀 Active game found (${activeGame.status}), showing spectator mode`);
                showSpectatorMessage(`Watching Game #${activeGame.game_number}`);
                return;
            }
        }
        
        // No suitable game found
        console.log('🆕 No suitable game found, starting local selection');
        setTimeout(() => {
            startBoardSelection();
        }, 2000);
        
    } catch (error) {
        console.error('Error checking active games:', error);
        // Fallback to local mode
        setTimeout(() => {
            startBoardSelection();
        }, 3000);
    }
}

// Start local board selection
function startBoardSelection() {
    gameState.gamePhase = 'selecting';
    updateGameStatusDisplay();
    
    // Reset game state for new round
    gameState.calledNumbers = [];
    gameState.currentCall = null;
    gameState.selectedBoards.clear();
    gameState.activePlayers = [];
    gameState.totalPrizePool = 0;
    gameState.ownerCommission = 0;
    gameState.winners = [];
    gameState.currentBoardIndex = 0;

    gameState.ownerCommissionTotal = 0;
    gameState.commissionHistory = [];
    gameState.withdrawalHistory = [];

    // Clear any existing intervals
    if (gameState.callInterval) {
        clearInterval(gameState.callInterval);
        gameState.callInterval = null;
    }
    
    // Open registration popup automatically
    openRegistrationPopup();
    
    // Start selection timer
    startSelectionTimer();
}

// ==================== REGISTRATION POPUP ====================

function openRegistrationPopup() {
    elements.registrationPopup.style.display = 'flex';
    generateBoardOptions();
    updateSelectionInfo();
    
    // Clear any existing interval
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // Use server timer or default
    if (gameState.selectionTimer && gameState.selectionTimer > 0) {
        console.log(`⏰ Using server timer: ${gameState.selectionTimer} seconds`);
        updateTimerDisplay();
    } else {
        gameState.selectionTimer = CONFIG.SELECTION_TIME;
        updateTimerDisplay();
    }
    
    // Start countdown
    gameState.timerInterval = setInterval(() => {
        gameState.selectionTimer--;
        updateTimerDisplay();
        
        if (gameState.selectionTimer <= 0) {
            clearInterval(gameState.timerInterval);
            autoConfirmSelection();
        }
    }, 1000);
}

function closeRegistrationPopup() {
    elements.registrationPopup.style.display = 'none';
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function generateBoardOptions() {
    elements.boardsGrid.innerHTML = '';
    
    gameState.availableBoards.forEach(boardNumber => {
        const boardElement = document.createElement('div');
        boardElement.className = 'board-option';
        boardElement.innerHTML = `<div class="board-number">${boardNumber}</div>`;
        
        // Check if board is taken
        const isTaken = isBoardTaken(boardNumber);
        
        if (isTaken) {
            boardElement.classList.add('taken');
            boardElement.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            boardElement.style.color = 'white';
            boardElement.style.cursor = 'not-allowed';
            boardElement.style.opacity = '0.7';
            boardElement.style.border = '2px solid #e74c3c';
            
            // Add a taken indicator
            const takenIndicator = document.createElement('div');
            takenIndicator.className = 'taken-indicator';
            takenIndicator.innerHTML = '✗';
            takenIndicator.style.cssText = `
                position: absolute;
                top: 2px;
                right: 2px;
                color: white;
                font-size: 10px;
                background: rgba(0,0,0,0.5);
                border-radius: 50%;
                width: 15px;
                height: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            boardElement.style.position = 'relative';
            boardElement.appendChild(takenIndicator);
        }
        
        boardElement.addEventListener('click', () => toggleBoardSelection(boardNumber, boardElement));
        elements.boardsGrid.appendChild(boardElement);
    });
}

function isBoardTaken(boardNumber) {
    // Check if taken by any active player
    for (let player of gameState.activePlayers) {
        if (player.boards.some(board => board.boardNumber === boardNumber)) {
            return true;
        }
    }
    
    // Also check if current player has already selected this board
    if (gameState.selectedBoards.has(boardNumber)) {
        return false; // Not "taken" since it's selected by current player
    }
    
    return false;
}

function toggleBoardSelection(boardNumber, element) {
    // Check if board is taken by OTHER players
    if (isBoardTaken(boardNumber) && !gameState.selectedBoards.has(boardNumber)) {
        element.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
        
        alert(t('boardTaken'));
        return;
    }
    
    if (element.classList.contains('taken')) {
        return;
    }
    
    if (gameState.selectedBoards.has(boardNumber)) {
        // Deselect the board
        gameState.selectedBoards.delete(boardNumber);
        element.classList.remove('selected');
        element.style.background = '';
        element.style.color = '';
        element.style.border = '';
    } else if (gameState.selectedBoards.size < CONFIG.MAX_BOARDS_PER_PLAYER) {
        // Select the board
        gameState.selectedBoards.add(boardNumber);
        element.classList.add('selected');
        element.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
        element.style.color = 'white';
        element.style.border = '2px solid #27ae60';
    } else {
        // Maximum boards reached
        element.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
        
        alert(t('maxBoardsReached'));
        return;
    }
    
    updateSelectionInfo();
    validateForm();
}

function updateSelectionInfo() {
    const selectedCount = gameState.selectedBoards.size;
    const totalCost = selectedCount * CONFIG.BET_AMOUNT;
    
    elements.selectedCount.textContent = selectedCount;
    elements.totalCost.textContent = totalCost;
}

function validateForm() {
    const boardsValid = gameState.selectedBoards.size > 0;
    const hasEnoughBalance = (gameState.selectedBoards.size * CONFIG.BET_AMOUNT) <= gameState.currentPlayer.balance;
    elements.confirmSelection.disabled = !(boardsValid && hasEnoughBalance);
}

function updateTimerDisplay() {
    elements.selectionTimer.textContent = `${gameState.selectionTimer} ${t('seconds')}`;
    
    if (gameState.selectionTimer <= 10) {
        elements.selectionTimer.style.color = '#e74c3c';
    } else {
        elements.selectionTimer.style.color = '';
    }
}

// Auto confirm or close when timer expires
function autoConfirmSelection() {
    closeRegistrationPopup();
    
    if (gameState.selectedBoards.size === 0) {
        showWaitForNextGame('No boards selected. Waiting for next game...');
    } else {
        confirmSelection();
    }
}

// Confirm selection and join multiplayer game
async function confirmSelection() {
    if (gameState.selectedBoards.size === 0) {
        alert(t('selectOneBoard'));
        return;
    }
    
    const totalCost = gameState.selectedBoards.size * CONFIG.BET_AMOUNT;
    
    // Check balance
    if (totalCost > gameState.currentPlayer.balance) {
        alert(t('insufficientBalance'));
        return;
    }
    
    try {
        console.log('🚀 Joining multiplayer game via API...');
        
        const response = await fetch('/api/game/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                boardCount: gameState.selectedBoards.size,
                boardNumbers: Array.from(gameState.selectedBoards)
            })
        });
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.success) {
            console.log('✅ Successfully joined game:', data.gameId);
            
            // Store game ID
            currentGameId = data.gameId;
            
            // Connect WebSocket to this game
            connectToMultiplayerServer(data.gameId);
            
            // Update local state
            gameState.currentPlayer.isActive = true;
            gameState.currentPlayer.boards = data.boards.map(board => ({
                boardNumber: board.boardNumber,
                boardData: board.boardData,
                markedNumbers: new Set(board.markedNumbers || []),
                isWinner: false,
                isEliminated: false
            }));
            
            // Update UI
            closeRegistrationPopup();
            updateGameStats();
            
            // Show success message
            showGameMessage(`✅ Joined Game #${data.gameNumber}! Waiting for other players...`, 'success');
            
        } else {
            console.error('❌ Failed to join game:', data.error);
            alert('Failed to join game: ' + data.error);
        }
    } catch (error) {
        console.error('❌ Error joining multiplayer game:', error);
        alert('Network error. Please check your connection and try again.');
    }
}

// ==================== GAME PLAY FUNCTIONS ====================

// Handle number called from server
function handleNumberCalled(number, calledNumbers) {
    const letter = number.charAt(0);
    const num = parseInt(number.substring(1));
    
    console.log(`🎯 New number called: ${letter}${num}`);
    
    // Update called numbers list
    gameState.calledNumbers = calledNumbers.map(cn => {
        const n = cn.replace(/[BINGO]/, '');
        return parseInt(n);
    });
    
    // Update current call
    gameState.currentCall = { letter, number: num };
    
    // Update display
    updateGameDisplay();
    updateCalledNumbersList();
    
    // Auto-mark on player's boards
    if (gameState.currentPlayer.isActive && gameState.currentPlayer.boards) {
        let markedAny = false;
        
        gameState.currentPlayer.boards.forEach(board => {
            if (!board.isEliminated) {
                // Check if this number is on the board
                for (let row = 0; row < 5; row++) {
                    for (let col = 0; col < 5; col++) {
                        if (board.boardData[row][col] === num) {
                            board.markedNumbers.add(num);
                            markedAny = true;
                            console.log(`✅ Auto-marked ${number} on board ${board.boardNumber}`);
                        }
                    }
                }
            }
        });
        
        // Update board display if marked
        if (markedAny && gameState.currentPlayer.boards.length > 0) {
            displayCurrentPlayerBoards(gameState.currentBoardIndex);
        }
    }
}

// Mark number on player's boards
function markNumberOnPlayerBoards(number, callElement) {
    if (!gameState.currentPlayer.isActive) {
        console.log('Cannot mark number: Player not active');
        return;
    }
    
    // Send to server via WebSocket
    if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
        gameSocket.send(JSON.stringify({
            type: 'mark_number',
            gameId: currentGameId,
            userId: userId,
            number: number
        }));
        console.log(`✅ Marked number ${number} (sent to server)`);
    }
    
    // Update local state for immediate feedback
    gameState.currentPlayer.boards.forEach(board => {
        if (!board.isEliminated) {
            if (board.markedNumbers.has(number)) {
                board.markedNumbers.delete(number);
            } else {
                board.markedNumbers.add(number);
            }
        }
    });
    
    // Update display
    displayCurrentPlayerBoards(gameState.currentBoardIndex);
}

// Claim BINGO
function claimBingo() {
    if (!gameState.currentPlayer.isActive || !currentGameId) {
        alert(t('cannotClaimBingo'));
        return;
    }
    
    if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) {
        alert('Not connected to game server');
        return;
    }
    
    console.log('🎯 Claiming BINGO...');
    
    // Send BINGO claim to server
    gameSocket.send(JSON.stringify({
        type: 'claim_bingo',
        gameId: currentGameId,
        userId: userId
    }));
    
    // Show checking status
    gameState.gamePhase = 'checking';
    updateGameStatusDisplay();
    
    showGameMessage('🎯 BINGO claimed! Waiting for server validation...', 'info');
}

// ==================== UI UPDATE FUNCTIONS ====================

// Update game status display
function updateGameStatusDisplay(status, message) {
    const statusTexts = {
        'waiting': t('waiting'),
        'selecting': t('selecting'),
        'shuffling': t('shuffling'),
        'started': gameState.currentPlayer.isActive ? t('started') : t('waiting'),
        'checking': t('checking'),
        'finished': t('finished')
    };
    
    if (status) {
        gameState.gamePhase = status;
    }
    
    elements.gameStatus.textContent = statusTexts[gameState.gamePhase] || t('waiting');
    elements.gameStatus.className = 'status-badge game-' + gameState.gamePhase;
    
    if (message) {
        console.log('Status message:', message);
    }
}

// Update all game statistics
function updateGameStats() {
    // Update balance display
    elements.balanceValue.textContent = gameState.currentPlayer.balance;
    elements.prizeValue.textContent = Math.floor(gameState.totalPrizePool);
    
    // Calculate total boards
    let totalBoards = 0;
    gameState.activePlayers.forEach(player => {
        totalBoards += player.boards.length;
    });
    elements.playersValue.textContent = totalBoards;
    
    elements.calledCount.textContent = gameState.calledNumbers.length;
    
    console.log(`📊 Stats Update: Balance: ${gameState.currentPlayer.balance}, Total Boards: ${totalBoards}, Prize: ${gameState.totalPrizePool}`);
}

// Update game display
function updateGameDisplay() {
    if (gameState.currentCall) {
        elements.currentLetter.textContent = gameState.currentCall.letter;
        elements.currentNumber.textContent = gameState.currentCall.number;
    }
    
    updateCalledNumbersList();
    updateGameStats();
}

// Update called numbers list
function updateCalledNumbersList() {
    const container = elements.calledNumbersList;
    container.innerHTML = '';
    
    // Get ONLY last 5 called numbers
    const recentCalls = gameState.calledNumbers.slice(-5);
    
    if (recentCalls.length === 0) {
        container.innerHTML = '<div style="color:#aaa;font-size:0.55rem;text-align:center;padding:4px;">- - -</div>';
        return;
    }
    
    // Check if mobile
    const isMobile = window.innerWidth <= 500;
    const isVerySmall = window.innerWidth <= 360;
    
    recentCalls.forEach((number, index) => {
        let letter = '';
        let color = '';
        let textColor = 'white';
        
        // Simple color mapping
        if (number <= 15) {
            letter = 'B';
            color = '#3498db'; // Blue
        } else if (number <= 30) {
            letter = 'I';
            color = '#e74c3c'; // Red
        } else if (number <= 45) {
            letter = 'N';
            color = '#2ecc71'; // Green
        } else if (number <= 60) {
            letter = 'G';
            color = '#f1c40f'; // Yellow
            textColor = '#2c3e50'; // Dark text for yellow
        } else {
            letter = 'O';
            color = '#9b59b6'; // Purple
        }

        const callElement = document.createElement('div');
        callElement.className = 'called-number-item';
        
        // Check if this is the most recent
        const isMostRecent = index === recentCalls.length - 1;
        
        // Determine sizes based on screen
        let fontSize, itemWidth, itemHeight, padding, borderRadius;
        
        if (isVerySmall) {
            fontSize = '0.5rem';
            itemWidth = '28px';
            itemHeight = '18px';
            padding = '1px';
            borderRadius = '2px';
        } else if (isMobile) {
            fontSize = '0.55rem';
            itemWidth = '30px';
            itemHeight = '20px';
            padding = '1px 2px';
            borderRadius = '2px';
        } else {
            fontSize = '0.65rem';
            itemWidth = '36px';
            itemHeight = '24px';
            padding = '2px 3px';
            borderRadius = '3px';
        }
        
        // Apply styles
        callElement.style.cssText = `
            background: ${color};
            color: ${textColor};
            border-radius: ${borderRadius};
            padding: ${padding};
            font-size: ${fontSize};
            width: ${itemWidth};
            height: ${itemHeight};
            text-align: center;
            cursor: pointer;
            font-weight: 700;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: ${isMostRecent ? '0 0 0 1px white, 0 1px 3px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.2)'};
            margin: 0 ${isVerySmall ? '1px' : (isMobile ? '1.5px' : '2px')} 0 0;
            line-height: 1;
            transform: ${isMostRecent ? 'scale(1.05)' : 'scale(1)'};
            z-index: ${isMostRecent ? '5' : '1'};
        `;
        
        callElement.innerHTML = `
            <span style="font-weight:600; font-size:${fontSize};">${letter}</span>
            <span style="margin: 0 0.5px; font-size:${fontSize};">-</span>
            <span style="font-weight:800; font-size:${fontSize};">${number}</span>
        `;
        
        // Add click handler
        callElement.addEventListener('click', function() {
            markNumberOnPlayerBoards(number, this);
            
            // Quick feedback
            this.style.opacity = '0.7';
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.opacity = '1';
                this.style.transform = isMostRecent ? 'scale(1.05)' : 'scale(1)';
            }, 150);
        });
        
        container.appendChild(callElement);
    });
    
    // Apply container styles
    const containerHeight = isVerySmall ? '20px' : (isMobile ? '22px' : '26px');
    container.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: ${containerHeight};
        padding: 0;
        overflow: visible;
        flex-direction: row;
        gap: ${isVerySmall ? '1px' : (isMobile ? '1.5px' : '2px')};
        background: transparent;
        margin: 0 auto;
    `;
}

// ==================== PLAYER BOARD DISPLAY ====================

// Display current player's boards
function displayCurrentPlayerBoards(forceBoardIndex = null) {
    if (!gameState.currentPlayer.isActive) return;
    
    elements.gamePlaySection.style.display = 'block';
    elements.boardsCarousel.innerHTML = '';
    elements.currentBoard.innerHTML = '';

    const activeBoards = gameState.currentPlayer.boards.filter(board => !board.isEliminated);
    
    if (activeBoards.length === 0) {
        elements.gamePlaySection.style.display = 'none';
        return;
    }

    if (forceBoardIndex !== null) {
        gameState.currentBoardIndex = forceBoardIndex;
    }
    
    if (gameState.currentBoardIndex >= activeBoards.length) {
        gameState.currentBoardIndex = 0;
    }

    // Create board miniatures
    activeBoards.forEach((board, index) => {
        const miniature = document.createElement('div');
        miniature.className = `board-miniature ${index === gameState.currentBoardIndex ? 'active' : ''}`;
        miniature.innerHTML = `<div>Board ${board.boardNumber}</div>`;
        miniature.addEventListener('click', () => switchBoard(index));
        elements.boardsCarousel.appendChild(miniature);
    });

    // Display current board
    if (activeBoards.length > 0) {
        displayBoard(gameState.currentBoardIndex);
    }
}

// Switch to a different board
function switchBoard(boardIndex) {
    gameState.currentBoardIndex = boardIndex;
    
    // Update active state on miniatures
    document.querySelectorAll('.board-miniature').forEach((mini, index) => {
        mini.classList.toggle('active', index === boardIndex);
    });
    
    const activeBoards = gameState.currentPlayer.boards.filter(board => !board.isEliminated);
    if (activeBoards.length > boardIndex) {
        displayBoard(boardIndex);
    }
}

// Display a specific board
function displayBoard(boardIndex) {
    elements.currentBoard.innerHTML = '';

    const activeBoards = gameState.currentPlayer.boards.filter(board => !board.isEliminated);
    const board = activeBoards[boardIndex];

    const table = document.createElement('table');
    table.className = 'bingo-table';
    
    // Create header row
    const headerRow = document.createElement('tr');
    const letters = ['B', 'I', 'N', 'G', 'O'];
    
    letters.forEach(letter => {
        const th = document.createElement('th');
        th.textContent = letter;
        th.className = letter.toLowerCase();
        headerRow.appendChild(th);
    });
    
    table.appendChild(headerRow);
    
    // Create board cells
    for (let row = 0; row < 5; row++) {
        const tr = document.createElement('tr');
        
        for (let col = 0; col < 5; col++) {
            const td = document.createElement('td');
            const cellValue = board.boardData[row][col];
            
            td.textContent = cellValue;
            
            if (cellValue === '★') {
                td.classList.add('free-space');
                td.innerHTML = '<div style="background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-weight: 800; font-size: 0.8rem; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">★</div>';
            } else if (board.markedNumbers.has(cellValue)) {
                td.classList.add('marked');
                td.style.cursor = 'pointer';
                td.addEventListener('click', () => {
                    markNumberOnPlayerBoards(cellValue, null);
                });
            } else {
                td.style.cursor = 'pointer';
                td.addEventListener('click', () => {
                    markNumberOnPlayerBoards(cellValue, null);
                });
            }
            
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    
    elements.currentBoard.appendChild(table);
    
    // Add BINGO claim button
    const bingoButton = document.createElement('button');
    bingoButton.className = 'bingo-btn';
    bingoButton.textContent = t('claimBingo');
    bingoButton.style.marginTop = '10px';
    bingoButton.style.width = '100%';
    bingoButton.addEventListener('click', claimBingo);
    elements.currentBoard.appendChild(bingoButton);
}

// ==================== UTILITY FUNCTIONS ====================

// Show wait message
function showWaitForNextGame(message = 'Waiting for Next Game') {
    elements.gamePlaySection.style.display = 'block';
    elements.boardsCarousel.innerHTML = '';
    elements.currentBoard.innerHTML = '';
    
    const waitMessage = document.createElement('div');
    waitMessage.className = 'wait-message';
    waitMessage.style.cssText = `
        text-align: center;
        padding: 30px 20px;
        color: var(--deep-purple);
        font-size: 1.2rem;
        font-weight: bold;
        background: white;
        border-radius: 10px;
        margin: 15px 0;
        border: 2px solid var(--deep-purple);
        box-shadow: 0 4px 12px rgba(139, 61, 232, 0.2);
    `;
    
    waitMessage.innerHTML = `
        <div style="margin-bottom: 15px; font-size: 1.4rem;">⏳</div>
        <div style="color: var(--deep-purple); margin-bottom: 10px;">
            ${message}
        </div>
        
        <div style="font-size: 0.9rem; color: #666; margin-top: 15px;">
            ${t('waiting') || 'Please wait...'}
        </div>
        
        <button onclick="checkForActiveGames()" style="
            margin-top: 15px;
            padding: 8px 16px;
            background: var(--safari-gold);
            color: white;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            font-size: 0.9rem;
        ">
            Refresh
        </button>
    `;
    
    elements.currentBoard.appendChild(waitMessage);
    
    // Update game status
    gameState.currentPlayer.isActive = false;
    updateGameStatusDisplay();
}

// Show spectator message
function showSpectatorMessage(message = 'Watching Game') {
    elements.gamePlaySection.style.display = 'block';
    elements.boardsCarousel.innerHTML = '';
    elements.currentBoard.innerHTML = '';
    
    const waitMessage = document.createElement('div');
    waitMessage.className = 'wait-message';
    waitMessage.style.cssText = `
        text-align: center;
        padding: 30px 20px;
        color: var(--deep-purple);
        font-size: 1.2rem;
        font-weight: bold;
        background: white;
        border-radius: 10px;
        margin: 15px 0;
        border: 2px solid #3498db;
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    `;
    
    waitMessage.innerHTML = `
        <div style="margin-bottom: 15px; font-size: 1.4rem;">👀</div>
        <div style="color: #3498db; margin-bottom: 10px; font-weight: bold;">
            ${message}
        </div>
       
        <div style="font-size: 0.9rem; color: #666; margin-top: 15px;">
            Game is in progress. Join the next one!
        </div>
        
        <button onclick="checkForActiveGames()" style="
            margin-top: 15px;
            padding: 8px 16px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            font-size: 0.9rem;
        ">
            Check for New Game
        </button>
    `;
    
    elements.currentBoard.appendChild(waitMessage);
    
    // Update game status
    gameState.currentPlayer.isActive = false;
    gameState.gamePhase = 'waiting';
    updateGameStatusDisplay();
}

// Show game message
function showGameMessage(text, type = 'info') {
    const colors = {
        'success': '#2ecc71',
        'error': '#e74c3c', 
        'info': '#3498db',
        'warning': '#f39c12'
    };
    
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-weight: 500;
        min-width: 300px;
        max-width: 90%;
        word-wrap: break-word;
    `;
    msg.textContent = text;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        if (msg.parentNode) {
            msg.parentNode.removeChild(msg);
        }
    }, 3000);
}

// Handle winner message
function handleWinnerMessage(winnerId, winnerName, prize) {
    const isCurrentPlayer = winnerId == userId;
    
    console.log(`🏆 ${winnerName} won ${prize} ETB. Is it you? ${isCurrentPlayer}`);
    
    if (isCurrentPlayer) {
        // Current player won!
        console.log('🎉 YOU WON! Prize:', prize);
        
        // Add prize to balance
        const oldBalance = gameState.currentPlayer.balance;
        gameState.currentPlayer.balance += prize;
        console.log(`💰 Balance updated: ${oldBalance} → ${gameState.currentPlayer.balance}`);
        
        // Update display
        updateGameStats();
        
        // Show celebration
        showWinnerNotification(prize, winnerName);
        
        // Send win to Telegram if applicable
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.sendData(JSON.stringify({
                action: 'won',
                prize: prize,
                timestamp: Date.now()
            }));
        }
    } else {
        // Other player won
        showWinnerNotification(prize, winnerName, false);
    }
}

// Show winner notification
function showWinnerNotification(prize, winnerName, isCurrentPlayer = true) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        text-align: center;
        border: 2px solid ${isCurrentPlayer ? 'var(--safari-gold)' : '#3498db'};
        min-width: 300px;
    `;
    
    notification.innerHTML = `
        <h3 style="color: ${isCurrentPlayer ? 'var(--safari-gold)' : '#3498db'}; margin-bottom: 10px;">
            ${isCurrentPlayer ? '🎉 YOU WON! 🎉' : '🏆 BINGO! 🏆'}
        </h3>
        <p style="font-size: 1.2rem; margin: 10px 0;">
            ${isCurrentPlayer ? '<strong>Congratulations!</strong>' : `<strong>${winnerName}</strong> won!`}
        </p>
        <div style="background: rgba(52, 152, 219, 0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
            <p style="margin: 0; font-size: 1.1rem;">🏆 Prize: <strong>${prize} ETB</strong></p>
        </div>
        <p style="font-size: 0.9rem; color: #aaa; margin-top: 15px;">
            Next game starting soon...
        </p>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Show game ended message
function showGameEndedMessage(message) {
    const endMsg = document.createElement('div');
    endMsg.style.cssText = `
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        text-align: center;
        border: 2px solid #e74c3c;
        min-width: 300px;
    `;
    endMsg.innerHTML = `
        <h3 style="color: #e74c3c; margin-bottom: 10px;">⏰ Game Ended</h3>
        <p style="margin: 10px 0; font-size: 1.1rem;">${message}</p>
        <p style="font-size: 0.9rem; color: #aaa; margin-top: 15px;">
            Next game starting in 5 seconds...
        </p>
    `;
    document.body.appendChild(endMsg);
    
    setTimeout(() => {
        if (endMsg.parentNode) {
            endMsg.parentNode.removeChild(endMsg);
        }
        // Start new game cycle
        setTimeout(() => startGameCycle(), 2000);
    }, 5000);
}

// Update players count
function updatePlayersCount(count) {
    elements.playersValue.textContent = count;
}

// ==================== SUPPORT MANAGER ====================

const supportManager = {
    init: function() {
        this.createSupportButtons();
    },
    
    createSupportButtons: function() {
        // Create support container
        const supportContainer = document.createElement('div');
        supportContainer.id = 'supportContainer';
        supportContainer.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
            font-family: 'Poppins', sans-serif;
        `;
        
        // Telegram Support Button
        const telegramBtn = document.createElement('div');
        telegramBtn.className = 'support-btn';
        telegramBtn.style.cssText = `
            width: 30px;
            height: 30px;
            background: #0088cc;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        telegramBtn.innerHTML = `
            <a href="https://t.me/ShebaBingoSupport" target="_blank" style="display: block; width: 100%; height: 100%;">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png"
                     alt="Telegram" width="30" height="30" style="border-radius: 50%;">
            </a>
        `;
        telegramBtn.title = 'Contact us on Telegram';
        
        // FAQ/Help Button
        const helpBtn = document.createElement('div');
        helpBtn.className = 'support-btn';
        helpBtn.style.cssText = `
            width: 30px;
            height: 30px;
            background: var(--safari-gold);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        helpBtn.innerHTML = '❓';
        helpBtn.title = 'Quick Help & FAQ';
        
        // Call Support Button
        const callBtn = document.createElement('div');
        callBtn.className = 'support-btn';
        callBtn.style.cssText = `
            width: 30px;
            height: 30px;                    
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        callBtn.innerHTML = '📞';
        callBtn.title = 'Call Support';
        
        // Add hover effects
        [telegramBtn, callBtn, helpBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.1)';
                btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            });
        });
        
        // Event listeners
        helpBtn.addEventListener('click', () => this.showQuickHelp());
        telegramBtn.addEventListener('click', () => this.openTelegramSupport());
        callBtn.addEventListener('click', () => this.showCallSupport());
        
        // Add buttons
        supportContainer.appendChild(callBtn);
        supportContainer.appendChild(telegramBtn);
        supportContainer.appendChild(helpBtn);
        
        document.body.appendChild(supportContainer);
    },
    
    openTelegramSupport: function() {
        window.open('https://t.me/ShebaBingoSupport', '_blank');
        this.showSupportMessage('Opening Telegram support...', 'info');
    },
    
    showCallSupport: function() {
        const phoneNumber = '+251945343143';
        const callMessage = `
            <div style="text-align: center;">
                <h3 style="color: var(--safari-gold); margin-bottom: 10px;">📞 Call Support</h3>
                <p style="margin-bottom: 15px; font-size: 1.1rem;">For immediate assistance, call our support team:</p>
                <div style="background: rgba(39, 174, 96, 0.2); padding: 15px; border-radius: 10px; margin: 10px 0;">
                    <strong style="color: #27ae60; font-size: 1.3rem;">${phoneNumber}</strong>
                </div>
                <p style="font-size: 0.9rem; color: #ccc;">Available 24/7 for game support and account issues</p>
            </div>
        `;
        
        this.showSupportModal('Call Support', callMessage);
    },
    
    showQuickHelp: function() {
        const helpContent = `
            <div style="max-height: 400px; overflow-y: auto;">
                <div style="margin-bottom: 20px;">
                    <h4 style="color: var(--safari-gold); margin-bottom: 10px;">🎮 How to Play</h4>
                    <ul style="text-align: left; color: #ccc; font-size: 0.9rem;">
                        <li>Select 1-3 boards during registration</li>
                        <li>Mark numbers as they are called</li>
                        <li>Complete a row, column, or diagonal to win</li>
                        <li>Click "CLAIM BINGO" when you have a winning pattern</li>
                        <li>Each board costs 10 ETB to play</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: var(--safari-gold); margin-bottom: 10px;">💰 Payments</h4>
                    <ul style="text-align: left; color: #ccc; font-size: 0.9rem;">
                        <li>Minimum deposit: 10 ETB</li>
                        <li>Minimum withdrawal: 50 ETB</li>
                        <li>Supported: Telebirr, CBE, BOA</li>
                        <li>Withdrawals processed within 5 minutes</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: var(--safari-gold); margin-bottom: 10px;">🏆 Prizes</h4>
                    <ul style="text-align: left; color: #ccc; font-size: 0.9rem;">
                        <li>Prizes automatically added to balance</li>
                        <li>Multiple winners split the prize</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(52, 152, 219, 0.2); border-radius: 10px;">
                    <p style="margin: 0; color: #3498db; font-size: 0.9rem;">
                        Need more help? Contact us via Telegram or phone!
                    </p>
                </div>
            </div>
        `;
        
        this.showSupportModal('Quick Help & FAQ', helpContent);
    },
    
    showSupportModal: function(title, content) {
        // Remove existing modal if any
        const existingModal = document.getElementById('supportModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'supportModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
            font-family: 'Poppins', sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                padding: 30px;
                border-radius: 15px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 2px solid var(--safari-gold);
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--safari-gold);
                    padding-bottom: 10px;
                ">
                    <h2 style="color: var(--safari-gold); margin: 0; font-size: 1.5rem;">${title}</h2>
                    <button onclick="this.closest('#supportModal').remove()" style="
                        background: none;
                        border: none;
                        color: var(--safari-gold);
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">✕</button>
                </div>
                <div>${content}</div>
            </div>
        `;
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    },
    
    showSupportMessage: function(message, type) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'info' ? '#3498db' : '#27ae60'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1002;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
};

// ==================== LANGUAGE SUPPORT ====================

// Set language function
function setLanguage(lang) {
    gameState.currentLanguage = lang;
    const t = TRANSLATIONS[lang];
    
    // Update game title
    const headerTitle = document.querySelector('.header h1');
    if (headerTitle) headerTitle.textContent = t.gameTitle;
    
    // Update game status
    updateGameStatusDisplay();
    
    // Update dashboard stats labels
    document.querySelectorAll('.stat-label').forEach((label, index) => {
        const labels = [t.balance, t.prize, t.players, t.bet, t.called];
        if (labels[index]) {
            label.textContent = labels[index];
        }
    });
    
    // Update registration popup
    const infoItems = document.querySelectorAll('.info-item span');
    if (infoItems[0]) infoItems[0].textContent = t.pricePerBoard;
    if (infoItems[1]) infoItems[1].textContent = t.maxBoards;
    if (infoItems[2]) infoItems[2].textContent = t.timeRemaining;
    
    const summaryItems = document.querySelectorAll('.summary-item span');
    if (summaryItems[0]) summaryItems[0].textContent = t.boardsSelected;
    if (summaryItems[1]) summaryItems[1].textContent = t.totalCost;
    
    const popupButtons = document.querySelectorAll('.popup-actions button');
    if (popupButtons[0]) popupButtons[0].textContent = t.cancel;
    if (popupButtons[1]) popupButtons[1].textContent = t.confirmJoin;
    
    // Update Telegram Main Button if exists
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.MainButton.setText(t.playBingo);
    }
    
    console.log(`🌍 Language changed to: ${lang}`);
}

// ==================== INITIALIZATION ====================

// Initialize app
async function initializeApp() {
    console.log('🎮 Initializing ShebaBingo...');
    
    // Initialize Telegram integration
    initializeTelegram();
    
    // Load user balance
    await loadBalanceFromServer();
    
    // Setup language selector
    setupLanguageSelector();
    
    // Create main bingo board
    createMainBingoBoard();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize support manager
    supportManager.init();
    
    // Update game stats
    updateGameStats();
    
    // Start game cycle
    startGameCycle();
    
    console.log('✅ ShebaBingo initialized successfully');
}

// Setup language selector
function setupLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('shebaBingoLanguage') || 'en';
        languageSelect.value = savedLanguage;
        
        // Apply saved language on load
        setLanguage(savedLanguage);
        
        // Listen for language changes
        languageSelect.addEventListener('change', function() {
            const selectedLanguage = this.value;
            localStorage.setItem('shebaBingoLanguage', selectedLanguage);
            setLanguage(selectedLanguage);
        });
    }
}

// Create main bingo board
function createMainBingoBoard() {
    elements.bingoGrid.innerHTML = '';
    const letters = ['B', 'I', 'N', 'G', 'O'];
    
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';
            
            const letter = letters[col];
            const range = CONFIG.BINGO_NUMBERS[letter];
            const number = range[row];
            
            cell.textContent = number;
            cell.setAttribute('data-letter', letter);
            cell.setAttribute('data-number', number);
            
            elements.bingoGrid.appendChild(cell);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Confirm selection button
    if (elements.confirmSelection) {
        elements.confirmSelection.addEventListener('click', confirmSelection);
    }
}

// Make closeRegistrationPopup available globally
window.closeRegistrationPopup = closeRegistrationPopup;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeApp);
