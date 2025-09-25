class Tetris {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');

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
        let linesCleared = 0;

        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(new Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // check the same line again
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += [0, 40, 100, 300, 1200][linesCleared] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            this.updateDisplay();
        }
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
            }
        }
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

        switch (e.code) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                if (this.movePiece(0, 1)) {
                    this.score += 1;
                    this.updateDisplay();
                }
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case 'Space':
                e.preventDefault();
                this.hardDrop();
                break;
            case 'KeyP':
                this.pauseGame();
                break;
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
        alert(`ゲームオーバー！\nスコア: ${this.score}\nレベル: ${this.level}\nライン: ${this.lines}`);
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

    drawBlock(x, y, color) {
        const pixelX = x * this.BLOCK_SIZE;
        const pixelY = y * this.BLOCK_SIZE;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX, pixelY, this.BLOCK_SIZE, this.BLOCK_SIZE);

        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX, pixelY, this.BLOCK_SIZE, this.BLOCK_SIZE);
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
}

// ゲーム初期化
const game = new Tetris();
game.draw();