        // Game Configuration
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
        minWithdrawal: "Minimum withdrawal: 50 ETB ",
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
        fraudClaimed: "🚨 You claimed BINGO without a valid pattern. board eliminated!",
        // In the Amharic section:
           fraudClaimed: "🚨 ልክ ያልሆነ ንድፍ የሌለው ቢንጎ አምጥተዋል። ቦርዱ ተሰርዟል!",
        
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
        boardCostInstruction: "እያንዳንዱ ቦርድ $10 ያስከፍላል",
        
        // NEW: Payment instructions
        minDeposit: "አነስተኛ ተቀማጭ: 10 ETB",
        minWithdrawal: "አነስተኛ መልሶ ማውጣት: 50 ETB",
        supportedPayment: "የሚደገፉ: ቴሌቢር፣ ኢትዮጵያ ንግድ ባንክ፣ ባንክ ማስተላለፍ",
        withdrawalTime: "መልሶ ማውጣቶች በ24 ሰዓታት ውስጥ ይከናወናሉ",
        
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
                id: 1,
                name: 'You',
                telegramName: '@player1',
                balance: 0,
                boards: [],
                isActive: false,
                totalPaid: 0
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
            
            // Language selector (will be created)
            languageSelector: null
        };
        




        // ==================== MULTIPLAYER INITIALIZATION ====================
function initializeMultiplayer() {
    // Just track current player - server tracks others
    gameState.allPlayers = [gameState.currentPlayer];
    gameState.activePlayers = [];
    
    console.log('🎮 Multiplayer system ready (connected to server)');
}
// ==================== APP INITIALIZATION ====================
function initializeApp() {
    // Initialize Telegram integration (but don't block if not in Telegram)
    const isTelegram = initializeTelegram();
    
    // ✅ CORRECT: Load balance from server FIRST
    loadBalanceFromServer().then(() => {
        console.log('💰 Balance loaded from server:', gameState.currentPlayer.balance);
    });

    // ✅ CORRECT: Initialize UI components
    createMainBingoBoard();
    setupEventListeners();
    updateGameStats();
    
    // ✅ CORRECT: Initialize multiplayer system
    initializeMultiplayer();  // THIS IS IN THE RIGHT PLACE!

    // ✅ CORRECT: Initialize support buttons
    supportManager.init();
    
    console.log('🎮 ShebaBingo initialized successfully');
    
    // ✅ CORRECT: Game start logic
    if (isTelegram && Telegram.WebApp) {
        // Telegram Web App flow
        Telegram.WebApp.MainButton.setText("🎮 PLAY BINGO");
        Telegram.WebApp.MainButton.onClick(() => {
            Telegram.WebApp.MainButton.hide();
            startGameCycle();
        });
        Telegram.WebApp.MainButton.show();
        console.log('🤖 Telegram mode: Waiting for PLAY button click');
    } else {
        // Browser flow
        startGameCycle();
        console.log('🌐 Browser mode: Starting game immediately');
    }
}

// ================= USER INIT =================
window.userId = localStorage.getItem('userId');

if (!window.userId) {
    window.userId = crypto.randomUUID();
    localStorage.setItem('userId', window.userId);
}

console.log('👤 User ID:', window.userId);

// ==================== TELEGRAM INTEGRATION ====================

// 1. Initialize Telegram Web App// Initialize Telegram Web App
// 1. Initialize Telegram Web App
function initializeTelegram() {
    // First, check if Telegram Web App SDK is available
    if (typeof window.Telegram !== 'undefined' && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        
        // CRITICAL: Get user ID from Telegram OR URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlUserId = urlParams.get('user');
        
        // Get user data from Telegram
        const telegramUser = tg.initDataUnsafe?.user;
        
        // Determine the actual user ID (priority: Telegram > URL param > random)
        let actualUserId;
        let userName;
        let telegramName;
        
        if (telegramUser?.id) {
            // User opened from Telegram button (INSIDE Telegram)
            actualUserId = telegramUser.id;
            userName = telegramUser.first_name || 'Player';
            telegramName = telegramUser.username ? '@' + telegramUser.username : 'Telegram User';
            console.log('✅ User opened from INSIDE Telegram');
        } else if (urlUserId) {
            // User opened from direct link (OUTSIDE Telegram but has user ID)
            actualUserId = urlUserId;
            userName = 'Player';
            telegramName = 'Web Player';
            console.log('ℹ️ User opened from direct link, ID:', urlUserId);
        } else {
            // No user ID found (testing mode)
            actualUserId = Math.floor(Math.random() * 10000) + 1;
            userName = 'Test Player';
            telegramName = 'Browser Mode';
            console.log('⚠️ No user ID found - using test mode');
        }
        
        // Save user ID to localStorage for API calls
        localStorage.setItem('sheba_user_id', actualUserId);
        console.log('📱 User ID saved:', actualUserId);
        
        // Configure Telegram Web App
        tg.expand(); // Expand to full screen
        tg.enableClosingConfirmation(); // Ask before closing
        
        // Set theme colors to match your game
        tg.setHeaderColor('#8b3de8');
        tg.setBackgroundColor('#d7b9f7');
        
        // Set back button behavior
        tg.BackButton.onClick(() => {
            tg.close(); // Close the app when back button pressed
        });
        
        // Show back button if in Telegram Web App
        tg.BackButton.show();
        
        // Update player info
        gameState.currentPlayer.name = userName;
        gameState.currentPlayer.telegramName = telegramName;
        gameState.currentPlayer.id = actualUserId;
       // gameState.currentPlayer.balance will be set by loadUserBalance()
        
        // Save user ID to localStorage
        localStorage.setItem('sheba_user_id', actualUserId);
        
        // Configure Telegram Web App
        tg.expand();
        tg.enableClosingConfirmation();
        tg.setHeaderColor('#8b3de8');
        tg.setBackgroundColor('#d7b9f7');
        
        // Load user balance from API
        loadUserBalance(actualUserId);
        
        console.log('✅ Telegram initialized. User:', userName, 'ID:', actualUserId);
        return true;
    } else {
        console.log('ℹ️ Running outside Telegram (browser mode)');
        
        // Get user ID from URL parameter even in browser mode
        const urlParams = new URLSearchParams(window.location.search);
        const urlUserId = urlParams.get('user');
        
        if (urlUserId) {
            // User opened from direct link in browser
            localStorage.setItem('sheba_user_id', urlUserId);
            gameState.currentPlayer.id = urlUserId;
            console.log('🌐 Browser mode with user ID:', urlUserId);
        } else {
            // Pure browser testing (no user ID)
            gameState.currentPlayer.id = Math.floor(Math.random() * 10000) + 1;
            console.log('🌐 Pure browser test mode');
        }
        
        gameState.currentPlayer.name = 'Player';
        gameState.currentPlayer.telegramName = 'Browser Player';
        gameState.currentPlayer.balance = 1000; // Default test balance
        
        return false;
    }
}

// 2. Add this NEW function to load user balance
async function loadUserBalance(userId) {
    try {
        const API_BASE = window.location.origin || 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/user/${userId}/balance`);
        const data = await response.json();
        
        if (data.success) {
            gameState.currentPlayer.balance = data.balance;
            console.log('💰 Balance loaded:', data.balance);
            
            // Update balance display in your game
            updateBalanceDisplay(data.balance);
        } else {
            console.warn('Failed to load balance, using default');
            gameState.currentPlayer.balance = 0;
        }
    } catch (error) {
        console.error('Error loading balance:', error);
        gameState.currentPlayer.balance = 0;
    }
}

// 3. Add this function to update balance display (you need to create this)
function updateBalanceDisplay(balance) {
    // Update wherever you show balance in your game UI
    const balanceElement = document.getElementById('playerBalance');
    if (balanceElement) {
        balanceElement.textContent = `${balance} ETB`;
    }
}


// ==================== SHOW GAME INTERFACE ====================
function showGameInterface(gameData) {
    // Hide registration popup if open
    document.getElementById('registrationPopup').style.display = 'none';
    
    // Show game play section
    document.getElementById('gamePlaySection').style.display = 'block';
    
    // Update UI
    if (gameData.playerCount !== undefined) {
        updatePlayerCount(gameData.playerCount);
    }
    
    if (gameData.prizePool !== undefined) {
        updatePrizePool(gameData.prizePool);
    }
    
    if (gameData.yourBalance !== undefined) {
        // Update user's balance display
        const balanceElement = document.getElementById('balanceValue');
        if (balanceElement) {
            balanceElement.textContent = gameData.yourBalance;
        }
        gameState.currentPlayer.balance = gameData.yourBalance;
    }
    
    // Display player's boards if available
    if (gameData.boards && gameData.boards.length > 0) {
        gameState.currentPlayer.boards = gameData.boards.map(board => ({
            boardNumber: board.boardNumber,
            boardData: board.boardData,
            markedNumbers: new Set(board.markedNumbers || []),
            isWinner: false,
            isEliminated: false
        }));
        
        displayCurrentPlayerBoards(0);
    }
    
    // Update game status
    updateGameStatus('selecting', 'Waiting for more players...');
    
    console.log('🎮 Game interface loaded');
}
// ==================== UTILITY FUNCTIONS ====================
function updatePlayerCount(count) {
    const playersElement = document.getElementById('playersValue');
    if (playersElement) {
        playersElement.textContent = count;
    }
}

function updatePrizePool(pool) {
    const prizeElement = document.getElementById('prizeValue');
    if (prizeElement) {
        prizeElement.textContent = pool;
    }
    gameState.totalPrizePool = pool;
}



// ==================== GAME JOIN FUNCTION ====================
async function joinGame(gameId, boardCount = 1) {
    try {
        if (!window.userId) {
            console.error('❌ No user ID available');
            alert('Please refresh the page or open from Telegram');
            return;
        }

        console.log('🎮 Joining game:', gameId, 'User:', window.userId, 'Boards:', boardCount);

        const response = await fetch('/api/game/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: window.userId,
                gameId: gameId,
                boardCount: boardCount
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Joined game successfully:', result);
            
            // Connect WebSocket after successful join
            connectWebSocket(result.gameId, window.userId);
            
            // Show game UI
            showGameInterface(result);
            
            // Store current game ID
            window.currentGameId = result.gameId;
            
        } else {
            console.error('❌ Join failed:', result.error);
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Join game error:', error);
        alert('Network error. Please try again.');
    }
}
// ✅ Handle WebSocket game state updates (REAL MULTIPLAYER)
function updateGameState(data) {
    if (!data || !gameState) return;

    /* ================= GAME STATE ================= */
    if (data.game) {
        // Server is the ONLY source of truth
        gameState.gamePhase = data.game.status || 'waiting';

        if (typeof data.game.prizePool === 'number') {
            updatePrizePool(data.game.prizePool);
        }

        if (Array.isArray(data.game.calledNumbers)) {
            gameState.calledNumbers = data.game.calledNumbers.map(cn => {
                const num = cn.replace(/[BINGO]/, '');
                return Number(num);
            });
            updateCalledNumbersList();
        }

        // Update status badge
        updateGameStatus();
    }

    /* ================= PLAYER STATE ================= */
    if (data.player && Array.isArray(data.player.boards)) {
        gameState.currentPlayer.boards = data.player.boards.map(board => ({
            boardNumber: board.boardNumber,
            boardData: board.boardData,
            markedNumbers: new Set(board.markedNumbers || []),
            isWinner: false,
            isEliminated: false
        }));

        displayCurrentPlayerBoards(0);
    }
}

// 2. Handle Telegram Commands (optional)
function handleTelegramCommands() {
    const tg = Telegram.WebApp;
    if (!tg) return;
    
    // Get command from launch parameters
    const startParam = tg.initDataUnsafe?.start_param;
    if (startParam) {
        console.log('Start param:', startParam);
        
        switch(startParam) {
            case 'play':
                startGameCycle();
                break;
            case 'rules':
                alert("🎯 Game Rules:\n1. Select 1-3 boards\n2. Mark numbers as called\n3. Complete row/column/diagonal\n4. Claim BINGO to win!");
                break;
        }
    }
}

// 3. Send data back to Telegram Bot
function sendToTelegram(data) {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify(data));
        // Telegram.WebApp.close(); // Optional: close after sending
    }
}

// 4. Update game to use Telegram when available
function updateGameForTelegram() {
    if (window.Telegram && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        
        // Update game state with Telegram user
        const user = tg.initDataUnsafe?.user;
        if (user) {
            gameState.currentPlayer.telegramName = user.username ? 
                '@' + user.username : user.first_name;
        }
        
        // Send game results to bot
        gameState.winners.forEach(winner => {
            if (winner.player.id === gameState.currentPlayer.id) {
                sendToTelegram({
                    action: 'won',
                    prize: prizePerWinner,
                    board: winner.board.boardNumber,
                    timestamp: Date.now()
                });
            }
        });
    }
}

// ==================== WEBSOCKET CONNECTION ====================
let socket;
let reconnectAttempts = 0;
let ws = null;

function connectWebSocket(gameId, userId) {
    if (!gameId || !userId) {
        console.error('❌ Missing gameId or userId for WebSocket');
        return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/game-ws?gameId=${encodeURIComponent(gameId)}&userId=${encodeURIComponent(userId)}`;

    console.log('🔗 Connecting WebSocket:', wsUrl);

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log('✅ WebSocket connected to game:', gameId);
        reconnectAttempts = 0;

        socket.send(JSON.stringify({ type: 'get_state' }));
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'pong') return;

            console.log('📨 WebSocket message:', data.type);
            handleWebSocketMessage(data);
        } catch (err) {
            console.error('❌ Invalid WS message:', err);
        }
    };

    socket.onerror = (err) => {
        console.error('❌ WebSocket error:', err);
    };

    socket.onclose = (event) => {
        console.warn(`⚠️ WebSocket closed (${event.code})`);

        if (reconnectAttempts < 5) {
            reconnectAttempts++;
            setTimeout(() => {
                console.log(`🔄 Reconnecting... (${reconnectAttempts})`);
                connectWebSocket(gameId, userId);
            }, 2000 * reconnectAttempts);
        } else {
            console.error('❌ WebSocket reconnect failed');
        }
    };
}
// ==================== MESSAGE HANDLER ====================
function handleWebSocketMessage(data) {
    switch(data.type) {
        case 'game_state':
            // Update UI with game state
            updateGameState(data.data);
            break;
            
        case 'number_called':
            // Handle new number called
            handleNumberCalled(data.number, data.calledNumbers);
            break;
            
        case 'player_joined':
            // Update player count
            updatePlayerCount(data.playerCount);
            break;
            
        case 'player_left':
            // Update player count
            updatePlayerCount(data.playerCount);
            break;
            
        case 'game_status':
            // Update game status (selecting, shuffling, active, etc.)
            updateGameStatus(data.status, data.message);
            break;
            
        case 'winner':
            // Show winner announcement
            showWinner(data.userId, data.prize);
            break;
            
        case 'chat':
            // Add chat message
            addChatMessage(data.userId, data.message, data.timestamp);
            break;
            
        case 'countdown':
            // Update countdown timer
            updateCountdown(data.seconds, data.message);
            break;
            
        case 'game_ended':
            // Handle game end
            handleGameEnd(data.message);
            break;
    }
}
// ==================== SEND FUNCTIONS ====================
function sendMarkNumber(number) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'mark_number',
            number: number
        }));
    }
}

function sendClaimBingo() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'claim_bingo'
        }));
    }
}

function sendChatMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'chat_message',
            message: message
        }));
    }
}








// Add heartbeat function (optional but good to have)
function startWebSocketHeartbeat() {
    setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            try {
                socket.send(JSON.stringify({ type: 'ping' }));
            } catch (error) {
                console.log('Heartbeat send error:', error);
            }
        }
    }, 30000); // Every 30 seconds
}

// Call this after connection
socket.onopen = () => {
    // ... existing code ...
    startWebSocketHeartbeat();
};


// 2. HANDLE SERVER MESSAGES
function handleGameMessage(message) {
    console.log('🎮 Processing message type:', message.type);

    switch (message.type) {

        case 'game_state':
            updateGameFromServer(message.data);
            break;

        case 'player_joined':
            updatePlayersCount(message.playerCount);
            break;

        case 'players_update':
            updatePlayersCount(message.count);
            break;

        case 'number_called':
            handleNumberCalled(message.number, message.calledNumbers);
            break;

        case 'number_marked':
            break;

        case 'winner':
            if (message.userId == userId) {
                gameState.currentPlayer.balance += message.prize;
                updateGameStats();
                showWinnerMessage('YOU', 'You', message.prize);
            } else {
                showWinnerMessage(message.userId, `Player ${message.userId}`, message.prize);
            }
            break;

        case 'game_status':
            updateGameStatus(message.status, message.message);
            break;

        case 'game_ended':
            showGameEndedMessage(message.message);
            break;

        case 'chat':
            showChatMessage(message.userId, message.username || 'Player', message.message);
            break;

        case 'pong':
            break;

        default:
            console.warn('⚠️ Unknown message type:', message.type);
    }
}


// 3. UPDATE GAME FROM SERVER DATA
function updateGameFromServer(serverState) {
    if (!serverState) return;
    
    console.log('🔄 Updating game from server state');
    
    // Update game phase
    if (serverState.game && serverState.game.status) {
        gameState.gamePhase = serverState.game.status;
        updateGameStatus();
        
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
        elements.prizeValue.textContent = gameState.totalPrizePool;
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
        } else {
            console.log('⚠️ No boards received from server');
        }
    }
}

// 4. JOIN MULTIPLAYER GAME VIA API
async function joinMultiplayerGameViaAPI(totalCost) {
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
            console.log('🎲 Game number:', data.gameNumber);
            console.log('👥 Player count:', data.playerCount);
            console.log('💰 Prize pool:', data.prizePool);
            
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

// 5. HELPER FUNCTIONS
function updatePlayersCount(count) {
    elements.playersValue.textContent = count;
}

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

function showWinnerMessage(winnerId, winnerName, prize) {
    const isCurrentPlayer = winnerId == userId; // Use == for string/number comparison
    
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
        showWinnersList(prize, 1); // You can adjust total boards
        
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
        console.log(`😔 ${winnerName} won ${prize} ETB`);
        
        const winnerMsg = document.createElement('div');
        winnerMsg.style.cssText = `
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
            border: 2px solid var(--safari-gold);
            min-width: 300px;
        `;
        winnerMsg.innerHTML = `
            <h3 style="color: var(--safari-gold); margin-bottom: 10px;">🎉 BINGO! 🎉</h3>
            <p style="font-size: 1.2rem; margin: 10px 0;">
                <strong>${winnerName}</strong> won!
            </p>
            <div style="background: rgba(52, 152, 219, 0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                <p style="margin: 0; font-size: 1.1rem;">🏆 Prize: <strong>${prize} ETB</strong></p>
            </div>
            <p style="font-size: 0.9rem; color: #aaa; margin-top: 15px;">
                Next game starting soon...
            </p>
        `;
        document.body.appendChild(winnerMsg);
        
        setTimeout(() => {
            if (winnerMsg.parentNode) {
                winnerMsg.parentNode.removeChild(winnerMsg);
            }
        }, 5000);
    }
}

function showGameEndedMessage(message) {
    console.log('⏰ Game ended:', message);
    
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

function showChatMessage(senderId, senderName, message) {
    // Optional: You can implement a chat UI if you want
    console.log(`💬 ${senderName}: ${message}`);
}




// ==================== INTEGRATE WITH SERVER  ====================

// Get user ID from URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user') || 'demo';

// Load user balance from server API
async function loadBalanceFromServer() {
    try {
        const response = await fetch(`/api/user/${userId}/balance`);
        const data = await response.json();
        
        if (data.success) {
            // Update YOUR balance display (match your element ID)
            const balanceElement = document.getElementById('balanceValue');
            if (balanceElement) {
                balanceElement.textContent = data.balance + ' ETB';
            }
            
            // Store in global variables
            gameState.currentPlayer.balance = data.balance;
            gameState.currentPlayer.username = data.username;
            
            // Update gameState balance
            if (data.registered) {
                console.log(`Welcome ${data.username}! Balance: ${data.balance} ETB`);
            } else {
                console.log(`Guest user. Balance: ${data.balance} ETB`);
            }
            
            // Update stats
            updateGameStats();
            return true;
        }
    } catch (error) {
        console.error('Error loading balance from server:', error);
        // Fallback for local testing
        gameState.currentPlayer.balance = 1000;
        updateGameStats();
        return false;
    }
}

// Deduct game fee from server
async function deductGameFeeFromServer(amount) {
    try {
        const response = await fetch('/api/game/play', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: userId, amount: amount })
        });
        
        const data = await response.json();
        if (data.success) {
            // Update local balance
            gameState.currentPlayer.balance = data.newBalance;
            
            // Update display
            const balanceElement = document.getElementById('balanceValue');
            if (balanceElement) {
                balanceElement.textContent = data.newBalance + ' ETB';
            }
            
            console.log(`💰 Game fee deducted: ${amount} ETB. New balance: ${data.newBalance} ETB`);
            return true;
        } else {
            alert(data.error || 'Payment failed');
            return false;
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Network error. Please check your connection.');
        return false;
    }
}

// Add winnings to server
async function addWinningsToServer(amount) {
    try {
        const response = await fetch('/api/game/win', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: userId, amount: amount })
        });
        
        const data = await response.json();
        if (data.success) {
            // Update local balance
            gameState.currentPlayer.balance = data.newBalance;
            
            // Update display
            const balanceElement = document.getElementById('balanceValue');
            if (balanceElement) {
                balanceElement.textContent = data.newBalance + ' ETB';
            }
            
            console.log(`🎉 Winnings added: ${amount} ETB. New balance: ${data.newBalance} ETB`);
            return true;
        }
    } catch (error) {
        console.error('Win error:', error);
    }
    return false;
}


// ==================== MISSING API FUNCTIONS ====================

// Get active games from server
async function getActiveGames() {
    try {
        console.log('🔍 Fetching active games...');
        const response = await fetch('/api/games/active');
        const data = await response.json();
        
        if (data.success) {
            console.log(`🎮 Found ${data.games.length} active game(s)`);
            return data.games;
        }
        return [];
    } catch (error) {
        console.error('Error fetching active games:', error);
        return [];
    }
}

// Get next game start time
async function getNextGameStart() {
    try {
        const response = await fetch('/api/game/next-start');
        const data = await response.json();
        
        if (data.success) {
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error getting next game:', error);
        return null;
    }
}

// Load user data
async function loadUserData() {
    try {
        const response = await fetch(`/api/user/${userId}/balance`);
        const data = await response.json();
        
        if (data.success) {
            // Update your UI elements
            const balanceElement = document.getElementById('balanceValue');
            if (balanceElement) {
                balanceElement.textContent = data.balance + ' ETB';
            }
            
            gameState.currentPlayer.balance = data.balance;
            gameState.currentPlayer.username = data.username || 'Player';
            
            console.log(`👤 User ${gameState.currentPlayer.username} loaded, balance: ${data.balance} ETB`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading user data:', error);
        return false;
    }
}

// Join game via API
// When user successfully joins a game via API
async function joinGame(gameId, boardCount) {
    try {
        const response = await fetch('/api/game/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: window.userId, // Make sure userId is available
                gameId: gameId,
                boardCount: boardCount
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Connect WebSocket after successful join
            connectWebSocket(result.gameId, window.userId);
            
            // Show game UI
            showGameInterface(result);
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Join game error:', error);
    }
}

// Get game state
async function getGameStateApi(gameId) {
    try {
        const response = await fetch(`/api/game/${gameId}/state/${userId}`);
        return await response.json();
    } catch (error) {
        console.error('Error getting game state:', error);
        return { success: false, error: 'Network error' };
    }
}


// MODIFY YOUR confirmSelection() FUNCTION:

// A. Replace confirmSelection() function (around line 1500)
// Find this function and REPLACE it completely:
function confirmSelection() {
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
    
    // JOIN MULTIPLAYER GAME (NOT local simulation)
    joinMultiplayerGameViaAPI(totalCost);
}


        // Add event listener for the existing language selector in top-nav
document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('shebaBingoLanguage') || 'en';
        languageSelect.value = savedLanguage;
        
        // Apply saved language on load
        if (typeof setLanguage === 'function') {
            setLanguage(savedLanguage);
        }
        
        // Listen for language changes
        languageSelect.addEventListener('change', function() {
            const selectedLanguage = this.value;
            localStorage.setItem('shebaBingoLanguage', selectedLanguage);
            
            if (typeof setLanguage === 'function') {
                setLanguage(selectedLanguage);
            }
        });
    }
});
        // Service Worker Communication
        function setupServiceWorker() {
             // Empty function - does nothing
        }

        function showUpdateNotification() {
            // Show a notification that an update is available
            return;
        }

        // Create language selector
        // Keep this function but remove the CSS styling:
// Set language function - COMPREHENSIVE VERSION
function setLanguage(lang) {
    gameState.currentLanguage = lang;
    const t = TRANSLATIONS[lang];
    
    // Update game title
    const headerTitle = document.querySelector('.header h1');
    if (headerTitle) headerTitle.textContent = t.gameTitle;
    
    // Update game status
    updateGameStatus();
    
    // Update dashboard stats labels
    document.querySelectorAll('.stat-label').forEach((label, index) => {
        const labels = [t.balance, t.prize, t.players, t.bet, t.called];
        if (labels[index]) {
            label.textContent = labels[index];
        }
    });
    
    // Update BINGO header letters
    const boardLetters = document.querySelectorAll('.board-letter');
    const bingoLetters = [t.bingoB, t.bingoI, t.bingoN, t.bingoG, t.bingoO];
    boardLetters.forEach((letter, index) => {
        if (bingoLetters[index]) {
            letter.textContent = bingoLetters[index];
        }
    });
    
    // Update table headers in player boards
    const tableHeaders = document.querySelectorAll('.bingo-table th');
    tableHeaders.forEach((th, index) => {
        if (bingoLetters[index]) {
            th.textContent = bingoLetters[index];
        }
    });
    
    // Update other UI elements
    const callLabel = document.querySelector('.call-label');
    const calledNumbersLabel = document.querySelector('.called-numbers-label');
    const instructionsTitle = document.querySelector('.instructions-title');
    const instructionsContent = document.querySelector('.instructions-content');
    const playerBoardsTitle = document.querySelector('.player-boards-title');
    
    if (callLabel) callLabel.textContent = t.currentCall;
    if (calledNumbersLabel) calledNumbersLabel.textContent = t.recentlyCalled;
    if (instructionsTitle) instructionsTitle.innerHTML = `<u>${t.howToWin}</u>`;
    if (instructionsContent) instructionsContent.innerHTML = `${t.howToWin}: <br><span class="win-condition">${t.winCondition}</span>`;
    if (playerBoardsTitle) playerBoardsTitle.textContent = t.yourBoards;
    
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
    
    // Update BINGO button if it exists
    const bingoBtn = document.querySelector('.bingo-btn');
    if (bingoBtn) bingoBtn.textContent = t.claimBingo;
    
    // Update Telegram Main Button if exists
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.MainButton.setText(t.playBingo);
    }
    
    console.log(`🌍 Language changed to: ${lang}`);
}
        // Get translation
        function t(key) {
            return TRANSLATIONS[gameState.currentLanguage][key] || TRANSLATIONS.en[key] || key;
        }

       // C. Replace startGameCycle() function (around line 500)
// Find this function and REPLACE it completely:
function startGameCycle() {
    console.log('🔄 Starting game cycle...');
    gameState.gamePhase = 'waiting';
    updateGameStatus();
    
    // First, check if there are active games
    checkForActiveGames();
}

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
                    console.log(`⏰ Server timer set: ${timeLeft} seconds`);
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
        
        // No suitable game found, check when next game starts
        console.log('🆕 No suitable game found, checking next game...');
        
        try {
            const nextGameResponse = await fetch('/api/game/next-start');
            const nextGameData = await nextGameResponse.json();
            
            if (nextGameData.success) {
                console.log(`⏳ Next game in ${nextGameData.secondsLeft} seconds`);
                
                if (nextGameData.secondsLeft <= 30) {
                    // Game starting soon, show countdown
                    showWaitForNextGame(`Next game starts in ${nextGameData.secondsLeft}s`);
                    setTimeout(() => checkForActiveGames(), nextGameData.secondsLeft * 1000);
                } else {
                    // Start local selection as fallback
                    console.log('🆕 Starting local selection (no server games soon)');
                    setTimeout(() => {
                        startBoardSelection();
                    }, 2000);
                }
            } else {
                // Fallback to local selection
                console.log('🆕 Starting local selection (fallback)');
                setTimeout(() => {
                    startBoardSelection();
                }, 2000);
            }
        } catch (apiError) {
            console.log('⚠️ /api/game/next-start not available, using fallback');
            // Fallback to local selection
            setTimeout(() => {
                startBoardSelection();
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error checking active games:', error);
        // Fallback to local mode
        showWaitForNextGame('Server connection issue. Trying local mode...');
        setTimeout(() => {
            startBoardSelection();
        }, 3000);
    }
}

// D. Add mark number function for WebSocket
function markNumberOnBoard(number) {
    if (!gameState.currentPlayer.isActive || !currentGameId) return;
    
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
}


        function startBoardSelection() {
            gameState.gamePhase = 'selecting';
            updateGameStatus();
            
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

       function startSelectionTimer() {
    // If timer already set from server, use that
    if (gameState.selectionTimer <= 0) {
        gameState.selectionTimer = CONFIG.SELECTION_TIME;
    }
    
    updateTimerDisplay();
    
    // Clear any existing interval
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.selectionTimer--;
        updateTimerDisplay();
        
        if (gameState.selectionTimer <= 0) {
            clearInterval(gameState.timerInterval);
            autoConfirmSelection();
        }
    }, 1000);
}

        function startShufflingPhase() {
    gameState.gamePhase = 'shuffling';
    updateGameStatus();
    
    // Server will handle: simulateOtherPlayersSelection() and calculatePrizePool()
    
    // Only display boards if current player is active
    if (gameState.currentPlayer.isActive) {
        displayCurrentPlayerBoards();
    } else {
        showSpectatorMessage();
    }
    
}

        // NEW: Function to get winning numbers list
        function getWinningNumbersList(board, winningPattern) {
            const winningCells = getWinningCells(board, winningPattern);
            const winningNumbers = [];
            
            for (const cell of winningCells) {
                const number = board.boardData[cell.row][cell.col];
                if (number !== 'FREE') {
                    // Convert to B-I-N-G-O format
                    let letter = '';
                    if (number <= 15) letter = 'B';
                    else if (number <= 30) letter = 'I';
                    else if (number <= 45) letter = 'N';
                    else if (number <= 60) letter = 'G';
                    else letter = 'O';
                    
                    winningNumbers.push(`${letter}-${number}`);
                }
            }
            
            // Remove duplicates and sort
            const uniqueNumbers = [...new Set(winningNumbers)].sort((a, b) => {
                const numA = parseInt(a.split('-')[1]);
                const numB = parseInt(b.split('-')[1]);
                return numA - numB;
            });
            
            return uniqueNumbers.map(num => 
                `<span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">${num}</span>`
            ).join('');
        }

        // NEW: Enhanced pattern detection with more details
        function detectWinningPattern(board) {
            // Check horizontal wins
            for (let row = 0; row < 5; row++) {
                let complete = true;
                for (let col = 0; col < 5; col++) {
                    const cellValue = board.boardData[row][col];
                    if (cellValue !== '★' && !board.markedNumbers.has(cellValue)) {
                        complete = false;
                        break;
                    }
                }
                if (complete) {
                    return {
                        name: `Row ${row + 1}`,
                        description: `Complete horizontal line across row ${row + 1}`,
                        type: 'horizontal',
                        row: row
                    };
                }
            }

            // Check vertical wins
            for (let col = 0; col < 5; col++) {
                let complete = true;
                for (let row = 0; row < 5; row++) {
                    const cellValue = board.boardData[row][col];
                    if (cellValue !== '★' && !board.markedNumbers.has(cellValue)) {
                        complete = false;
                        break;
                    }
                }
                if (complete) {
                    const columnNames = ['B', 'I', 'N', 'G', 'O'];
                    return {
                        name: `Column ${columnNames[col]}`,
                        description: `Complete vertical line down column ${columnNames[col]}`,
                        type: 'vertical',
                        col: col
                    };
                }
            }

            // Check diagonal 1 (top-left to bottom-right)
            let diag1Complete = true;
            for (let i = 0; i < 5; i++) {
                const cellValue = board.boardData[i][i];
                if (cellValue !== '★' && !board.markedNumbers.has(cellValue)) {
                    diag1Complete = false;
                    break;
                }
            }
            if (diag1Complete) {
                return {
                    name: "Diagonal ↘️",
                    description: "Diagonal line from top-left to bottom-right",
                    type: 'diagonal1'
                };
            }

            // Check diagonal 2 (top-right to bottom-left)
            let diag2Complete = true;
            for (let i = 0; i < 5; i++) {
                const cellValue = board.boardData[i][4 - i];
                if (cellValue !== '★' && !board.markedNumbers.has(cellValue)) {
                    diag2Complete = false;
                    break;
                }
            }
            if (diag2Complete) {
                return {
                    name: "Diagonal ↙️",
                    description: "Diagonal line from top-right to bottom-left",
                    type: 'diagonal2'
                };
            }

            // Check four corners
            const corners = [
                board.boardData[0][0], // Top-left
                board.boardData[0][4], // Top-right
                board.boardData[4][0], // Bottom-left
                board.boardData[4][4]  // Bottom-right
            ];
            const cornersComplete = corners.every(corner => 
                corner === '★' || board.markedNumbers.has(corner)
            );
            if (cornersComplete) {
                return {
                    name: "Four Corners 🎯",
                    description: "All four corners of the board marked",
                    type: 'corners'
                };
            }

            // Check X pattern (both diagonals)
            if (diag1Complete && diag2Complete) {
                return {
                    name: "X Pattern ❌",
                    description: "Both diagonal lines forming an X",
                    type: 'xpattern'
                };
            }

            // Check full house
            let fullHouse = true;
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    const cellValue = board.boardData[row][col];
                    if (cellValue !== '★' && !board.markedNumbers.has(cellValue)) {
                        fullHouse = false;
                        break;
                    }
                }
                if (!fullHouse) break;
            }
            if (fullHouse) {
                return {
                    name: "Full House 🏠",
                    description: "Every number on the board marked",
                    type: 'fullhouse'
                };
            }

            return {
                name: "Special Pattern",
                description: "Unique winning combination",
                type: 'special'
            };
        }

        // UPDATED: Enhanced board display with better pattern highlighting
 function displayWinningBoardWithPattern(board, winningPattern) {
    const winningCells = getWinningCells(board, winningPattern);
    
    let tableHTML = `
        <div style="display: inline-block; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px; margin: 5px 0;">
            <table style="border-collapse: collapse; font-size: 0.7rem; border: 1px solid var(--safari-gold); background: rgba(255,255,255,0.05);">
    `;
    
    // Compact header with individual letter colors
    tableHTML += '<tr>';
    
    // Individual letter colors matching BINGO columns
    const headerStyles = [
        'background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white;', // B - Blue
        'background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white;', // I - Red/Orange
        'background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white;', // N - Green
        'background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%); color: #2c3e50;', // G - Gold/Yellow
        'background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white;'  // O - Purple
    ];
    
    const letters = ['B', 'I', 'N', 'G', 'O'];
    letters.forEach((letter, index) => {
        tableHTML += `
            <th style="
                ${headerStyles[index]}
                padding: 5px 3px;
                font-weight: bold;
                font-size: 0.65rem;
                border-bottom: 2px solid rgba(0,0,0,0.2);
                min-width: 25px;
            ">${letter}</th>
        `;
    });
    
    tableHTML += '</tr>';
    
    // Compact board cells with column-based background tints
    for (let row = 0; row < 5; row++) {
        tableHTML += '<tr>';
        for (let col = 0; col < 5; col++) {
            const cellValue = board.boardData[row][col];
            const isMarked = board.markedNumbers.has(cellValue) || cellValue === 'FREE';
            const isWinningCell = winningCells.some(cell => cell.row === row && cell.col === col);
            
            // Column-based background tints
            const columnTints = [
                'rgba(52, 152, 219, 0.1)', // B - Blue tint
                'rgba(231, 76, 60, 0.1)',   // I - Red tint
                'rgba(46, 204, 113, 0.1)',  // N - Green tint
                'rgba(241, 196, 15, 0.1)',  // G - Gold tint
                'rgba(155, 89, 182, 0.1)'   // O - Purple tint
            ];
            
            let cellStyle = '';
            
            if (isWinningCell) {
                // Winning cell - gold/yellow highlight
                cellStyle = `
                    background: linear-gradient(135deg, var(--safari-gold) 0%, #e67e22 100%);
                    color: var(--charcoal-dark);
                    border: 2px solid #e67e22;
                    font-weight: 800;
                `;
            } else if (isMarked) {
                // Marked cell - green
                cellStyle = `
                    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
                    color: white;
                    border: 1px solid #27ae60;
                `;
            } else {
                // Regular cell - column tint
                cellStyle = `
                    background: ${columnTints[col]};
                    color: #bdc3c7;
                    border: 1px solid rgba(255,255,255,0.1);
                `;
            }
            
            // FIXED: Free space star now has green background
            tableHTML += `
                <td style="${cellStyle} padding: 4px 2px; text-align: center; font-weight: bold; min-width: 20px;">
                    ${cellValue === '★' ? 
                        '<div style="background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border-radius: 3px; padding: 2px; font-weight: 800; font-size: 0.6rem;">★</div>' : 
                        cellValue}
                </td>
            `;
        }
        tableHTML += '</tr>';
    }
    
    tableHTML += '</table>';
    
    // Compact pattern indicator
    tableHTML += `
        <div style="margin-top: 5px; color: var(--safari-gold); font-size: 0.65rem; text-align: center;">
            ${winningPattern.name}
        </div>
    `;
    
    tableHTML += '</div>';
    return tableHTML;
}

        // UPDATED: Get winning cells with pattern-specific logic
        function getWinningCells(board, winningPattern) {
            const winningCells = [];
            
            switch(winningPattern.type) {
                case 'horizontal':
                    const row = winningPattern.row;
                    for (let col = 0; col < 5; col++) {
                        winningCells.push({ row, col });
                    }
                    break;
                    
                case 'vertical':
                    const col = winningPattern.col;
                    for (let row = 0; row < 5; row++) {
                        winningCells.push({ row, col });
                    }
                    break;
                    
                case 'diagonal1':
                    for (let i = 0; i < 5; i++) {
                        winningCells.push({ row: i, col: i });
                    }
                    break;
                    
                case 'diagonal2':
                    for (let i = 0; i < 5; i++) {
                        winningCells.push({ row: i, col: 4 - i });
                    }
                    break;
                    
                case 'corners':
                    winningCells.push(
                        { row: 0, col: 0 }, // Top-left
                        { row: 0, col: 4 }, // Top-right
                        { row: 4, col: 0 }, // Bottom-left
                        { row: 4, col: 4 }  // Bottom-right
                    );
                    break;
                    
                case 'xpattern':
                    for (let i = 0; i < 5; i++) {
                        winningCells.push({ row: i, col: i }); // Main diagonal
                        winningCells.push({ row: i, col: 4 - i }); // Anti-diagonal
                    }
                    break;
                    
                case 'fullhouse':
                    // All cells are winning in full house
                    for (let row = 0; row < 5; row++) {
                        for (let col = 0; col < 5; col++) {
                            winningCells.push({ row, col });
                        }
                    }
                    break;
                    
                default:
                    // For special patterns, find all marked cells
                    for (let row = 0; row < 5; row++) {
                        for (let col = 0; col < 5; col++) {
                            const cellValue = board.boardData[row][col];
                            if (cellValue === 'FREE' || board.markedNumbers.has(cellValue)) {
                                winningCells.push({ row, col });
                            }
                        }
                    }
                    break;
            }
            
            return winningCells;
        }

        // Winner notification
        function showWinnersList(prizePerWinner, totalBoards, serverWinners = []) {
    const winnersContainer = document.createElement('div');
    winnersContainer.className = 'winners-list';
    winnersContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.95);
        color: white;
        padding: 25px;
        border-radius: 15px;
        z-index: 1000;
        max-height: 80vh;
        overflow-y: auto;
        width: 90%;
        max-width: 500px;
        border: 3px solid var(--safari-gold);
        box-shadow: 0 0 30px rgba(241, 196, 15, 0.5);
        text-align: center;
        font-family: 'Poppins', sans-serif;
    `;
    
    const t = TRANSLATIONS[gameState.currentLanguage];
    
    // Use server data if available, otherwise use local
    const winnersToShow = serverWinners.length > 0 ? serverWinners : gameState.winners;
    
    let winnersHTML = `
        <h2 style="color: var(--safari-gold); margin-bottom: 10px; 
        font-size: 1.8rem; font-weight: 700;"># BINGO WINNERS</h2>
        
        <div style="text-align: left; margin-bottom: 20px; background: 
        rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
            <div style="margin-bottom: 8px;"><strong>Prize per Winner:</strong> ${prizePerWinner} ETB</div>
        </div>
    `;
    
    // Show current player's updated balance if they won
    const currentPlayerWins = winnersToShow.filter(winner => winner.player.id === gameState.currentPlayer.id);
    if (currentPlayerWins.length > 0) {
        winnersHTML += `
            <div style="background: rgba(46, 204, 113, 0.2); padding: 12px; border-radius: 8px; margin: 15px 0; border: 2px solid #2ecc71;">
                <strong style="color: #2ecc71; font-size: 1.1rem;">Your New Balance: ${gameState.currentPlayer.balance} ETB</strong>
            </div>
        `;
        
        // Update balance on server (add this new function)
        updateBalanceOnServer(gameState.currentPlayer.balance).then(success => {
            if (success) {
                console.log('✅ Balance updated on server');
            }
        });
    }
    
    winnersHTML += `<div style="height: 2px; background: var(--safari-gold); margin: 20px 0;"></div>`;
    
    winnersToShow.forEach(winner => {
        const isCurrentPlayer = winner.player.id === gameState.currentPlayer.id;
        const winningPattern = detectWinningPattern(winner.board);
        
        winnersHTML += `
            <div style="margin: 25px 0; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px; border: 2px solid ${isCurrentPlayer ? 'var(--safari-gold)' : 'rgba(255,255,255,0.2)'};">
                <div style="color: ${isCurrentPlayer ? 'var(--safari-gold)' : '#ccc'}; font-weight: bold; margin-bottom: 10px; font-size: 1.2rem;">
                    ${winner.player.telegramName || winner.player.name} ${isCurrentPlayer ? t.you : ''}
                </div>
                <div style="color: #ccc; margin-bottom: 15px; font-size: 0.9rem;">
                    Board #${winner.board.boardNumber}
                </div>
                
                <!-- Prize Information -->
                <div style="color: #2ecc71; font-weight: bold; margin-bottom: 15px; font-size: 1rem;">
                    🏆 <strong>Prize:</strong> ${prizePerWinner} ETB
                </div>
                
                <!-- Winning Pattern Information -->
                <div style="margin: 15px 0;">
                    <div style="color: var(--safari-gold); font-size: 0.9rem; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
                        🎯 Winning Pattern: ${winningPattern.name}
                    </div>
                    <div style="color: #ccc; font-size: 0.8rem; margin-bottom: 15px; font-style: italic;">
                        ${winningPattern.description}
                    </div>
                </div>
                
                <!-- Show actual winning board with highlighted pattern -->
                <div style="margin-top: 15px;">
                    ${displayWinningBoardWithPattern(winner.board, winningPattern)}
                </div>
                
                <!-- Show winning numbers list -->
                <div style="margin-top: 15px;">
                    <div style="color: var(--safari-gold); font-size: 0.8rem; margin-bottom: 8px;">
                        📋 Winning Numbers:
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                        ${getWinningNumbersList(winner.board, winningPattern)}
                    </div>
                </div>
            </div>
        `;
    });
    
    winnersHTML += `
        <div style="margin-top: 25px; color: #3498db; font-size: 0.9rem; font-style: italic;">
            ${t.nextGame}
        </div>
    `;
    
    winnersContainer.innerHTML = winnersHTML;
    document.body.appendChild(winnersContainer);
    
    setTimeout(() => {
        if (winnersContainer.parentNode) {
            winnersContainer.parentNode.removeChild(winnersContainer);
        }
    }, 10000);
}
// ADD THIS NEW FUNCTION:
async function updateBalanceOnServer(newBalance) {
    try {
        const response = await fetch('/api/user/update-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                balance: newBalance
            })
        });
        
        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Error updating balance on server:', error);
        return false;
    }
}

// ==================== DEPOSIT FUNCTION ====================

// Go to deposit (opens Telegram bot)
function goToDeposit() {
    const t = TRANSLATIONS[gameState.currentLanguage];
    
    if (window.Telegram && Telegram.WebApp) {
        // In Telegram Web App - send data to bot
        Telegram.WebApp.sendData(JSON.stringify({
            action: 'deposit',
            userId: userId,
            amount: CONFIG.BET_AMOUNT,
            timestamp: Date.now()
        }));
        
        // Show message
        alert(t('redirectingToDeposit') || 'Opening deposit page in Telegram...');
        
    } else if (userId && userId !== 'demo') {
        // In browser - open Telegram bot with start parameter
        window.location.href = `https://t.me/your_bot_username?start=${userId}_deposit`;
        
    } else {
        // No user ID - show instructions
        alert(t('openFromTelegram') || 'Please open this game from Telegram bot to deposit.');
    }
}

        // Create main bingo board display
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
            elements.confirmSelection.addEventListener('click', confirmSelection);
        }

      // B. Replace claimBingo() function (around line 1600)
// Find this function and REPLACE it completely:
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
    updateGameStatus();
    
    showGameMessage('🎯 BINGO claimed! Waiting for server validation...', 'info');
}


function getAllWinningPatterns(board) {
    const patterns = [];
    
    // Check rows
    for (let row = 0; row < 5; row++) {
        let complete = true;
        for (let col = 0; col < 5; col++) {
            const cellValue = board.boardData[row][col];
            if (cellValue !== '★' && !board.markedNumbers.has(cellValue)) {
                complete = false;
                break;
            }
        }
        if (complete) patterns.push({ type: 'row', index: row });
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
        let complete = true;
        for (let row = 0; row < 5; row++) {
            const cellValue = board.boardData[row][col];
            if (cellValue !== '★' && !board.markedNumbers.has(cellValue)) {
                complete = false;
                break;
            }
        }
        if (complete) patterns.push({ type: 'column', index: col });
    }
    
    // Check diagonals
    let diag1Complete = true;
    let diag2Complete = true;
    for (let i = 0; i < 5; i++) {
        const cell1 = board.boardData[i][i];
        const cell2 = board.boardData[i][4 - i];
        
        if (cell1 !== '★' && !board.markedNumbers.has(cell1)) {
            diag1Complete = false;
        }
        if (cell2 !== '★' && !board.markedNumbers.has(cell2)) {
            diag2Complete = false;
        }
    }
    if (diag1Complete) patterns.push({ type: 'diagonal', name: 'main' });
    if (diag2Complete) patterns.push({ type: 'diagonal', name: 'anti' });
    
    // Check four corners
    const corners = [
        board.boardData[0][0],
        board.boardData[0][4],
        board.boardData[4][0],
        board.boardData[4][4]
    ];
    const cornersComplete = corners.every(corner => 
        corner === '★' || board.markedNumbers.has(corner)
    );
    if (cornersComplete) patterns.push({ type: 'corners' });
    
    // Check full house (all numbers marked)
    let fullHouse = true;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cellValue = board.boardData[row][col];
            if (cellValue !== '★' && !board.markedNumbers.has(cellValue)) {
                fullHouse = false;
                break;
            }
        }
        if (!fullHouse) break;
    }
    if (fullHouse) patterns.push({ type: 'fullhouse' });
    
    return patterns;
}

function checkUncalledMarks(board) {
    const uncalled = [];
    
    board.markedNumbers.forEach(markedNumber => {
        if (!gameState.calledNumbers.includes(markedNumber)) {
            uncalled.push(markedNumber);
        }
    });
    
    return uncalled;
}

function checkForFraud(board) {
    // Only check fraud if there's NO winning pattern
    
    let fraudDetected = false;
    const uncalledMarks = checkUncalledMarks(board);
    
    if (uncalledMarks.length > 0) {
        // Check if uncalled marks are part of a winning pattern
        // If they're NOT part of any pattern, it's fraud
        
        const patternsWon = getAllWinningPatterns(board);
        
        if (patternsWon.length === 0) {
            // No winning patterns but has uncalled marks = FRAUD
            fraudDetected = true;
            console.log(`🚨 FRAUD DETECTED: ${uncalledMarks.length} uncalled marks with no winning pattern`);
        } else {
            // Has winning pattern(s) - uncalled marks are forgiven
            console.log(`⚠️ ${uncalledMarks.length} uncalled marks forgiven (winning pattern exists)`);
            fraudDetected = false;
        }
    }
    
    return fraudDetected;
}


     function showEliminationMessage(message) {
    const eliminationMsg = document.createElement('div');
    eliminationMsg.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(231, 76, 60, 0.95);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        text-align: center;
        border: 2px solid #c0392b;
        font-weight: bold;
        font-size: 1.1rem;
        max-width: 90%;
        word-wrap: break-word;
    `;
    eliminationMsg.innerHTML = `<strong>${message}</strong>`;
    document.body.appendChild(eliminationMsg);
    
    setTimeout(() => {
        if (eliminationMsg.parentNode) {
            eliminationMsg.parentNode.removeChild(eliminationMsg);
        }
    }, 5000);
}
  

 // ✅ Update game status display (REAL MULTIPLAYER SAFE)
function updateGameStatus() {
    if (!elements.gameStatus || !gameState) return;

    const statusTexts = {
        waiting: t('waiting'),
        selecting: t('selecting'),
        shuffling: t('shuffling'),
        started: t('started'),
        checking: t('checking'),
        finished: t('finished')
    };

    const phase = gameState.gamePhase || 'waiting';

    elements.gameStatus.textContent = statusTexts[phase] || t('waiting');
    elements.gameStatus.className = 'status-badge game-' + phase;
}


        // Update all game statistics with proper balance display
        function updateGameStats() {
            // Update balance display immediately
            elements.balanceValue.textContent = gameState.currentPlayer.balance;
            elements.prizeValue.textContent = gameState.totalPrizePool;
            
            let totalBoards = 0;
            gameState.activePlayers.forEach(player => {
                totalBoards += player.boards.length;
            });
            elements.playersValue.textContent = totalBoards;
            
            elements.calledCount.textContent = gameState.calledNumbers.length;
            
            console.log(`📊 Stats Update: Balance: $${gameState.currentPlayer.balance}, Total Boards: ${totalBoards}, Prize: ${gameState.totalPrizePool}`);
        }

        
        // Registration Popup Functions
        function openRegistrationPopup() {
    elements.registrationPopup.style.display = 'flex';
    generateBoardOptions();
    updateSelectionInfo();
    
    // Clear any existing interval
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // If we have a server timer, use it
    if (gameState.selectionTimer && gameState.selectionTimer > 0) {
        console.log(`⏰ Using server timer: ${gameState.selectionTimer} seconds`);
        updateTimerDisplay();
        
        // Start countdown with server time
        gameState.timerInterval = setInterval(() => {
            gameState.selectionTimer--;
            updateTimerDisplay();
            
            if (gameState.selectionTimer <= 0) {
                clearInterval(gameState.timerInterval);
                autoConfirmSelection();
            }
        }, 1000);
    } else {
        // Use default timer (25 seconds)
        console.log('⏰ Using default timer: 25 seconds');
        gameState.selectionTimer = CONFIG.SELECTION_TIME;
        updateTimerDisplay();
        
        gameState.timerInterval = setInterval(() => {
            gameState.selectionTimer--;
            updateTimerDisplay();
            
            if (gameState.selectionTimer <= 0) {
                clearInterval(gameState.timerInterval);
                autoConfirmSelection();
            }
        }, 1000);
    }
}
        function closeRegistrationPopup() {
            elements.registrationPopup.style.display = 'none';
            clearInterval(gameState.timerInterval);
        }

        function updateTimerDisplay() {
            elements.selectionTimer.textContent = `${gameState.selectionTimer} ${t('seconds') || 'seconds'}`;
            
            if (gameState.selectionTimer <= 10) {
                elements.selectionTimer.style.color = '#e74c3c';
                elements.selectionTimer.classList.add('timer-warning');
            } else {
                elements.selectionTimer.style.color = '';
                elements.selectionTimer.classList.remove('timer-warning');
            }
        }

        function generateBoardOptions() {
    elements.boardsGrid.innerHTML = '';
    
    gameState.availableBoards.forEach(boardNumber => {
        const boardElement = document.createElement('div');
        boardElement.className = 'board-option';
        boardElement.innerHTML = `<div class="board-number">${boardNumber}</div>`;
        
        // Check if board is taken by OTHER players (not current player)
        const isTaken = isBoardTaken(boardNumber);
        
        if (isTaken) {
            boardElement.classList.add('taken');
            boardElement.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)'; // Red gradient
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
        // Show alert AND visual feedback
        element.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
        
        alert(t('boardTaken'));
        return;
    }
    
    if (element.classList.contains('taken')) {
        // Already handled above, but just in case
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

        function autoConfirmSelection() {
    // Player didn't select any boards - show wait message
    closeRegistrationPopup();
    
    if (gameState.selectedBoards.size === 0) {
        showWaitForNextGame('No boards selected. Waiting for next game...');
    } else {
        // Player selected boards, confirm selection
        confirmSelection();
    }
    
    // Continue with other players who might have selected boards
    setTimeout(() => {
        if (gameState.activePlayers.length > 0) {
            // Other players selected boards, continue the game
            startShufflingPhase();
        } else {
            // No players at all selected boards
            console.log('⏳ No players selected boards');
        }
    }, 1000);
}

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
    
    const t = TRANSLATIONS[gameState.currentLanguage];
    waitMessage.innerHTML = `
        <div style="margin-bottom: 15px; font-size: 1.4rem;">⏳</div>
        <div style="color: var(--deep-purple); margin-bottom: 10px;">
            ${message}
        </div>
        
        <div style="font-size: 0.9rem; color: #666; margin-top: 15px;">
            ${t.waiting || 'Please wait...'}
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
    
    // Update game status to show player is not active
    gameState.currentPlayer.isActive = false;
    updateGameStatus();
    
    console.log(`⏳ ${message}`);
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
    
    const t = TRANSLATIONS[gameState.currentLanguage];
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
    updateGameStatus();
    
    console.log(`👀 ${message}`);
}


        // Balance deduction when buying boards
       function confirmSelection() {
    if (gameState.selectedBoards.size === 0) {
        alert(t('selectOneBoard'));
        return;
    }
    
    const totalCost = gameState.selectedBoards.size * CONFIG.BET_AMOUNT;
    if (totalCost > gameState.currentPlayer.balance) {
        alert(t('insufficientBalance'));
        return;
    }
    
    // Deduct cost from balance
    const oldBalance = gameState.currentPlayer.balance;
    gameState.currentPlayer.balance -= totalCost;
    console.log(`💰 Balance deducted: ${totalCost} (${oldBalance} → ${gameState.currentPlayer.balance})`);
    
    gameState.currentPlayer.isActive = true;
    gameState.currentPlayer.boards = createPlayerBoards();
    gameState.currentPlayer.totalPaid = totalCost;
    gameState.activePlayers.push(gameState.currentPlayer);
    
    console.log(`✅ YOU selected ${gameState.selectedBoards.size} boards:`);
    gameState.selectedBoards.forEach(boardNum => {
        console.log(`   - Board #${boardNum}`);
    });
    
    // Update board display to show player's boards as selected (not taken)
    gameState.selectedBoards.forEach(boardNumber => {
        const boardElements = document.querySelectorAll('.board-option');
        boardElements.forEach(element => {
            const elementBoardNum = parseInt(element.querySelector('.board-number').textContent);
            if (elementBoardNum === boardNumber) {
                element.classList.remove('taken');
                element.classList.add('selected');
                element.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                element.style.color = 'white';
                element.style.cursor = 'pointer';
                element.style.opacity = '1';
                element.style.border = '2px solid #27ae60';
            }
        });
    });
    
    // Update balance display immediately
    updateGameStats();
    
    closeRegistrationPopup();
    startShufflingPhase();
}

        function createPlayerBoards() {
            const playerBoards = [];
            gameState.selectedBoards.forEach(boardNumber => {
                playerBoards.push({
                    boardNumber: boardNumber,
                    boardData: generateBingoBoard(),
                    markedNumbers: new Set(),
                    isWinner: false,
                    isEliminated: false
                });
            });
            return playerBoards;
        }

       
function updateBoardDisplay() {
    const boardElements = document.querySelectorAll('.board-option');
    
    boardElements.forEach(element => {
        const boardNumber = parseInt(element.querySelector('.board-number').textContent);
        const isTaken = isBoardTaken(boardNumber);
        const isSelected = gameState.selectedBoards.has(boardNumber);
        
        // Reset styles
        element.classList.remove('taken', 'selected');
        element.style.background = '';
        element.style.color = '';
        element.style.cursor = '';
        element.style.opacity = '';
        element.style.border = '';
        
        // Remove existing taken indicator
        const existingIndicator = element.querySelector('.taken-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (isTaken && !isSelected) {
            // Board taken by other player
            element.classList.add('taken');
            element.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            element.style.color = 'white';
            element.style.cursor = 'not-allowed';
            element.style.opacity = '0.7';
            element.style.border = '2px solid #e74c3c';
            
            const takenIndicator = document.createElement('div');
            takenIndicator.className = 'taken-indicator';
            takenIndicator.innerHTML = '✗';
            element.style.position = 'relative';
            element.appendChild(takenIndicator);
            
        } else if (isSelected) {
            // Board selected by current player
            element.classList.add('selected');
            element.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            element.style.color = 'white';
            element.style.border = '2px solid #27ae60';
        }
    });
}
       
        // Bingo Board Generation
        function generateBingoBoard() {
            const B = shuffleArray([...CONFIG.BINGO_NUMBERS['B']]).slice(0, 5).sort((a, b) => a - b);
            const I = shuffleArray([...CONFIG.BINGO_NUMBERS['I']]).slice(0, 5).sort((a, b) => a - b);
            const N = shuffleArray([...CONFIG.BINGO_NUMBERS['N']]).slice(0, 4).sort((a, b) => a - b);
            const G = shuffleArray([...CONFIG.BINGO_NUMBERS['G']]).slice(0, 5).sort((a, b) => a - b);
            const O = shuffleArray([...CONFIG.BINGO_NUMBERS['O']]).slice(0, 5).sort((a, b) => a - b);
            
            const board = [];
            let nIndex = 0;
            
            for (let row = 0; row < 5; row++) {
                const rowData = [
                    B[row],
                    I[row],
                    row === 2 ? '★' : N[nIndex++],
                    G[row],
                    O[row]
                ];
                board.push(rowData);
            }
            
            return board;
        }


function updateBoardDisplay() {
    const boardElements = document.querySelectorAll('.board-option');
    
    boardElements.forEach(element => {
        const boardNumber = parseInt(element.querySelector('.board-number').textContent);
        const isTaken = isBoardTaken(boardNumber);
        const isSelected = gameState.selectedBoards.has(boardNumber);
        
        // Reset styles
        element.classList.remove('taken', 'selected');
        element.style.background = '';
        element.style.color = '';
        element.style.cursor = '';
        element.style.opacity = '';
        element.style.border = '';
        
        // Remove existing taken indicator
        const existingIndicator = element.querySelector('.taken-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (isTaken && !isSelected) {
            // Board taken by other player
            element.classList.add('taken');
            element.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            element.style.color = 'white';
            element.style.cursor = 'not-allowed';
            element.style.opacity = '0.7';
            element.style.border = '2px solid #e74c3c';
            
            const takenIndicator = document.createElement('div');
            takenIndicator.className = 'taken-indicator';
            takenIndicator.innerHTML = '✗';
            element.style.position = 'relative';
            element.appendChild(takenIndicator);
            
        } else if (isSelected) {
            // Board selected by current player
            element.classList.add('selected');
            element.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            element.style.color = 'white';
            element.style.border = '2px solid #27ae60';
        }
    });
}

        function shuffleArray(array) {
            return array.sort(() => Math.random() - 0.5);
        }

        function updateGameDisplay() {
            if (gameState.currentCall) {
                elements.currentLetter.textContent = gameState.currentCall.letter;
                elements.currentNumber.textContent = gameState.currentCall.number;
            }
            
            updateCalledNumbersList();
            updateMainBoardColors();
            updateGameStats();
        }
// 2. TABLE LAYOUT FIX FUNCTION (place it here)
function ensureTableLayout() {
    const containers = document.querySelectorAll('.bingo-table-container');
    
    containers.forEach(container => {
        // Force right padding
        container.style.paddingLeft = '0';
        container.style.paddingRight = '10px';
        
        // Ensure container width is correct
        const parentWidth = container.parentElement.offsetWidth;
        container.style.width = '100%';
        container.style.maxWidth = '100%';
        
        // Check table width
        const table = container.querySelector('.bingo-table');
        if (table) {
            // Ensure table fills container
            table.style.width = '100%';
            table.style.minWidth = '100%';
            
            // Calculate column widths for 5 columns
            const containerWidth = container.offsetWidth - 10; // Subtract right padding
            const colWidth = (containerWidth / 5) + 'px';
            
            // Apply equal width to all headers and cells
            const headers = table.querySelectorAll('th');
            const cells = table.querySelectorAll('td');
            
            headers.forEach(header => {
                header.style.minWidth = colWidth;
                header.style.maxWidth = colWidth;
            });
            
            // First row cells
            const firstRowCells = table.querySelectorAll('tr:first-child td');
            firstRowCells.forEach(cell => {
                cell.style.minWidth = colWidth;
                cell.style.maxWidth = colWidth;
            });
        }
    });
}
// 3. OTHER GAME FUNCTIONS (after table fix)

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
    const isVerySmall = window.innerWidth <= 360; // Extra small phones
    
    // NO REVERSING - Keep natural order (oldest to newest)
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
        callElement.dataset.index = index;
        
        // Check if this is the most recent (last in array)
        const isMostRecent = index === recentCalls.length - 1;
        
        // DETERMINE SIZES BASED ON SCREEN
        let fontSize, itemWidth, itemHeight, padding, borderRadius;
        
        if (isVerySmall) {
            // EXTRA SMALL PHONES (≤360px)
            fontSize = '0.5rem';
            itemWidth = '28px';
            itemHeight = '18px';
            padding = '1px';
            borderRadius = '2px';
        } else if (isMobile) {
            // REGULAR MOBILE (≤500px)
            fontSize = '0.55rem';
            itemWidth = '30px';
            itemHeight = '20px';
            padding = '1px 2px';
            borderRadius = '2px';
        } else {
            // DESKTOP (>500px)
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
            position: relative;
            overflow: hidden;
            margin: 0 ${isVerySmall ? '1px' : (isMobile ? '1.5px' : '2px')} 0 0;
            line-height: 1;
            transform: ${isMostRecent ? 'scale(1.05)' : 'scale(1)'};
            z-index: ${isMostRecent ? '5' : '1'};
            animation: ${isMostRecent ? 'slideInFromRight 0.2s ease-out' : 'none'};
            transition: all 0.2s ease;
        `;
        
        // Create inner HTML with appropriate font sizes
        const letterSize = isVerySmall ? '0.6rem' : (isMobile ? '0.65rem' : '0.7rem');
        const hyphenSize = isVerySmall ? '0.5rem' : (isMobile ? '0.55rem' : '0.6rem');
        const numberSize = isVerySmall ? '0.7rem' : (isMobile ? '0.75rem' : '0.8rem');
        
        callElement.innerHTML = `
            <span style="font-weight:600; font-size:${letterSize};">${letter}</span>
            <span style="margin: 0 0.5px; font-size:${hyphenSize};">-</span>
            <span style="font-weight:800; font-size:${numberSize};">${number}</span>
        `;
        
        // Check marking status
        let isMarkedOnAny = false;
        let isUnmarkedOnAny = false;
        
        if (gameState.currentPlayer.isActive) {
            gameState.currentPlayer.boards.forEach(board => {
                if (!board.isEliminated && board.markedNumbers.has(number)) {
                    isMarkedOnAny = true;
                } else if (!board.isEliminated) {
                    isUnmarkedOnAny = true;
                }
            });
        }
        
        // Add marking indicator (very small)
        if (isMarkedOnAny && !isUnmarkedOnAny) {
            const indicator = document.createElement('div');
            const dotSize = isVerySmall ? '4px' : (isMobile ? '5px' : '6px');
            indicator.style.cssText = `
                position: absolute;
                top: 1px;
                right: 1px;
                width: ${dotSize};
                height: ${dotSize};
                background: #27ae60;
                border-radius: 50%;
                border: 1px solid white;
                z-index: 1;
            `;
            callElement.appendChild(indicator);
        }
        
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
        
        // Add hover effect (desktop only)
        if (!isMobile) {
            callElement.addEventListener('mouseenter', function() {
                const currentScale = isMostRecent ? 1.05 : 1;
                this.style.transform = `scale(${currentScale * 1.05})`;
                this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            });
            
            callElement.addEventListener('mouseleave', function() {
                this.style.transform = isMostRecent ? 'scale(1.05)' : 'scale(1)';
                this.style.boxShadow = isMostRecent ? 
                    '0 0 0 1px white, 0 1px 3px rgba(0,0,0,0.3)' : 
                    '0 1px 2px rgba(0,0,0,0.2)';
            });
        }
        
        container.appendChild(callElement);
    });
    
    // Calculate container size based on screen
    let containerHeight, totalWidth;
if (isVerySmall) {
    containerHeight = '20px';
    const itemWidth = 28; // pixels
    const gap = 1; // pixels
    totalWidth = (itemWidth * recentCalls.length) + (gap * (recentCalls.length - 1));
} else if (isMobile) {
    containerHeight = '22px';
    const itemWidth = 30; // pixels
    const gap = 1.5; // pixels
    totalWidth = (itemWidth * recentCalls.length) + (gap * (recentCalls.length - 1));
} else {
    containerHeight = '26px';
    const itemWidth = 36; // pixels
    const gap = 2; // pixels
    totalWidth = (itemWidth * recentCalls.length) + (gap * (recentCalls.length - 1));
}
    // Apply container styles
    container.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-width: ${totalWidth}px;
        max-width: 100%;
        height: ${containerHeight};
        padding: 0;
        overflow: visible;
        flex-direction: row;
        gap: ${isVerySmall ? '1px' : (isMobile ? '1.5px' : '2px')};
        background: transparent;
        margin: 0 auto;
    `;
    
    // Add CSS animation
    const styleId = 'called-numbers-animation-' + Date.now();
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes slideInFromRight {
            from {
                transform: translateX(10px) scale(0.9);
                opacity: 0;
            }
            to {
                transform: translateX(0) scale(1);
                opacity: 1;
            }
        }
    `;
    
    // Remove old style if exists
    const oldStyle = document.getElementById('called-numbers-animation');
    if (oldStyle) oldStyle.remove();
    
    // Add new style
    document.head.appendChild(style);
}
// Update your existing markNumberOnPlayerBoards function to use WebSocket
// Find this function (around line 2000) and ADD the WebSocket call:
function markNumberOnPlayerBoards(number, callElement) {
    if (!gameState.currentPlayer.isActive || gameState.gamePhase !== 'started') {
        console.log('Cannot mark number: Game not active or wrong phase');
        return;
    }
    
    // Send to server FIRST
    markNumberOnBoard(number);
    
    // Then update local state (for immediate feedback)
    let marked = false;
    let unmarked = false;
    
    gameState.currentPlayer.boards.forEach(board => {
        if (!board.isEliminated) {
            if (board.markedNumbers.has(number)) {
                board.markedNumbers.delete(number);
                unmarked = true;
            } else {
                board.markedNumbers.add(number);
                marked = true;
            }
        }
    });
    
    // Update display
    displayCurrentPlayerBoards(gameState.currentBoardIndex);
}

        // Player Board Management
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

            activeBoards.forEach((board, index) => {
                const miniature = document.createElement('div');
                miniature.className = `board-miniature ${index === gameState.currentBoardIndex ? 'active' : ''}`;
                miniature.innerHTML = `<div>${t('#').split(' ')[0]} ${board.boardNumber}</div>`;
                miniature.addEventListener('click', () => switchBoard(index));
                elements.boardsCarousel.appendChild(miniature);
            });

            if (activeBoards.length > 0) {
                displayBoard(gameState.currentBoardIndex);
            }
        }

        function switchBoard(boardIndex) {
            gameState.currentBoardIndex = boardIndex;
            
            document.querySelectorAll('.board-miniature').forEach((mini, index) => {
                mini.classList.toggle('active', index === boardIndex);
            });
            
            const activeBoards = gameState.currentPlayer.boards.filter(board => !board.isEliminated);
            if (activeBoards.length > boardIndex) {
                displayBoard(boardIndex);
            }
        }

       function displayBoard(boardIndex) {
    elements.currentBoard.innerHTML = '';

    const activeBoards = gameState.currentPlayer.boards.filter(board => !board.isEliminated);
    const board = activeBoards[boardIndex];

    const table = document.createElement('table');
    table.className = 'bingo-table';
    
    const headerRow = document.createElement('tr');
    
    // Define letters with their color classes
    const letters = [
        { letter: 'B', colorClass: 'b' },
        { letter: 'I', colorClass: 'i' },
        { letter: 'N', colorClass: 'n' },
        { letter: 'G', colorClass: 'g' },
        { letter: 'O', colorClass: 'o' }
    ];
    
    // Create header cells with individual colors
    letters.forEach(item => {
        const th = document.createElement('th');
        th.textContent = item.letter;
        th.className = item.colorClass;  // ← ADD THIS LINE
        headerRow.appendChild(th);
    });
    
    table.appendChild(headerRow);
    
    // ... rest of the code stays the same
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
    
    const bingoButton = document.createElement('button');
    bingoButton.className = 'bingo-btn';
    bingoButton.textContent = t('claimBingo');
    bingoButton.style.marginTop = '10px';
    bingoButton.style.width = '100%';
    bingoButton.addEventListener('click', claimBingo);
    elements.currentBoard.appendChild(bingoButton);
}

        // Win Checking
        function checkBoardWin(board) {
    const patterns = getAllWinningPatterns(board);
    return patterns.length > 0;
}

        // Support Manager
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
                    <a href="https://t.me/YourUsername" target="_blank">
                        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png"
                             alt="Telegram" width="30">
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
                helpBtn.addEventListener('click', () => this.toggleSupportButtons(helpBtn, telegramBtn, callBtn));
                telegramBtn.addEventListener('click', () => this.openTelegramSupport());
                callBtn.addEventListener('click', () => this.showCallSupport());
                
                // Add buttons in correct order - question mark LAST (at bottom)
                supportContainer.appendChild(callBtn);      // Will be at TOP
                supportContainer.appendChild(telegramBtn);  // Will be in MIDDLE  
                supportContainer.appendChild(helpBtn);      // Will be at BOTTOM (visible)
                
                document.body.appendChild(supportContainer);
            },
            
            toggleSupportButtons: function(helpBtn, telegramBtn, callBtn) {
                // Check if other buttons are visible
                const telegramVisible = telegramBtn.style.display !== 'none';
                const callVisible = callBtn.style.display !== 'none';
                
                if (telegramVisible || callVisible) {
                    // Hide other buttons (collapse)
                    telegramBtn.style.display = 'none';
                    callBtn.style.display = 'none';
                    helpBtn.innerHTML = '❓';
                    helpBtn.title = 'Show Support Options';
                } else {
                    // Show other buttons (expand)
                    telegramBtn.style.display = 'flex';
                    callBtn.style.display = 'flex';
                    helpBtn.innerHTML = '❓';
                    helpBtn.title = 'Close Support Menu';
                    // Show quick help immediately when expanding
                    this.showQuickHelp();
                }
            },
            
            openTelegramSupport: function() {
                // Open Telegram support
                const telegramUrl = 'https://t.me/ShebaBingoSupport';
                window.open(telegramUrl, '_blank');
                
                // Show confirmation message
                this.showSupportMessage('Opening Telegram support...', 'info');
            },
            
            showCallSupport: function() {
                // Show call support information
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
                // Quick help and FAQ
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
                                <li>Withdrawals processed within 5 Minutes</li>
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
                // Create toast message
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
                
                // Remove toast after 3 seconds
                setTimeout(() => {
                    toast.remove();
                }, 3000);
            },
            
            closeSupportMenu: function() {
                const supportContainer = document.getElementById('supportContainer');
                if (supportContainer) {
                    const buttons = supportContainer.querySelectorAll('.support-btn');
                    buttons.forEach((btn, index) => {
                        if (index > 0) { // Keep first button (help button) visible
                            btn.style.display = 'none';
                        }
                    });
                    
                    // Reset help button to question mark
                    const helpBtn = buttons[0];
                    if (helpBtn) {
                        helpBtn.innerHTML = '❓';
                        helpBtn.title = 'Show Support Options';
                    }
                }
            }
        };

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initializeApp);
        window.closeRegistrationPopup = closeRegistrationPopup;
   
