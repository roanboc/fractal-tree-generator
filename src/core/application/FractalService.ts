import { CanvasConfig, FractalParams, FractalParamsInput, RenderResult } from '../domain/types';
import { IConfigService, IFractalService, IRendererService, ISpeedControlService } from '../ports';
import { sampleInterval } from './math';

const DEFAULT_CANVAS: CanvasConfig = {
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
};

export class FractalService implements IFractalService {
  private branchCount = 0;

  constructor(
    private readonly renderer: IRendererService,
    private readonly speedControl: ISpeedControlService,
    private readonly config: IConfigService,
    private readonly canvasConfig: CanvasConfig = DEFAULT_CANVAS
  ) {}

  async generate(params: FractalParamsInput): Promise<RenderResult> {
    const validated = this.config.validate(params);
    this.branchCount = 0;
    const startTime = Date.now();

    this.renderer.initialize(this.canvasConfig);

    // Start from bottom-center, pointing straight up (π/2 radians)
    await this.drawBranch(
      this.canvasConfig.width / 2,
      this.canvasConfig.height,
      validated.trunkLength,
      Math.PI / 2,
      1,
      this.sampleTipDepth(validated),
      validated
    );

    return {
      outputPath: '',
      generationTimeMs: Date.now() - startTime,
      totalBranchesDrawn: this.branchCount,
    };
  }

  clear(): void {
    this.renderer.clear();
  }

  /**
   * Each branch decides how deep its own path may grow by sampling the depth
   * interval: wildness 0 pins every tip to the interval's midpoint, wildness 1
   * lets tips stop anywhere between min and max iterations.
   */
  private sampleTipDepth(params: FractalParams): number {
    return Math.round(sampleInterval(params.depth, params.randomness));
  }

  private async drawBranch(
    x: number,
    y: number,
    length: number,
    angle: number,
    level: number,
    tipDepth: number,
    params: FractalParams
  ): Promise<void> {
    // Leaf color near this path's own tip, trunk color elsewhere
    const color = tipDepth - level < 2 ? params.colors.leaf : params.colors.trunk;

    // Taper line width: thicker at base, thinner at tips
    const lineWidth = Math.max(0.5, params.lineWidth * Math.pow(0.7, level - 1));

    await this.renderer.drawBranch(x, y, length, angle, lineWidth, color, params.strokeDuration);
    this.branchCount++;

    // Speed control: await configured delay between each branch drawn
    await this.speedControl.wait();

    if (level >= tipDepth) return;

    const endX = x + length * Math.cos(angle);
    const endY = y - length * Math.sin(angle);

    // Each child samples its own angle, shrink, and tip depth from the
    // configured intervals — wildness controls how far from the midpoints
    // the samples may land. Children are drawn sequentially so step-by-step
    // animation stays ordered.
    for (const side of [-1, 1] as const) {
      const childTipDepth = this.sampleTipDepth(params);
      if (childTipDepth <= level) continue;

      const branchAngleRad = (sampleInterval(params.angle, params.randomness) * Math.PI) / 180;
      const shrink = sampleInterval(params.lengthFactor, params.randomness);

      await this.drawBranch(
        endX,
        endY,
        length * shrink,
        angle + side * branchAngleRad,
        level + 1,
        childTipDepth,
        params
      );
    }
  }
}
