// ==================== SHEBA BINGO - WORKING MULTIPLAYER ====================

// Configuration
const CONFIG = {
    BET_AMOUNT: 10,
    TOTAL_BOARDS: 400,
    MAX_BOARDS_PER_PLAYER: 3,
    SELECTION_TIME: 25,
    CALL_INTERVAL: 3000
};

// Translations
const TRANSLATIONS = {
    en: {
        waiting: "Waiting for Next Game",
        selecting: "Selecting Boards",
        shuffling: "Shuffling Numbers...",
        started: "Game Started",
        active: "Game Active!",
        balance: "Balance",
        prize: "Prize",
        players: "Players",
        called: "Called",
        currentCall: "Current Call",
        recentlyCalled: "Recently Called",
        yourBoards: "Your Bingo Boards",
        claimBingo: "🎯 CLAIM BINGO",
        insufficientBalance: "Insufficient balance",
        boardTaken: "This board is already taken!",
        maxBoardsReached: "Maximum 3 boards allowed"
    },
    am: {
        waiting: "የሚቀጥለው ጨዋታ በመጠበቅ ላይ",
        selecting: "ቦርዶች በመምረጥ ላይ",
        shuffling: "ቁጥሮች በማደባለቅ ላይ...",
        started: "ጨዋታው ጀምሯል",
        active: "ጨዋታው ተጀምሯል!",
        balance: "ቀሪ ሂሳብ",
        prize: "ሽልማት",
        players: "ተጫዋቾች",
        called: "የተጠራ",
        currentCall: "የአሁኑ ጥሪ",
        recentlyCalled: "በቅርብ ጊዜ የተጠሩ",
        yourBoards: "የእርስዎ ቢንጎ ቦርዶች",
        claimBingo: "🎯 ቢንጎ አለኝ",
        insufficientBalance: "በቂ ቀሪ ሂሳብ የለም",
        boardTaken: "ይህ ቦርድ ተወስዷል!",
        maxBoardsReached: "�ተጨማሪ ቦርድ መምረጥ አይቻልም"
    }
};

// Game State
let gameState = {
    currentPlayer: { id: null, name: 'Player', balance: 0, boards: [], isActive: false },
    selectedBoards: new Set(),
    availableBoards: Array.from({ length: 400 }, (_, i) => i + 1),
    gamePhase: 'waiting',
    calledNumbers: [],
    currentCall: null,
    totalPrizePool: 0,
    currentLanguage: 'en',
    currentBoardIndex: 0,
    timerInterval: null
};

// DOM Elements
const elements = {
    balanceValue: document.getElementById('balanceValue'),
    prizeValue: document.getElementById('prizeValue'),
    playersValue: document.getElementById('playersValue'),
    calledCount: document.getElementById('calledCount'),
    gameStatus: document.getElementById('gameStatus'),
    currentLetter: document.getElementById('currentLetter'),
    currentNumber: document.getElementById('currentNumber'),
    calledNumbersList: document.getElementById('calledNumbersList'),
    bingoGrid: document.getElementById('bingoGrid'),
    registrationPopup: document.getElementById('registrationPopup'),
    boardsGrid: document.getElementById('boardsGrid'),
    selectedCount: document.getElementById('selectedCount'),
    totalCost: document.getElementById('totalCost'),
    confirmSelection: document.getElementById('confirmSelection'),
    selectionTimer: document.getElementById('selectionTimer'),
    gamePlaySection: document.getElementById('gamePlaySection'),
    boardsCarousel: document.getElementById('boardsCarousel'),
    currentBoard: document.getElementById('currentBoard')
};

// ==================== USER ID MANAGEMENT ====================
function getUserId() {
    let userId = localStorage.getItem('sheba_user_id');
    if (!userId) {
        const urlParams = new URLSearchParams(window.location.search);
        userId = urlParams.get('user');
        if (!userId && window.Telegram?.WebApp?.initDataUnsafe?.user) {
            userId = Telegram.WebApp.initDataUnsafe.user.id;
        }
        if (!userId) userId = 'demo_' + Math.floor(Math.random() * 10000);
        localStorage.setItem('sheba_user_id', userId);
    }
    return userId;
}

const USER_ID = getUserId();
console.log('👤 User ID:', USER_ID);

// ==================== API HELPER ====================
const API_BASE = '';

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        return await response.json();
    } catch (error) {
        console.error(`API Error ${endpoint}:`, error);
        return { success: false, error: error.message };
    }
}

// ==================== BALANCE ====================
async function loadBalance() {
    const data = await apiCall(`/api/user/${USER_ID}/balance`);
    if (data.success) {
        gameState.currentPlayer.balance = data.balance;
        gameState.currentPlayer.username = data.username || 'Player';
        updateBalanceDisplay();
    } else {
        gameState.currentPlayer.balance = 100;
        updateBalanceDisplay();
    }
}

function updateBalanceDisplay() {
    if (elements.balanceValue) {
        elements.balanceValue.textContent = gameState.currentPlayer.balance + ' ETB';
    }
}

// ==================== BINGO BOARD GENERATION ====================
function createMainBingoBoard() {
    const grid = elements.bingoGrid;
    if (!grid) return;
    
    grid.innerHTML = '';
    const letters = ['B', 'I', 'N', 'G', 'O'];
    
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';
            const letter = letters[col];
            const number = CONFIG.BINGO_NUMBERS?.[letter]?.[row] || (col * 15 + row + 1);
            cell.textContent = number;
            cell.dataset.number = number;
            cell.dataset.letter = letter;
            grid.appendChild(cell);
        }
    }
}

function generateBingoBoard() {
    const board = [];
    const letters = ['B', 'I', 'N', 'G', 'O'];
    const ranges = { B: [1,15], I: [16,30], N: [31,45], G: [46,60], O: [61,75] };
    
    for (let i = 0; i < 5; i++) {
        const row = [];
        for (let j = 0; j < 5; j++) {
            if (i === 2 && j === 2) {
                row.push('FREE');
            } else {
                const [min, max] = ranges[letters[j]];
                const num = Math.floor(Math.random() * (max - min + 1)) + min;
                row.push(num);
            }
        }
        board.push(row);
    }
    return board;
}

// ==================== MULTIPLAYER GAME FLOW ====================
let currentGameId = null;
let gamePollInterval = null;

async function joinGame() {
    if (gameState.selectedBoards.size === 0) {
        alert('Please select at least one board');
        return;
    }
    
    const totalCost = gameState.selectedBoards.size * CONFIG.BET_AMOUNT;
    if (totalCost > gameState.currentPlayer.balance) {
        alert(`Insufficient balance! Need ${totalCost} ETB`);
        return;
    }
    
    const confirmBtn = elements.confirmSelection;
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = '⏳ Joining...';
    confirmBtn.disabled = true;
    
    try {
        // ✅ First, check if there's an existing waiting game
        console.log('🔍 Checking for existing games...');
        const gamesResponse = await fetch('/api/multiplayer/games');
        const gamesData = await gamesResponse.json();
        
        let existingGameId = null;
        if (gamesData.success && gamesData.games && gamesData.games.length > 0) {
            existingGameId = gamesData.games[0].id;
            console.log(`✅ Found existing game: ${existingGameId} with ${gamesData.games[0].players} players`);
        }
        
        // ✅ Join with existing game ID if available
        console.log('📡 Sending join request...');
        const data = await apiCall('/api/multiplayer/join', {
            method: 'POST',
            body: JSON.stringify({
                userId: USER_ID,
                boardCount: gameState.selectedBoards.size,
                boardNumbers: Array.from(gameState.selectedBoards),
                gameId: existingGameId  // Pass existing game ID if found
            })
        });
        
        console.log('📡 Join response:', data);
        
        if (data.success) {
            console.log('✅ Joined game:', data.gameId);
            console.log('👥 Players in game:', data.playerCount);
            console.log('⏰ Time left:', data.selectionTimeLeft, 'seconds');
            
            currentGameId = data.gameId;
            
            // Update balance
            gameState.currentPlayer.balance -= totalCost;
            updateBalanceDisplay();
            
            // Store boards
            gameState.currentPlayer.boards = data.boards.map(board => ({
                boardNumber: board.boardNumber,
                boardData: board.boardData,
                markedNumbers: new Set(board.markedNumbers || []),
                isWinner: false
            }));
            gameState.currentPlayer.isActive = true;
            
            closeRegistrationPopup();
            elements.gamePlaySection.style.display = 'block';
            displayBoards();
            
            // Show waiting screen with correct player count
            showWaitingScreen(data.playerCount, data.selectionTimeLeft || 25);
            
            // Start polling for game state
            startPolling(data.gameId);
            
        } else {
            console.error('Join failed:', data.error);
            alert('Failed to join: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Join error:', error);
        alert('Network error. Please try again.');
    } finally {
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
}

function startPolling(gameId) {
    if (gamePollInterval) clearInterval(gamePollInterval);
    
    gamePollInterval = setInterval(async () => {
        const data = await apiCall(`/api/multiplayer/state/${gameId}/${USER_ID}`);
        if (data.success) {
            updateGameState(data);
        } else if (data.error === 'Game not found' || data.error === 'Not in this game') {
            stopPolling();
        }
    }, 2000);
}

function stopPolling() {
    if (gamePollInterval) {
        clearInterval(gamePollInterval);
        gamePollInterval = null;
    }
}

function updateGameState(data) {
    const game = data.game;
    const player = data.player;
    
    // Update phase
    if (game.status !== gameState.gamePhase) {
        console.log(`Phase: ${gameState.gamePhase} → ${game.status}`);
        gameState.gamePhase = game.status;
        updateGameStatusDisplay();
        
        switch(game.status) {
            case 'shuffling':
                showShufflingScreen();
                break;
            case 'active':
                removeWaitingScreen();
                gameState.calledNumbers = game.calledNumbers || [];
                gameState.currentCall = game.currentCall;
                updateCalledNumbers();
                updateMainBoardColors();
                break;
            case 'completed':
                stopPolling();
                if (game.winners) showWinnerPopup(game);
                break;
        }
    }
    
    // Update called numbers
    if (game.status === 'active' && game.calledNumbers) {
        if (game.calledNumbers.length > gameState.calledNumbers.length) {
            gameState.calledNumbers = game.calledNumbers;
            gameState.currentCall = game.currentCall;
            updateCalledNumbers();
            updateMainBoardColors();
        }
    }
    
    // Update prize pool
    if (game.prizePool !== undefined) {
        gameState.totalPrizePool = game.prizePool;
        if (elements.prizeValue) elements.prizeValue.textContent = game.prizePool;
    }
    
    // Update player count
    if (game.players !== undefined && elements.playersValue) {
        elements.playersValue.textContent = game.players;
    }
}

function showWaitingScreen(playerCount, timeLeft) {
    if (!elements.currentBoard) return;
    elements.currentBoard.innerHTML = `
        <div class="waiting-screen">
            <div class="waiting-spinner">⏳</div>
            <h3>WAITING FOR PLAYERS</h3>
            <div class="player-count">👥 ${playerCount} players joined</div>
            <div class="countdown">⏰ Game starts in ${timeLeft}s</div>
            <div class="boards-summary">Boards: ${gameState.currentPlayer.boards.map(b => `#${b.boardNumber}`).join(', ')}</div>
            <div class="tip">💡 Share link to invite friends!</div>
        </div>
    `;
}

function showShufflingScreen() {
    if (!elements.currentBoard) return;
    elements.currentBoard.innerHTML = `
        <div class="shuffling-screen">
            <div class="shuffling-animation">🔄 🔄 🔄</div>
            <h3>SHUFFLING NUMBERS...</h3>
            <p>Game starts in 5 seconds!</p>
        </div>
    `;
}

function removeWaitingScreen() {
    const screens = document.querySelectorAll('.waiting-screen, .shuffling-screen');
    screens.forEach(s => s.remove());
}

function updateCalledNumbers() {
    const container = elements.calledNumbersList;
    if (!container) return;
    
    container.innerHTML = '';
    const recent = gameState.calledNumbers.slice(-8);
    
    recent.forEach(num => {
        let letter = '';
        if (num <= 15) letter = 'B';
        else if (num <= 30) letter = 'I';
        else if (num <= 45) letter = 'N';
        else if (num <= 60) letter = 'G';
        else letter = 'O';
        
        const el = document.createElement('div');
        el.className = 'called-chip';
        el.textContent = `${letter}${num}`;
        el.style.cssText = `background: #3498db; padding: 4px 8px; border-radius: 20px; font-size: 12px; color: white;`;
        container.appendChild(el);
    });
}

function updateMainBoardColors() {
    const cells = document.querySelectorAll('.bingo-cell');
    cells.forEach(cell => {
        const num = parseInt(cell.dataset.number);
        cell.classList.remove('current-called', 'previously-called');
        if (gameState.calledNumbers.includes(num)) {
            if (num === gameState.currentCall?.number) {
                cell.classList.add('current-called');
            } else {
                cell.classList.add('previously-called');
            }
        }
    });
}

function updateGameStatusDisplay() {
    if (!elements.gameStatus) return;
    const t = TRANSLATIONS[gameState.currentLanguage];
    const statusMap = {
        'waiting': t.waiting,
        'selecting': t.selecting,
        'shuffling': t.shuffling,
        'active': t.active,
        'completed': 'Game Over'
    };
    elements.gameStatus.textContent = statusMap[gameState.gamePhase] || t.waiting;
}

// ==================== BOARD DISPLAY ====================
function displayBoards() {
    const activeBoards = gameState.currentPlayer.boards.filter(b => !b.isWinner);
    if (activeBoards.length === 0) return;
    
    elements.boardsCarousel.innerHTML = '';
    activeBoards.forEach((board, idx) => {
        const tab = document.createElement('div');
        tab.className = `board-tab ${idx === gameState.currentBoardIndex ? 'active' : ''}`;
        tab.textContent = `Board #${board.boardNumber}`;
        tab.onclick = () => switchBoard(idx);
        elements.boardsCarousel.appendChild(tab);
    });
    
    displayBoard(gameState.currentBoardIndex);
}

function switchBoard(index) {
    gameState.currentBoardIndex = index;
    document.querySelectorAll('.board-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    displayBoard(index);
}

function displayBoard(index) {
    const board = gameState.currentPlayer.boards[index];
    if (!board || !elements.currentBoard) return;
    
    const marked = board.markedNumbers;
    const table = document.createElement('table');
    table.className = 'bingo-table';
    
    const header = document.createElement('tr');
    ['B', 'I', 'N', 'G', 'O'].forEach(l => {
        const th = document.createElement('th');
        th.textContent = l;
        header.appendChild(th);
    });
    table.appendChild(header);
    
    for (let row = 0; row < 5; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < 5; col++) {
            const td = document.createElement('td');
            const val = board.boardData[row][col];
            td.textContent = val;
            if (val === 'FREE') {
                td.classList.add('free-space');
            } else if (marked.has(val)) {
                td.classList.add('marked');
            }
            td.onclick = () => markNumber(val);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    
    elements.currentBoard.innerHTML = '';
    elements.currentBoard.appendChild(table);
    
    const claimBtn = document.createElement('button');
    claimBtn.className = 'bingo-btn';
    claimBtn.textContent = TRANSLATIONS[gameState.currentLanguage].claimBingo;
    claimBtn.onclick = claimBingo;
    elements.currentBoard.appendChild(claimBtn);
}

function markNumber(number) {
    if (gameState.gamePhase !== 'active') {
        alert('Game not active yet!');
        return;
    }
    if (!gameState.calledNumbers.includes(number)) {
        alert('Number not called yet!');
        return;
    }
    
    const board = gameState.currentPlayer.boards[gameState.currentBoardIndex];
    if (board.markedNumbers.has(number)) {
        board.markedNumbers.delete(number);
    } else {
        board.markedNumbers.add(number);
    }
    displayBoard(gameState.currentBoardIndex);
}

async function claimBingo() {
    if (!currentGameId || gameState.gamePhase !== 'active') {
        alert('Cannot claim BINGO now');
        return;
    }
    
    const data = await apiCall('/api/multiplayer/claim', {
        method: 'POST',
        body: JSON.stringify({
            gameId: currentGameId,
            userId: USER_ID,
            boardId: gameState.currentPlayer.boards[gameState.currentBoardIndex]?.boardId
        })
    });
    
    if (data.success) {
        alert(`🎉 BINGO! You won ${data.prize} ETB!`);
        await loadBalance();
    } else {
        alert('No BINGO pattern found!');
    }
}

function showWinnerPopup(game) {
    const winners = game.winners || [];
    const prize = game.prizePerWinner || 0;
    const isMe = winners.some(w => w.userId == USER_ID);
    
    let msg = isMe ? `🎉 YOU WON ${prize} ETB! 🎉` : `🏆 Winner: ${winners[0]?.username || 'Someone'} won ${prize} ETB!`;
    alert(msg);
    setTimeout(() => location.reload(), 5000);
}

// ==================== REGISTRATION POPUP ====================
function openRegistrationPopup() {
    const popup = elements.registrationPopup;
    if (!popup) return;
    popup.style.display = 'flex';
    generateBoardOptions();
    updateSelectionInfo();
    startTimer();
}

function closeRegistrationPopup() {
    if (elements.registrationPopup) elements.registrationPopup.style.display = 'none';
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
}

function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.selectionTimer = CONFIG.SELECTION_TIME;
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.selectionTimer--;
        updateTimerDisplay();
        if (gameState.selectionTimer <= 0) {
            clearInterval(gameState.timerInterval);
            closeRegistrationPopup();
        }
    }, 1000);
}

function updateTimerDisplay() {
    if (elements.selectionTimer) {
        elements.selectionTimer.textContent = `${gameState.selectionTimer} seconds`;
        elements.selectionTimer.style.color = gameState.selectionTimer <= 10 ? '#e74c3c' : '';
    }
}

function generateBoardOptions() {
    const grid = elements.boardsGrid;
    if (!grid) return;
    grid.innerHTML = '';
    
    gameState.availableBoards.slice(0, 100).forEach(num => {
        const div = document.createElement('div');
        div.className = 'board-option';
        div.textContent = num;
        div.onclick = () => toggleBoard(num, div);
        grid.appendChild(div);
    });
}

function toggleBoard(num, element) {
    if (gameState.selectedBoards.has(num)) {
        gameState.selectedBoards.delete(num);
        element.classList.remove('selected');
    } else if (gameState.selectedBoards.size < CONFIG.MAX_BOARDS_PER_PLAYER) {
        gameState.selectedBoards.add(num);
        element.classList.add('selected');
    } else {
        alert('Maximum 3 boards allowed');
    }
    updateSelectionInfo();
}

function updateSelectionInfo() {
    const count = gameState.selectedBoards.size;
    const cost = count * CONFIG.BET_AMOUNT;
    if (elements.selectedCount) elements.selectedCount.textContent = count;
    if (elements.totalCost) elements.totalCost.textContent = cost;
    
    const hasBalance = cost <= gameState.currentPlayer.balance;
    if (elements.confirmSelection) {
        elements.confirmSelection.disabled = count === 0 || !hasBalance;
    }
}

// ==================== GAME CYCLE ====================
async function startGameCycle() {
    gameState.gamePhase = 'waiting';
    updateGameStatusDisplay();
    
    // Check for active games
    const data = await apiCall('/api/multiplayer/games');
    if (data.success && data.games?.length > 0) {
        const game = data.games.find(g => g.status === 'waiting');
        if (game) {
            currentGameId = game.id;
            openRegistrationPopup();
            return;
        }
    }
    openRegistrationPopup();
}

// ==================== INITIALIZATION ====================
function initializeTelegram() {
    if (window.Telegram?.WebApp) {
        const tg = Telegram.WebApp;
        tg.expand();
        tg.enableClosingConfirmation();
        tg.BackButton.onClick(() => tg.close());
        tg.BackButton.show();
        console.log('✅ Telegram WebApp initialized');
        return true;
    }
    return false;
}

async function initializeApp() {
    initializeTelegram();
    await loadBalance();
    createMainBingoBoard();
    
    // Setup event listeners
    if (elements.confirmSelection) {
        elements.confirmSelection.onclick = joinGame;
    }
    
    updateGameStatusDisplay();
    
    // Start game cycle
    if (window.Telegram?.WebApp) {
        Telegram.WebApp.MainButton.setText(`🎮 PLAY BINGO (${gameState.currentPlayer.balance} ETB)`);
        Telegram.WebApp.MainButton.onClick(() => {
            Telegram.WebApp.MainButton.hide();
            startGameCycle();
        });
        Telegram.WebApp.MainButton.show();
    } else {
        setTimeout(startGameCycle, 1000);
    }
    
    console.log('🎮 ShebaBingo Ready!');
}

function t(key) {
    return TRANSLATIONS[gameState.currentLanguage][key] || TRANSLATIONS.en[key] || key;
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);
window.closeRegistrationPopup = closeRegistrationPopup;
