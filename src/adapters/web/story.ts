// Entry point for the landing page (chapter 1: "Why is nature so
// beautiful?"). Its only dynamic piece is a live, math-drawn wild tree that
// hooks the visitor before any theory is introduced.

import { composeWebServices } from '../../composition/WebComposition';
import { CanvasConfig, FractalParamsInput } from '../../core/domain/types';
import { initChrome } from './chrome';
import { createSerialRunner } from './serialRunner';
import { getCanvasBackground } from './theme';

// A visibly organic tree: wide ranges, high wildness, hand-drawn strokes.
const WILD_TREE: FractalParamsInput = {
  depth: { min: 6, max: 9 },
  angle: { min: 14, max: 38 },
  lengthFactor: { min: 0.6, max: 0.78 },
  trunkLength: 92,
  lineWidth: 7,
  randomness: 0.8,
  strokeDuration: 24,
  colors: { trunk: '#a86a33', leaf: '#34d399', accent: '#fbbf24' },
};

function init(): void {
  initChrome();

  const canvas = document.getElementById('story-tree') as HTMLCanvasElement | null;
  if (!canvas) return;

  const config: CanvasConfig = {
    width: canvas.width,
    height: canvas.height,
    backgroundColor: getCanvasBackground(),
  };
  const { fractalService, configService } = composeWebServices(canvas, config);

  const run = createSerialRunner(async (params: FractalParamsInput) => {
    config.backgroundColor = getCanvasBackground();
    await fractalService.generate(configService.validate(params));
  });
  const grow = (params: FractalParamsInput = WILD_TREE): Promise<void> => run(params);

  document.getElementById('story-regrow')?.addEventListener('click', () => void grow());
  window.addEventListener('ftree:themechange', () => {
    // Repaint instantly with the new background; no need to re-animate.
    void grow({ ...WILD_TREE, strokeDuration: 0 });
  });

  void grow();
}

window.addEventListener('DOMContentLoaded', init);
