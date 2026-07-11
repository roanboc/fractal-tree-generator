import {
  IConfigService,
  IFractalService,
  ILoggerService,
  IRendererService,
  ISpeedControlService,
} from '../core/ports';
import { ConfigService } from '../core/application/ConfigService';
import { FractalService } from '../core/application/FractalService';
import { SpeedControlService } from '../core/application/SpeedControlService';
import { NodeCanvasRendererService } from '../adapters/node/NodeCanvasRendererService';
import { FractalLogRepository } from '../adapters/node/FractalLogRepository';
import { LoggerService } from '../adapters/node/LoggerService';

export interface NodeServices {
  fractalService: IFractalService;
  rendererService: IRendererService;
  loggerService: ILoggerService;
  configService: IConfigService;
  speedControlService: ISpeedControlService;
}

// Composition root for the CLI entry point.
export function composeNodeServices(): NodeServices {
  const configService = new ConfigService();
  const speedControlService = new SpeedControlService();
  const rendererService = new NodeCanvasRendererService();
  const fractalService = new FractalService(rendererService, speedControlService, configService);

  const repository = new FractalLogRepository();
  const loggerService = new LoggerService(repository);

  return { fractalService, rendererService, loggerService, configService, speedControlService };
}
