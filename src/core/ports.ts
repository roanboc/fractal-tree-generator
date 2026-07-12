import {
  CanvasConfig,
  FractalLogEntry,
  FractalParams,
  FractalParamsInput,
  RenderResult,
} from './domain/types';
import { TurtleOptions, TurtleProgram, TurtleRenderResult } from './domain/turtle';

export interface IFractalService {
  generate(params: FractalParamsInput): Promise<RenderResult>;
  clear(): void;
}

export interface ITurtleFractalService {
  run(program: TurtleProgram, options: Partial<TurtleOptions>): Promise<TurtleRenderResult>;
  clear(): void;
}

export interface IRendererService {
  initialize(config: CanvasConfig): void;
  /**
   * Draw one branch. When strokeMs > 0 the renderer may animate the stroke
   * from base to tip and return a promise that resolves when the stroke is
   * complete; renderers without animation support draw instantly.
   */
  drawBranch(
    x: number,
    y: number,
    length: number,
    angle: number,
    lineWidth: number,
    color: string,
    strokeMs?: number
  ): void | Promise<void>;
  save(outputPath: string): Promise<void>;
  clear(): void;
}

export interface ILoggerService {
  log(entry: FractalLogEntry): Promise<void>;
  getRecent(limit: number): Promise<FractalLogEntry[]>;
}

export interface ISpeedControlService {
  setDelay(ms: number): void;
  getDelay(): number;
  wait(): Promise<void>;
  isEnabled(): boolean;
}

export interface IConfigService {
  getDefaults(): FractalParams;
  validate(params: FractalParamsInput): FractalParams;
}

export interface IFractalLogRepository {
  insert(entry: FractalLogEntry): number;
  findRecent(limit: number): FractalLogEntry[];
  findById(id: number): FractalLogEntry | null;
}
