import { board } from './board.js';

class Game {
    constructor() {
        this.score = 0;
        this.isGameOver = false;
        try {
            this.bestScore = localStorage.getItem('bestScore') || 0;
        } catch (e) {
            this.bestScore = 0;
        }
        this.achievements = {
            256: "Отличный результат! Вы достигли 256!",
            512: "Потрясающе! Вы собрали 512!",
            1024: "Невероятно! Цель 1024 достигнута!",
            2048: "Вы мастер 2048! Поздравляем с победой!"
        };
        this.maxAchievementShown = 0;
    }

    checkAchievements() {
        const currentMax = Math.max(...board.matrix.flat());

        if (currentMax > this.maxAchievementShown && this.achievements[currentMax]) {
            this.showAchievement(this.achievements[currentMax]);
            this.maxAchievementShown = currentMax;
        }
    }

    showAchievement(message) {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement-notification';
        achievementElement.innerHTML = `
        <div class="achievement-content">
            <svg class="achievement-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z"/>
            </svg>
            <span class="achievement-text">${message}</span>
        </div>
    `;

        document.body.appendChild(achievementElement);

        setTimeout(() => {
            achievementElement.classList.add('show');
        }, 10);

        setTimeout(() => {
            achievementElement.classList.remove('show');
            achievementElement.addEventListener('transitionend', () => {
                achievementElement.remove();
            }, { once: true });
        }, 3000);
    }

    updateScoreDisplay() {
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('best-score').textContent = this.bestScore;
    }

    start() {
        const requiredElements = [
            'current-score', 'best-score',
            'score-value', 'best-score-value',
            'game-overlay'
        ];

        if (requiredElements.some(id => !document.getElementById(id))) {
            console.error('Missing required DOM elements');
            return;
        }

        board.reset();
        this.score = 0;
        this.isGameOver = false;
        this.updateScoreDisplay();
        board.addRandomTile();
        board.addRandomTile();
        board.draw();
    }

    move(direction) {
        if (this.isGameOver) return false;

        const oldMatrix = JSON.stringify(board.matrix);

        switch(direction) {
            case 'left': this.moveLeft(); break;
            case 'right': this.moveRight(); break;
            case 'up': this.moveUp(); break;
            case 'down': this.moveDown(); break;
        }

        const newMatrix = JSON.stringify(board.matrix);
        if (oldMatrix !== newMatrix) {
            board.addRandomTile();
            board.draw();
            return true;
        }
        return false;
    }

    processRow(row, reverse = false) {
        let filteredRow = reverse ? [...row].filter(cell => cell > 0).reverse() : row.filter(cell => cell > 0);
        let mergedRow = [];
        let scoreAdded = 0;

        for (let i = 0; i < filteredRow.length; i++) {
            if (filteredRow[i] === filteredRow[i + 1]) {
                const newValue = filteredRow[i] * 2;
                mergedRow.push(newValue);
                scoreAdded += newValue;
                i++;
            } else {
                mergedRow.push(filteredRow[i]);
            }
        }

        while (mergedRow.length < 4) {
            mergedRow.push(0);
        }

        return {
            row: reverse ? mergedRow.reverse() : mergedRow,
            score: scoreAdded
        };
    }

    moveLeft() {
        let scoreAdded = 0;

        board.matrix = board.matrix.map(originalRow => {
            const { row, score } = this.processRow(originalRow);
            scoreAdded += score;
            return row;
        });

        this.score += scoreAdded;
        this.updateScoreDisplay();
        this.checkAchievements();
    }

    moveRight() {
        let scoreAdded = 0;

        board.matrix = board.matrix.map(originalRow => {
            const { row, score } = this.processRow(originalRow, true);
            scoreAdded += score;
            return row;
        });

        this.score += scoreAdded;
        this.updateScoreDisplay();
        this.checkAchievements();
    }

    moveUp() {
        this.transposeMatrix();
        this.moveLeft();
        this.transposeMatrix();
    }

    moveDown() {
        this.transposeMatrix();
        this.moveRight();
        this.transposeMatrix();
    }

    transposeMatrix() {
        const transposed = new Array(4).fill(null).map(() => new Array(4).fill(0));

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                transposed[col][row] = board.matrix[row][col];
            }
        }

        board.matrix = transposed;
    }

    checkGameOver() {
        if (board.hasEmptyCells()) return false;

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = board.matrix[row][col];
                if (col < 3 && current === board.matrix[row][col + 1]) return false;
                if (row < 3 && current === board.matrix[row + 1][col]) return false;
            }
        }

        if (typeof this.showGameOver === 'function') {
            this.showGameOver();
            return true;
        }
        return false;
    }

    showGameOver() {
        this.isGameOver = true;

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            try {
                localStorage.setItem('bestScore', this.bestScore);
            } catch (e) {
                console.error('Failed to save score:', e);
            }
            this.showConfetti();
        }

        const scoreElement = document.getElementById('score-value');
        const bestScoreElement = document.getElementById('best-score-value');
        const overlay = document.getElementById('game-overlay');

        if (scoreElement) scoreElement.textContent = this.score;
        if (bestScoreElement) bestScoreElement.textContent = this.bestScore;
        if (overlay) overlay.classList.remove('hidden');
    }

    resetGame() {
        this.score = 0;
        this.isGameOver = false;
        document.getElementById('game-overlay').classList.add('hidden');
        this.start();
    }

    showConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.zIndex = '1000';
            document.body.appendChild(confetti);


            const animation = confetti.animate(
                [
                    { top: '-10px', opacity: 1 },
                    { top: '100vh', opacity: 0 }
                ],
                {
                    duration: 2000 + Math.random() * 3000,
                    easing: 'cubic-bezier(0.1, 0.8, 0.9, 1)'
                }
            );

            animation.onfinish = () => confetti.remove();
        }
    }
}

export const game = new Game();