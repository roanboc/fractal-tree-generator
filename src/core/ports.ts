import { CanvasConfig, FractalLogEntry, FractalParams, RenderResult } from './domain/types';

export interface IFractalService {
  generate(params: FractalParams): Promise<RenderResult>;
  clear(): void;
}

export interface IRendererService {
  initialize(config: CanvasConfig): void;
  drawBranch(
    x: number,
    y: number,
    length: number,
    angle: number,
    lineWidth: number,
    color: string
  ): void;
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
  validate(params: Partial<FractalParams>): FractalParams;
}

export interface IFractalLogRepository {
  insert(entry: FractalLogEntry): number;
  findRecent(limit: number): FractalLogEntry[];
  findById(id: number): FractalLogEntry | null;
}
