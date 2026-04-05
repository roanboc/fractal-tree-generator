// Web-layer controller adapter — orchestrates state and generation for the browser.
// Bugs fixed:
//   - Imports drawFractalTree (correct name) from CanvasModule
//   - Calls drawFractalTree with all required params (not a single state object)
//   - animationSpeed is now wired through to the rendering call

import { clearCanvas, drawFractalTree } from './CanvasModule';
import { getUserInput } from './UiModule';
import { FractalParams } from '../types/interfaces';
import { ConfigService } from '../services/ConfigService';

const configService = new ConfigService();
let state: FractalParams = configService.getDefaults();

export function startFractalGeneration(): void {
  const userInput = getUserInput();
  state = configService.validate(userInput);
  clearCanvas();
  drawFractalTree(
    window.innerWidth * 0.4,    // x: center of canvas
    window.innerHeight * 0.8,   // y: bottom of canvas
    state.trunkLength,
    Math.PI / 2,                // angle: pointing up
    state.depth,
    state.lengthFactor,
    state.angle,
    state.lineWidth,
    state.colors.trunk,
    state.colors.leaf,
    state.animationSpeed
  ).catch(console.error);
}

export function clearFractal(): void {
  clearCanvas();
}
