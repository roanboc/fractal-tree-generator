// Entry point for the didactic "How fractals work" page. Every canvas on the
// page is rendered by the same core FractalService as the main generator —
// each demo just composes its own small service graph and stops the rule at a
// different iteration count.

import { composeWebServices, WebServices } from '../../composition/WebComposition';
import { CanvasConfig, FractalParamsInput } from '../../core/domain/types';
import { initChrome } from './chrome';
import { getCanvasBackground } from './theme';

const PALETTE = { trunk: '#a86a33', leaf: '#34d399', accent: '#fbbf24' };

// Demos teach the pure rule, so intervals are fixed values and wildness is 0
// unless a demo opts in.
const BASE_PARAMS: FractalParamsInput = {
  angle: 26,
  lengthFactor: 0.7,
  randomness: 0,
  animationSpeed: 0,
  strokeDuration: 0,
  colors: PALETTE,
};

interface TreeDemo {
  generate(params: FractalParamsInput): Promise<void>;
  /** Repaint with the last params, e.g. after a theme change. Instant. */
  redraw(): Promise<void>;
  services: WebServices;
}

const demos: TreeDemo[] = [];

function composeDemo(canvasId: string): TreeDemo | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return null;

  const config: CanvasConfig = {
    width: canvas.width,
    height: canvas.height,
    backgroundColor: getCanvasBackground(),
  };
  const services = composeWebServices(canvas, config);

  // Serialize generate() calls: FractalService instances are not safe for
  // overlapping runs (see docs/CONTRACTS.md).
  let busy = false;
  let queued: FractalParamsInput | null = null;
  let lastParams: FractalParamsInput | null = null;

  const generate = async (params: FractalParamsInput): Promise<void> => {
    lastParams = params;
    if (busy) {
      queued = params;
      return;
    }
    busy = true;
    try {
      let next: FractalParamsInput | null = params;
      while (next) {
        config.backgroundColor = getCanvasBackground();
        const validated = services.configService.validate({ ...BASE_PARAMS, ...next });
        services.speedControlService.setDelay(validated.animationSpeed);
        next = null;
        await services.fractalService.generate(validated);
        next = queued;
        queued = null;
      }
    } catch (err) {
      console.error(err);
    } finally {
      busy = false;
    }
  };

  const redraw = async (): Promise<void> => {
    if (!lastParams) return;
    await generate({ ...lastParams, animationSpeed: 0, strokeDuration: 0 });
  };

  const demo = { generate, redraw, services };
  demos.push(demo);
  return demo;
}

function initStepCards(): void {
  for (let depth = 1; depth <= 5; depth++) {
    const demo = composeDemo(`step-${depth}`);
    void demo?.generate({ depth, trunkLength: 52, lineWidth: 5 });
  }
}

function initPlayground(): void {
  const demo = composeDemo('playground');
  const slider = document.getElementById('playground-depth') as HTMLInputElement | null;
  const animate = document.getElementById('playground-animate') as HTMLInputElement | null;
  const growBtn = document.getElementById('playground-grow');
  if (!demo || !slider) return;

  const currentDepth = () => parseInt(slider.value, 10);

  // The count/rounds strongs are re-created on language switch, so always
  // look them up fresh instead of capturing references.
  const updateLabels = () => {
    const depth = currentDepth();
    const display = document.getElementById('playground-depth-display');
    if (display) display.textContent = String(depth);
    const rounds = document.getElementById('playground-rounds');
    if (rounds) rounds.textContent = String(depth);
    const count = document.getElementById('playground-count');
    if (count) count.textContent = (Math.pow(2, depth) - 1).toLocaleString();
  };

  const grow = () => {
    const depth = currentDepth();
    const stickCount = Math.pow(2, depth) - 1;
    // Hand-drawn pacing: budget the animation time across the sticks so
    // small trees draw slowly and big trees stay watchable.
    const slow = animate?.checked ?? false;
    const strokeDuration = slow ? Math.min(220, Math.max(18, Math.round(5000 / stickCount))) : 0;
    const animationSpeed = slow ? Math.min(70, Math.max(6, Math.round(2000 / stickCount))) : 0;

    return demo.generate({
      depth,
      trunkLength: 100,
      lineWidth: 8,
      animationSpeed,
      strokeDuration,
    });
  };

  slider.addEventListener('input', updateLabels);
  slider.addEventListener('change', () => void grow());
  growBtn?.addEventListener('click', () => void grow());
  window.addEventListener('ftree:langchange', updateLabels);

  updateLabels();
  void grow();
}

function initRandomnessDemo(): void {
  const tidy = composeDemo('tidy-tree');
  const wild = composeDemo('wild-tree');
  if (!tidy || !wild) return;

  const growBoth = () => {
    void tidy.generate({ depth: 7, trunkLength: 62, lineWidth: 5, randomness: 0 });
    void wild.generate({
      depth: { min: 6, max: 8 },
      angle: { min: 12, max: 40 },
      lengthFactor: { min: 0.58, max: 0.8 },
      trunkLength: 62,
      lineWidth: 5,
      randomness: 0.9,
    });
  };

  document.getElementById('regrow')?.addEventListener('click', growBoth);
  growBoth();
}

window.addEventListener('DOMContentLoaded', () => {
  initChrome();
  initStepCards();
  initPlayground();
  initRandomnessDemo();

  window.addEventListener('ftree:themechange', () => {
    for (const demo of demos) void demo.redraw();
  });
});
