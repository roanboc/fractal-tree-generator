import {
  IConfigService,
  IFractalService,
  IRendererService,
  ISnowflakeService,
  ISpeedControlService,
  ITree3DRendererService,
  ITree3DService,
  ITurtleFractalService,
} from '../core/ports';
import { CanvasConfig } from '../core/domain/types';
import { ConfigService } from '../core/application/ConfigService';
import { FractalService } from '../core/application/FractalService';
import { SnowflakeService } from '../core/application/SnowflakeService';
import { SpeedControlService } from '../core/application/SpeedControlService';
import { Tree3DService } from '../core/application/Tree3DService';
import { TurtleFractalService } from '../core/application/TurtleFractalService';
import { WebGLTreeRendererService } from '../adapters/web/WebGLTreeRendererService';
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

export interface TurtleWebServices {
  turtleService: ITurtleFractalService;
  rendererService: IRendererService;
  speedControlService: ISpeedControlService;
}

/** Composition root for canvases driven by the generic turtle engine. */
export function composeTurtleServices(
  canvas: HTMLCanvasElement,
  canvasConfig?: CanvasConfig
): TurtleWebServices {
  const speedControlService = new SpeedControlService();
  const rendererService = new WebRendererService(canvas);
  const turtleService = new TurtleFractalService(
    rendererService,
    speedControlService,
    canvasConfig
  );

  return { turtleService, rendererService, speedControlService };
}

export interface SnowflakeWebServices extends TurtleWebServices {
  snowflakeService: ISnowflakeService;
}

/** Composition root for the snowflake page. */
export function composeSnowflakeServices(
  canvas: HTMLCanvasElement,
  canvasConfig?: CanvasConfig
): SnowflakeWebServices {
  const services = composeTurtleServices(canvas, canvasConfig);
  return { ...services, snowflakeService: new SnowflakeService(services.turtleService) };
}

export interface Tree3DWebServices {
  tree3dService: ITree3DService;
  rendererService: ITree3DRendererService;
}

/** Composition root for the 3D tree page (chapter 6). */
export function composeTree3DServices(
  canvas: HTMLCanvasElement,
  canvasConfig?: CanvasConfig
): Tree3DWebServices {
  const rendererService = new WebGLTreeRendererService(canvas);
  return { tree3dService: new Tree3DService(rendererService, canvasConfig), rendererService };
}
