import { IFractalService, ILoggerService, IRendererService } from '../types/interfaces';
import { ConfigService } from '../services/ConfigService';
import { FractalService } from '../services/FractalService';
import { LoggerService } from '../services/LoggerService';
import { NodeCanvasRendererService } from '../services/NodeCanvasRendererService';
import { SpeedControlService } from '../services/SpeedControlService';
import { FractalLogRepository } from '../repositories/FractalLogRepository';

export type RunMode = 'cli' | 'web';

export interface AppServices {
  fractalService: IFractalService;
  loggerService: ILoggerService;
  rendererService: IRendererService;
}

export class ServiceFactory {
  static create(mode: RunMode): AppServices {
    const configService = new ConfigService();
    const speedControlService = new SpeedControlService();

    let rendererService: IRendererService;
    if (mode === 'cli') {
      rendererService = new NodeCanvasRendererService();
    } else {
      // Dynamically require web renderer to avoid importing browser APIs in CLI context
      const { WebRendererService } = require('../services/WebRendererService');
      rendererService = new WebRendererService();
    }

    const fractalService = new FractalService(
      rendererService,
      speedControlService,
      configService
    );

    const repository = new FractalLogRepository();
    const loggerService = new LoggerService(repository);

    return { fractalService, loggerService, rendererService };
  }
}
