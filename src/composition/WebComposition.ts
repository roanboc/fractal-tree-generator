import {
  IConfigService,
  IFractalService,
  IRendererService,
  ISpeedControlService,
} from '../core/ports';
import { ConfigService } from '../core/application/ConfigService';
import { FractalService } from '../core/application/FractalService';
import { SpeedControlService } from '../core/application/SpeedControlService';
import { WebRendererService } from '../adapters/web/WebRendererService';

export interface WebServices {
  fractalService: IFractalService;
  rendererService: IRendererService;
  configService: IConfigService;
  speedControlService: ISpeedControlService;
}

// Composition root for the browser entry point.
// Deliberately imports only browser-safe adapters — never Node-only adapters
// (canvas, better-sqlite3) — so those native dependencies never enter the
// web bundle's module graph.
export function composeWebServices(): WebServices {
  const configService = new ConfigService();
  const speedControlService = new SpeedControlService();
  const rendererService = new WebRendererService();
  const fractalService = new FractalService(rendererService, speedControlService, configService);

  return { fractalService, rendererService, configService, speedControlService };
}
