// ─── Value Types ─────────────────────────────────────────────────────────────

export interface FractalColors {
  trunk: string;
  leaf: string;
  accent: string;
}

export interface FractalParams {
  depth: number;          // 1–12  — recursion depth
  angle: number;          // 1–90  — branch angle in degrees
  lengthFactor: number;   // 0.1–0.9 — branch length multiplier per level
  trunkLength: number;    // 10–500 — initial trunk length in pixels
  lineWidth: number;      // 1–20  — initial line thickness in pixels
  colors: FractalColors;
  randomness: number;     // 0–1   — jitter applied to angle and length
  animationSpeed: number; // 0–10000 — ms delay per branch drawn (0 = instant)
  showAccent: boolean;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface RenderResult {
  outputPath: string;
  generationTimeMs: number;
  totalBranchesDrawn: number;
}

export interface FractalLogEntry {
  id?: number;
  timestamp: string;            // ISO 8601
  params: FractalParams;
  generationTimeMs: number;
  outputPath: string;
  totalBranchesDrawn: number;
}

// ─── Service Interfaces ───────────────────────────────────────────────────────

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

// ─── Repository Interface ─────────────────────────────────────────────────────

export interface IFractalLogRepository {
  insert(entry: FractalLogEntry): number;
  findRecent(limit: number): FractalLogEntry[];
  findById(id: number): FractalLogEntry | null;
}
