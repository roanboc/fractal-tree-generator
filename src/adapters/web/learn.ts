// Entry point for the didactic "How fractals work" page. Every canvas on the
// page is rendered by the same core FractalService as the main generator —
// each demo just composes its own small service graph and stops the rule at a
// different iteration count.

import { composeWebServices, WebServices } from '../../composition/WebComposition';
import { FractalParams } from '../../core/domain/types';

const BACKGROUND = '#0b1020';
const PALETTE = { trunk: '#a86a33', leaf: '#34d399', accent: '#fbbf24' };

const BASE_PARAMS: Partial<FractalParams> = {
  angle: 26,
  lengthFactor: 0.7,
  randomness: 0,
  animationSpeed: 0,
  colors: PALETTE,
};

interface TreeDemo {
  generate(params: Partial<FractalParams>): Promise<void>;
  services: WebServices;
}

function composeDemo(canvasId: string): TreeDemo | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return null;

  const services = composeWebServices(canvas, {
    width: canvas.width,
    height: canvas.height,
    backgroundColor: BACKGROUND,
  });

  // Serialize generate() calls: FractalService instances are not safe for
  // overlapping runs (see docs/CONTRACTS.md).
  let busy = false;
  let queued: Partial<FractalParams> | null = null;

  const generate = async (params: Partial<FractalParams>): Promise<void> => {
    if (busy) {
      queued = params;
      return;
    }
    busy = true;
    try {
      let next: Partial<FractalParams> | null = params;
      while (next) {
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

  return { generate, services };
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
  const display = document.getElementById('playground-depth-display');
  const count = document.getElementById('playground-count');
  const rounds = document.getElementById('playground-rounds');
  const animate = document.getElementById('playground-animate') as HTMLInputElement | null;
  const growBtn = document.getElementById('playground-grow');
  if (!demo || !slider) return;

  const currentDepth = () => parseInt(slider.value, 10);

  const updateLabels = () => {
    const depth = currentDepth();
    if (display) display.textContent = String(depth);
    if (rounds) rounds.textContent = String(depth);
    if (count) count.textContent = (Math.pow(2, depth) - 1).toLocaleString();
  };

  const grow = () =>
    demo.generate({
      depth: currentDepth(),
      trunkLength: 100,
      lineWidth: 8,
      animationSpeed: animate?.checked ? 14 : 0,
    });

  slider.addEventListener('input', updateLabels);
  slider.addEventListener('change', grow);
  growBtn?.addEventListener('click', grow);

  updateLabels();
  void grow();
}

function initRandomnessDemo(): void {
  const tidy = composeDemo('tidy-tree');
  const wild = composeDemo('wild-tree');
  if (!tidy || !wild) return;

  const growBoth = () => {
    void tidy.generate({ depth: 7, trunkLength: 62, lineWidth: 5, randomness: 0 });
    void wild.generate({ depth: 7, trunkLength: 62, lineWidth: 5, randomness: 0.5 });
  };

  document.getElementById('regrow')?.addEventListener('click', growBoth);
  growBoth();
}

window.addEventListener('DOMContentLoaded', () => {
  initStepCards();
  initPlayground();
  initRandomnessDemo();
});
