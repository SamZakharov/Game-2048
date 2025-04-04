class Board {
    constructor() {
        this.fieldElement = document.querySelector('#game-field');
        this.cellStyles = 'cell';
        this.matrix = new Array(4).fill(null).map(() => new Array(4).fill(0));
    }

    draw() {
        this.fieldElement.innerHTML = '';
        this.matrix.flat().forEach(item => {
            const div = document.createElement('div');
            div.innerText = item === 0 ? '' : item;
            div.className = this.cellStyles;

            if (item >= 2) {
                div.classList.add(`cell-${item}`);
            }

            this.fieldElement.append(div);
        });
    }

    hasEmptyCells() {
        return this.matrix.flat().some(item => item === 0);
    }

    getEmptyCells() {
        const emptyCells = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.matrix[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        return emptyCells;
    }

    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) return false;

        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.matrix[row][col] = Math.random() >= 0.7 ? 4 : 2;
        return true;
    }

    reset() {
        this.matrix = new Array(4).fill(null).map(() => new Array(4).fill(0));
    }
}

export const board = new Board();