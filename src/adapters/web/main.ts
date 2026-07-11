import { composeWebServices } from '../../composition/WebComposition';
import { initializeControls, getUserInput, rerenderControls } from './ControlsView';
import { initChrome } from './chrome';
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

  // FractalService instances are not safe for overlapping generate() calls
  // (see docs/CONTRACTS.md), so serialize: if a generation is requested while
  // one is running, remember it and run once more when the current one ends.
  let busy = false;
  let pending = false;
  const generate = async (): Promise<void> => {
    if (busy) {
      pending = true;
      return;
    }
    busy = true;
    try {
      do {
        pending = false;
        const params = configService.validate(getUserInput());
        speedControlService.setDelay(params.animationSpeed);
        await fractalService.generate(params);
      } while (pending);
    } catch (err) {
      console.error(err);
    } finally {
      busy = false;
    }
  };

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
