import { setupCanvas, clearCanvas, drawFractal } from './modules/canvas.js';
import { initializeControls, getUserInput } from './modules/ui.js';
import { startFractalGeneration, clearFractal } from './modules/controller.js';

const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');

function init() {
    setupCanvas(canvas);
    initializeControls();
    
    document.getElementById('generateButton').addEventListener('click', () => {
        const userInput = getUserInput();
        startFractalGeneration(ctx, userInput);
    });

    document.getElementById('clearButton').addEventListener('click', () => {
        clearCanvas(ctx);
        clearFractal();
    });
}

window.onload = init;