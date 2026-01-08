class MultiplayerBingo {
    constructor(userId) {
        this.userId = userId;
        this.gameId = null;
        this.gameState = null;
        this.playerState = null;
        this.pollInterval = null;
        this.updateInterval = 2000; // Poll every 2 seconds
    }
    
    async joinGame() {
        try {
            const response = await fetch('/api/game/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.userId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.gameId = data.gameId;
                this.startPolling();
                return data;
            } else {
                if (data.error === 'Insufficient balance') {
                    alert(`❌ Insufficient balance!\nRequired: ${data.required} ETB\nYour balance: ${data.current} ETB\n\nUse /deposit to add funds`);
                    return null;
                }
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Join game error:', error);
            return null;
        }
    }
    
    startPolling() {
        this.pollInterval = setInterval(() => {
            this.updateGameState();
        }, this.updateInterval);
    }
    
    async updateGameState() {
        if (!this.gameId) return;
        
        try {
            const response = await fetch(`/api/game/${this.gameId}/state/${this.userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.gameState = data.game;
                this.playerState = data.player;
                this.updateUI();
            }
        } catch (error) {
            console.error('Update game state error:', error);
        }
    }
    
    updateUI() {
        if (!this.gameState || !this.playerState) return;
        
        // Update game info
        document.getElementById('gameStatus').textContent = 
            this.gameState.status === 'waiting' ? '⏳ Waiting for players...' :
            this.gameState.status === 'active' ? '🎮 Game Active' : '🏁 Game Over';
        
        document.getElementById('playerCount').textContent = this.gameState.players;
        document.getElementById('prizePool').textContent = this.gameState.prizePool.toFixed(1);
        document.getElementById('currentCall').textContent = this.gameState.currentCall || 'Not started';
        
        // Update called numbers
        const calledList = document.getElementById('calledNumbers');
        calledList.innerHTML = this.gameState.calledNumbers
            .slice(-10)
            .map(num => `<div class="called-number">${num}</div>`)
            .join('');
        
        // Update player's board
        this.updateBoard();
        
        // Update timer if game is active
        if (this.gameState.status === 'active' && this.gameState.timeLeft > 0) {
            const minutes = Math.floor(this.gameState.timeLeft / 60000);
            const seconds = Math.floor((this.gameState.timeLeft % 60000) / 1000);
            document.getElementById('timeLeft').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateBoard() {
        if (!this.playerState.board) return;
        
        const board = this.playerState.board;
        const marked = this.playerState.markedNumbers;
        const called = this.gameState.calledNumbers;
        
        // Update board UI
        for (const col of ['B', 'I', 'N', 'G', 'O']) {
            for (let i = 0; i < 5; i++) {
                const cellId = `${col}${i}`;
                const cell = document.getElementById(cellId);
                if (cell) {
                    const number = board[col][i];
                    cell.textContent = number === 'FREE' ? '★' : number;
                    
                    // Mark if called
                    if (number === 'FREE' || called.includes(`${col}${number}`)) {
                        cell.classList.add('marked');
                    } else {
                        cell.classList.remove('marked');
                    }
                }
            }
        }
    }
    
    async claimBingo() {
        if (!this.gameId || !this.playerState.hasBingo) return;
        
        try {
            const response = await fetch('/api/game/claim-bingo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId: this.gameId,
                    userId: this.userId
                })
            });
            
            const data = await response.json();
            if (data.success) {
                alert(`🎉 BINGO Claimed! Prize: ${data.prize} ETB`);
            }
        } catch (error) {
            console.error('Claim bingo error:', error);
        }
    }
    
    leaveGame() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
        // Notify server player left
        fetch('/api/game/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameId: this.gameId,
                userId: this.userId
            })
        });
    }
}

// Initialize game
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user');

if (userId) {
    const bingoGame = new MultiplayerBingo(userId);
    window.bingoGame = bingoGame;
    
    // Auto-join on page load
    bingoGame.joinGame().then(data => {
        if (data) {
            console.log('Joined game:', data.gameId);
        }
    });
}