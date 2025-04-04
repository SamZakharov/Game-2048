import { game } from './game.js';

export function setupInput() {
    document.addEventListener('keyup', (event) => {
        switch(event.key) {
            case 'ArrowLeft':
                game.move('left');
                break;
            case 'ArrowRight':
                game.move('right');
                break;
            case 'ArrowUp':
                game.move('up');
                break;
            case 'ArrowDown':
                game.move('down');
                break;
        }

        game.checkGameOver();
        if (game.isGameOver) {
            alert('Game Over!');
        }
    });

    setupTouchControls();

    document.getElementById('restart-button').addEventListener('click', () => {
        game.resetGame();
    });
}

function setupTouchControls() {
    const gameField = document.querySelector('#game-field');
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    gameField.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
    }, {passive: true});

    gameField.addEventListener('touchend', (event) => {
        touchEndX = event.changedTouches[0].screenX;
        touchEndY = event.changedTouches[0].screenY;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;


        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 50) {
                game.move('right');
            } else if (dx < -50) {
                game.move('left');
            }
        } else {
            if (dy > 50) {
                game.move('down');
            } else if (dy < -50) {
                game.move('up');
            }
        }

        game.checkGameOver();
        if (game.isGameOver) {
            alert('Game Over!');
        }
    }
}