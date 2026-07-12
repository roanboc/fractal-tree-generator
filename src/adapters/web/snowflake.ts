// Entry point for the snowflake page (chapter 4): a simpler generator that
// grows a six-fold dendrite crystal on the turtle engine.

import { composeSnowflakeServices } from '../../composition/WebComposition';
import { SNOWFLAKE_DEFAULTS } from '../../core/application/SnowflakeService';
import { initChrome } from './chrome';
import { createSerialRunner } from './serialRunner';
import { createSnowflakeControls, SnowflakeControls } from './SnowflakeControls';
import { getCanvasBackground } from './theme';

function init(): void {
  initChrome();

  const canvas = document.getElementById('snowflakeCanvas') as HTMLCanvasElement | null;
  const controlsHost = document.getElementById('controls');
  if (!canvas || !controlsHost) return;

  // The renderer reads backgroundColor on every generate, so mutating this
  // shared object on theme change is enough to repaint with the new theme.
  const canvasConfig = { width: 880, height: 640, backgroundColor: getCanvasBackground() };

  const { snowflakeService, rendererService, speedControlService } = composeSnowflakeServices(
    canvas,
    canvasConfig
  );

  // `generate` and the panel reference each other; the runner only fires
  // after the panel below is created.
  const generate = createSerialRunner(async () => {
    const params = controls.getParams();
    speedControlService.setDelay(params.animationSpeed ?? 0);
    await snowflakeService.generate(params);
  });

  const controls: SnowflakeControls = createSnowflakeControls(
    controlsHost,
    {
      onGenerate: () => void generate(),
      onChange: () => void generate(),
      onClear: () => snowflakeService.clear(),
      onDownload: () => rendererService.save('').catch(console.error),
    },
    SNOWFLAKE_DEFAULTS
  );

  window.addEventListener('ftree:themechange', () => {
    canvasConfig.backgroundColor = getCanvasBackground();
    void generate();
  });

  window.addEventListener('ftree:langchange', () => {
    controls.rerender();
  });

  // Greet the visitor with a crystal instead of an empty canvas.
  void generate();
}

window.addEventListener('DOMContentLoaded', init);
