// Web entry point — fixed all 5 original bugs:
//   1. Imports drawFractalTree (was drawFractal — name mismatch)
//   2. Imports initializeControls + getUserInput (both now exported from UiModule)
//   3. Controller now calls drawFractalTree with correct params (not single state object)
//   4. Canvas context is set up via setupCanvas, not at module load time
//   5. animationSpeed is wired through to the tree drawing call

import { setupCanvas } from './modules/CanvasModule';
import { initializeControls } from './modules/UiModule';
import { startFractalGeneration, clearFractal } from './modules/ControllerModule';

function init(): void {
  const canvas = document.getElementById('fractalCanvas') as HTMLCanvasElement;
  setupCanvas(canvas);
  initializeControls();

  document.getElementById('generateButton')?.addEventListener('click', () => {
    startFractalGeneration();
  });

  document.getElementById('clearButton')?.addEventListener('click', () => {
    clearFractal();
  });
}

window.onload = init;
