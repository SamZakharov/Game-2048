import { game } from './game.js';
import { setupInput } from './input.js';

window.onload = () => {
    game.start();
    setupInput();
};