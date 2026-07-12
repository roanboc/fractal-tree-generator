import { composeWebServices } from '../../composition/WebComposition';
import { initializeControls, getUserInput, rerenderControls } from './ControlsView';
import { initChrome } from './chrome';
import { createSerialRunner } from './serialRunner';
import { getCanvasBackground } from './theme';

function init(): void {
  initChrome();

  const canvas = document.getElementById('fractalCanvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  // The renderer reads backgroundColor on every generate, so mutating this
  // shared object on theme change is enough to repaint with the new theme.
  const canvasConfig = { width: 880, height: 640, backgroundColor: getCanvasBackground() };

  const { fractalService, rendererService, configService, speedControlService } =
    composeWebServices(canvas, canvasConfig);

  const generate = createSerialRunner(async () => {
    const params = configService.validate(getUserInput());
    speedControlService.setDelay(params.animationSpeed);
    await fractalService.generate(params);
  });

  initializeControls(
    {
      onGenerate: generate,
      onChange: generate,
      onClear: () => fractalService.clear(),
      onDownload: () => rendererService.save('').catch(console.error),
    },
    configService.getDefaults()
  );

  window.addEventListener('ftree:themechange', () => {
    canvasConfig.backgroundColor = getCanvasBackground();
    void generate();
  });

  window.addEventListener('ftree:langchange', () => {
    rerenderControls();
  });

  // Greet the visitor with a tree instead of an empty canvas.
  void generate();
}

window.addEventListener('DOMContentLoaded', init);
