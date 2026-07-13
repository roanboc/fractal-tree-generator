// Entry point for the 3D tree page (chapter 6): the chapter-3 branching
// rule grown in space on the WebGL renderer. No serial runner here — the
// scene is built synchronously and presented atomically, so overlapping
// generate calls cannot interleave (see the ITree3DService contract).

import { composeTree3DServices } from '../../composition/WebComposition';
import { TREE3D_DEFAULTS } from '../../core/application/Tree3DService';
import { initChrome } from './chrome';
import { createTree3DControls, Tree3DControls } from './Tree3DControls';
import { getCanvasBackground } from './theme';

function init(): void {
  initChrome();

  const canvas = document.getElementById('tree3dCanvas') as HTMLCanvasElement | null;
  const controlsHost = document.getElementById('controls');
  if (!canvas || !controlsHost) return;

  const canvasConfig = { width: 880, height: 640, backgroundColor: getCanvasBackground() };
  const { tree3dService, rendererService } = composeTree3DServices(canvas, canvasConfig);

  // The spin is on by default for the finale's wow — unless the visitor
  // asked the OS for reduced motion.
  const autoRotateDefault = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const generate = (): void => {
    canvasConfig.backgroundColor = getCanvasBackground();
    void tree3dService.generate(controls.getParams()).catch(console.error);
  };

  const controls: Tree3DControls = createTree3DControls(
    controlsHost,
    {
      onGenerate: generate,
      onChange: generate,
      onClear: () => tree3dService.clear(),
      onDownload: () => rendererService.save('').catch(console.error),
      onAutoRotate: (enabled) => rendererService.setAutoRotate(enabled),
    },
    TREE3D_DEFAULTS,
    autoRotateDefault
  );

  rendererService.setAutoRotate(autoRotateDefault);

  window.addEventListener('ftree:themechange', generate);
  window.addEventListener('ftree:langchange', () => controls.rerender());

  // Greet the visitor with a grown, slowly spinning tree.
  generate();
}

window.addEventListener('DOMContentLoaded', init);
