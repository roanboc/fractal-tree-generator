import { setupCanvas, clearCanvas, drawFractal } from './canvas.js';
import { getUserInput } from './ui.js';

let state = {
    depth: 5,
    angle: 30,
    lengthFactor: 0.7,
    trunkLength: 100,
    lineWidth: 2,
    colors: {
        trunk: '#8B4513',
        leaf: '#228B22',
        accent: '#FF69B4',
    },
    randomness: 0,
    animationSpeed: 100,
    showAccent: false,
};

export function startFractalGeneration() {
    clearCanvas();
    const userInput = getUserInput();
    updateState(userInput);
    drawFractal(state);
}

export function clearFractal() {
    clearCanvas();
}

function updateState(userInput) {
    state.depth = userInput.depth;
    state.angle = userInput.angle;
    state.lengthFactor = userInput.lengthFactor;
    state.trunkLength = userInput.trunkLength;
    state.lineWidth = userInput.lineWidth;
    state.colors = userInput.colors;
    state.randomness = userInput.randomness;
    state.animationSpeed = userInput.animationSpeed;
    state.showAccent = userInput.showAccent;
}