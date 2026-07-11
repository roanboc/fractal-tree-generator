import { composeWebServices } from '../../composition/WebComposition';
import { initializeControls, getUserInput } from './ControlsView';

function init(): void {
  const { fractalService, configService, speedControlService } = composeWebServices();

  initializeControls();

  document.getElementById('generateButton')?.addEventListener('click', () => {
    const params = configService.validate(getUserInput());
    speedControlService.setDelay(params.animationSpeed);
    fractalService.generate(params).catch(console.error);
  });

  document.getElementById('clearButton')?.addEventListener('click', () => {
    fractalService.clear();
  });
}

window.onload = init;
