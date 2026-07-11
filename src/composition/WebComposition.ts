import {
  IConfigService,
  IFractalService,
  IRendererService,
  ISpeedControlService,
} from '../core/ports';
import { CanvasConfig } from '../core/domain/types';
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

// Composition root for the browser entry points.
// Deliberately imports only browser-safe adapters — never Node-only adapters
// (canvas, better-sqlite3) — so those native dependencies never enter the
// web bundle's module graph.
//
// Callable once per canvas: the learn page composes several independent
// service graphs, one for each small demo canvas on the page.
export function composeWebServices(
  canvas: HTMLCanvasElement,
  canvasConfig?: CanvasConfig
): WebServices {
  const configService = new ConfigService();
  const speedControlService = new SpeedControlService();
  const rendererService = new WebRendererService(canvas);
  const fractalService = new FractalService(
    rendererService,
    speedControlService,
    configService,
    canvasConfig
  );

  return { fractalService, rendererService, configService, speedControlService };
}
