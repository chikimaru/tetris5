class Tetris {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');

        // Audio context for sound effects
        this.audioContext = null;
        this.initAudio();

        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;

        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.gameRunning = false;
        this.gamePaused = false;

        this.colors = [
            '#000000', // empty
            '#FF0000', // I
            '#00FF00', // O
            '#0000FF', // T
            '#FFFF00', // S
            '#FF00FF', // Z
            '#00FFFF', // J
            '#FFA500'  // L
        ];

        this.tetrominoes = [
            { // I
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: 1
            },
            { // O
                shape: [
                    [2, 2],
                    [2, 2]
                ],
                color: 2
            },
            { // T
                shape: [
                    [0, 3, 0],
                    [3, 3, 3],
                    [0, 0, 0]
                ],
                color: 3
            },
            { // S
                shape: [
                    [0, 4, 4],
                    [4, 4, 0],
                    [0, 0, 0]
                ],
                color: 4
            },
            { // Z
                shape: [
                    [5, 5, 0],
                    [0, 5, 5],
                    [0, 0, 0]
                ],
                color: 5
            },
            { // J
                shape: [
                    [6, 0, 0],
                    [6, 6, 6],
                    [0, 0, 0]
                ],
                color: 6
            },
            { // L
                shape: [
                    [0, 0, 7],
                    [7, 7, 7],
                    [0, 0, 0]
                ],
                color: 7
            }
        ];

        this.initBoard();
        this.initEvents();
        this.generateNewPiece();
        this.generateNewPiece();
        this.updateDisplay();
    }

    initBoard() {
        this.board = [];
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.board[y][x] = 0;
            }
        }
    }

    initEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    generateNewPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.createPiece();
        }

        this.currentPiece = this.nextPiece;
        this.currentPiece.x = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentPiece.y = 0;

        this.nextPiece = this.createPiece();
        this.drawNextPiece();

        if (this.isCollision()) {
            this.gameOver();
        }
    }

    createPiece() {
        const template = this.tetrominoes[Math.floor(Math.random() * this.tetrominoes.length)];
        return {
            shape: template.shape.map(row => [...row]),
            color: template.color,
            x: 0,
            y: 0
        };
    }

    isCollision(piece = this.currentPiece, dx = 0, dy = 0) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;

                    if (newX < 0 || newX >= this.BOARD_WIDTH ||
                        newY >= this.BOARD_HEIGHT ||
                        (newY >= 0 && this.board[newY][newX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] !== 0) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }

        this.clearLines();
        this.generateNewPiece();
    }

    clearLines() {
        let completedLines = [];

        // Find completed lines
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                completedLines.push(y);
            }
        }

        if (completedLines.length > 0) {
            // Play line clear sound based on number of lines
            this.playLineClearSound(completedLines.length);

            // Show line clear animation
            this.showLineClearAnimation(completedLines);

            // Remove completed lines after animation
            setTimeout(() => {
                // Clear animation board
                this.animationBoard = null;

                // Remove completed lines in descending order to avoid index issues
                for (let i = completedLines.length - 1; i >= 0; i--) {
                    this.board.splice(completedLines[i], 1);
                    this.board.unshift(new Array(this.BOARD_WIDTH).fill(0));
                }

                this.lines += completedLines.length;
                const oldScore = this.score;
                this.score += [0, 40, 100, 300, 1200][completedLines.length] * this.level;
                this.level = Math.floor(this.lines / 10) + 1;
                this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);

                this.updateDisplay();
                this.showScoreIncrease();
                this.draw();
            }, 600); // Wait for animation to complete
        }
    }

    showLineClearAnimation(lines) {
        // Create a copy of the board for animation
        this.animationBoard = this.board.map(row => [...row]);

        // Flash effect for cleared lines - make them white
        for (let y of lines) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.animationBoard[y][x] = -1; // Special value for white animation
            }
        }

        // Draw the initial white flash
        this.drawWithAnimation();

        // Create multiple flash frames for better visibility
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            flashCount++;
            if (flashCount % 2 === 0) {
                // Even frames: show white
                for (let y of lines) {
                    for (let x = 0; x < this.BOARD_WIDTH; x++) {
                        this.animationBoard[y][x] = -1;
                    }
                }
            } else {
                // Odd frames: show original colors
                for (let y of lines) {
                    for (let x = 0; x < this.BOARD_WIDTH; x++) {
                        this.animationBoard[y][x] = this.board[y][x];
                    }
                }
            }
            this.drawWithAnimation();

            // Stop flashing after 6 frames (3 flashes)
            if (flashCount >= 6) {
                clearInterval(flashInterval);
            }
        }, 100); // Flash every 100ms

        // Create particles effect (visual enhancement)
        this.createLineClearParticles(lines);
    }

    createLineClearParticles(lines) {
        const canvas = this.canvas;
        canvas.classList.add('line-clear');
        setTimeout(() => {
            canvas.classList.remove('line-clear');
        }, 600);
    }

    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;

        if (this.isCollision()) {
            // try wall kicks
            const kicks = [[-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0]];
            let kicked = false;

            for (const [dx, dy] of kicks) {
                if (!this.isCollision(this.currentPiece, dx, dy)) {
                    this.currentPiece.x += dx;
                    this.currentPiece.y += dy;
                    kicked = true;
                    break;
                }
            }

            if (!kicked) {
                this.currentPiece.shape = originalShape;
                return false; // rotation failed
            }
        }
        return true; // rotation successful
    }

    rotateMatrix(matrix) {
        const n = matrix.length;
        const rotated = [];
        for (let i = 0; i < n; i++) {
            rotated[i] = [];
            for (let j = 0; j < n; j++) {
                rotated[i][j] = matrix[n - 1 - j][i];
            }
        }
        return rotated;
    }

    movePiece(dx, dy) {
        if (!this.isCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }

    hardDrop() {
        while (this.movePiece(0, 1)) {
            this.score += 2;
        }
        this.placePiece();
        this.updateDisplay();
    }

    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;

        let validMove = false;
        let oldScore = this.score;

        switch (e.code) {
            case 'ArrowLeft':
                validMove = this.movePiece(-1, 0);
                if (validMove) this.playMoveSound();
                break;
            case 'ArrowRight':
                validMove = this.movePiece(1, 0);
                if (validMove) this.playMoveSound();
                break;
            case 'ArrowDown':
                validMove = this.movePiece(0, 1);
                if (validMove) {
                    this.score += 1;
                    this.playMoveSound();
                    this.updateDisplay();
                }
                break;
            case 'ArrowUp':
                validMove = this.rotatePiece();
                if (validMove) this.playRotateSound();
                break;
            case 'Space':
                e.preventDefault();
                this.hardDrop();
                this.playDropSound();
                validMove = true;
                break;
            case 'KeyP':
                this.pauseGame();
                validMove = true;
                break;
        }

        // Invalid moves no longer show visual feedback

        // Show score increase animation
        if (this.score > oldScore) {
            this.showScoreIncrease();
        }

        this.draw();
    }

    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameLoop();
        }
    }

    pauseGame() {
        this.gamePaused = !this.gamePaused;
    }

    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.initBoard();
        this.generateNewPiece();
        this.generateNewPiece();
        this.updateDisplay();
        this.draw();
    }

    gameOver() {
        this.gameRunning = false;
        this.playGameOverSound();
        this.showGameOverModal();
    }

    showGameOverModal() {
        // Remove existing overlay if any
        const existingOverlay = document.querySelector('.game-over-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';

        const modal = document.createElement('div');
        modal.className = 'game-over-modal';

        modal.innerHTML = `
            <h2>GAME OVER</h2>
            <p><strong>最終スコア: ${this.score.toLocaleString()}</strong></p>
            <p>レベル: ${this.level}</p>
            <p>消去ライン: ${this.lines}</p>
            <button onclick="game.restartGame(); document.querySelector('.game-over-overlay').remove();">
                もう一度プレイ
            </button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }



    showScoreIncrease() {
        const scoreElement = document.getElementById('score');
        scoreElement.classList.add('score-flash');
        setTimeout(() => {
            scoreElement.classList.remove('score-flash');
        }, 400);
    }

    gameLoop() {
        if (!this.gameRunning) return;

        if (!this.gamePaused) {
            this.update();
            this.draw();
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        const now = Date.now();
        const deltaTime = now - this.dropTime;

        if (deltaTime > this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
                this.updateDisplay();
            }
            this.dropTime = now;
        }
    }

    draw() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBlock(x, y, this.colors[this.board[y][x]]);
                }
            }
        }

        // Draw current piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x] !== 0) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.colors[this.currentPiece.color]
                        );
                    }
                }
            }
        }

        // Draw grid
        this.drawGrid();
    }

    drawWithAnimation() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board with animation
        const boardToUse = this.animationBoard || this.board;
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (boardToUse[y][x] !== 0) {
                    if (boardToUse[y][x] === -1) {
                        // Special bright white animation color for line clear
                        this.drawFlashBlock(x, y);
                    } else {
                        this.drawBlock(x, y, this.colors[boardToUse[y][x]]);
                    }
                }
            }
        }

        // Draw current piece (if not in animation mode)
        if (!this.animationBoard && this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x] !== 0) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.colors[this.currentPiece.color]
                        );
                    }
                }
            }
        }

        // Draw grid
        this.drawGrid();
    }

    drawBlock(x, y, color) {
        const pixelX = x * this.BLOCK_SIZE;
        const pixelY = y * this.BLOCK_SIZE;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX, pixelY, this.BLOCK_SIZE, this.BLOCK_SIZE);

        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX, pixelY, this.BLOCK_SIZE, this.BLOCK_SIZE);
    }

    drawFlashBlock(x, y) {
        const pixelX = x * this.BLOCK_SIZE;
        const pixelY = y * this.BLOCK_SIZE;

        // Bright white with glow effect
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(pixelX, pixelY, this.BLOCK_SIZE, this.BLOCK_SIZE);

        // Add glowing border
        this.ctx.strokeStyle = '#FFFF00'; // Yellow border for extra visibility
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(pixelX, pixelY, this.BLOCK_SIZE, this.BLOCK_SIZE);

        // Add inner glow effect
        this.ctx.shadowColor = '#FFFFFF';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(pixelX + 2, pixelY + 2, this.BLOCK_SIZE - 4, this.BLOCK_SIZE - 4);
        this.ctx.shadowBlur = 0; // Reset shadow
    }

    drawGrid() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(x * this.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, y * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
    }

    drawNextPiece() {
        this.nextCtx.fillStyle = '#000000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        if (this.nextPiece) {
            const blockSize = 20;
            const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;

            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x] !== 0) {
                        this.nextCtx.fillStyle = this.colors[this.nextPiece.color];
                        this.nextCtx.fillRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            blockSize
                        );

                        this.nextCtx.strokeStyle = '#FFFFFF';
                        this.nextCtx.lineWidth = 1;
                        this.nextCtx.strokeRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            blockSize
                        );
                    }
                }
            }
        }
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playMoveSound() {
        this.playSound(200, 0.1, 'square');
    }

    playRotateSound() {
        this.playSound(300, 0.1, 'triangle');
    }

    playDropSound() {
        this.playSound(150, 0.2, 'sawtooth');
    }

    playLineClearSound(linesCleared) {
        if (linesCleared === 1) {
            // Single line clear - simple ascending melody
            this.playSound(400, 0.1, 'sine');
            setTimeout(() => this.playSound(500, 0.1, 'sine'), 50);
            setTimeout(() => this.playSound(600, 0.2, 'sine'), 100);
        } else if (linesCleared === 2) {
            // Double line clear - more elaborate
            this.playDoubleLineClearSound();
        } else if (linesCleared === 3) {
            // Triple line clear - exciting
            this.playTripleLineClearSound();
        } else if (linesCleared === 4) {
            // TETRIS! - most epic
            this.playTetrisSound();
        }
    }

    playDoubleLineClearSound() {
        // Double ascending melody with harmony
        this.playSound(400, 0.15, 'sine');
        this.playSound(500, 0.15, 'triangle'); // Harmony
        setTimeout(() => {
            this.playSound(500, 0.15, 'sine');
            this.playSound(600, 0.15, 'triangle');
        }, 75);
        setTimeout(() => {
            this.playSound(600, 0.2, 'sine');
            this.playSound(750, 0.2, 'triangle');
        }, 150);
        setTimeout(() => {
            this.playSound(750, 0.25, 'sine');
        }, 300);
    }

    playTripleLineClearSound() {
        // Triple ascending melody with more instruments
        this.playSound(450, 0.15, 'sine');
        this.playSound(550, 0.15, 'triangle');
        this.playSound(350, 0.15, 'square'); // Bass
        setTimeout(() => {
            this.playSound(550, 0.15, 'sine');
            this.playSound(650, 0.15, 'triangle');
            this.playSound(400, 0.15, 'square');
        }, 80);
        setTimeout(() => {
            this.playSound(650, 0.2, 'sine');
            this.playSound(800, 0.2, 'triangle');
            this.playSound(500, 0.2, 'square');
        }, 160);
        setTimeout(() => {
            this.playSound(800, 0.25, 'sine');
            this.playSound(950, 0.25, 'triangle');
        }, 320);
        setTimeout(() => {
            this.playSound(950, 0.3, 'sine');
        }, 500);
    }

    playTetrisSound() {
        // EPIC TETRIS SOUND - Victory fanfare!
        // Main melody
        this.playSound(523, 0.2, 'sine'); // C5
        setTimeout(() => this.playSound(659, 0.2, 'sine'), 100); // E5
        setTimeout(() => this.playSound(784, 0.2, 'sine'), 200); // G5
        setTimeout(() => this.playSound(1047, 0.3, 'sine'), 300); // C6

        // Harmony
        setTimeout(() => this.playSound(392, 0.2, 'triangle'), 50); // G4
        setTimeout(() => this.playSound(494, 0.2, 'triangle'), 150); // B4
        setTimeout(() => this.playSound(659, 0.2, 'triangle'), 250); // E5
        setTimeout(() => this.playSound(784, 0.3, 'triangle'), 350); // G5

        // Bass line
        setTimeout(() => this.playSound(131, 0.3, 'square'), 0); // C3
        setTimeout(() => this.playSound(165, 0.3, 'square'), 200); // E3
        setTimeout(() => this.playSound(196, 0.4, 'square'), 400); // G3

        // Victory arpeggio
        setTimeout(() => {
            this.playSound(1047, 0.1, 'sine'); // C6
            setTimeout(() => this.playSound(1175, 0.1, 'sine'), 50); // D6
            setTimeout(() => this.playSound(1319, 0.1, 'sine'), 100); // E6
            setTimeout(() => this.playSound(1568, 0.2, 'sine'), 150); // G6
        }, 600);

        // Final chord
        setTimeout(() => {
            this.playSound(1047, 0.5, 'sine'); // C6
            this.playSound(659, 0.5, 'triangle'); // E5
            this.playSound(392, 0.5, 'square'); // G4
        }, 800);
    }

    playGameOverSound() {
        // Descending sad sound
        this.playSound(300, 0.3, 'triangle');
        setTimeout(() => this.playSound(250, 0.3, 'triangle'), 200);
        setTimeout(() => this.playSound(200, 0.5, 'triangle'), 400);
    }
}

// ゲーム初期化
const game = new Tetris();
game.draw();