import { FractalParams, RenderResult } from '../domain/types';
import { IConfigService, IFractalService, IRendererService, ISpeedControlService } from '../ports';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BACKGROUND_COLOR = '#1a1a2e';

export class FractalService implements IFractalService {
  private branchCount = 0;

  constructor(
    private readonly renderer: IRendererService,
    private readonly speedControl: ISpeedControlService,
    private readonly config: IConfigService
  ) {}

  async generate(params: FractalParams): Promise<RenderResult> {
    const validated = this.config.validate(params);
    this.branchCount = 0;
    const startTime = Date.now();

    this.renderer.initialize({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: BACKGROUND_COLOR,
    });

    // Start from bottom-center, pointing straight up (π/2 radians)
    await this.drawBranch(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT,
      validated.trunkLength,
      Math.PI / 2,
      validated.depth,
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

  private async drawBranch(
    x: number,
    y: number,
    length: number,
    angle: number,
    depth: number,
    params: FractalParams
  ): Promise<void> {
    if (depth === 0) return;

    // Apply randomness jitter to angle and length
    const jitter = params.randomness;
    const jitteredAngle = angle + (Math.random() - 0.5) * jitter * (Math.PI / 4);
    const jitteredLength = length * (1 + (Math.random() - 0.5) * jitter * 0.3);

    // Interpolate color: trunk color for deeper levels, leaf color near tips
    const color = depth <= 2 ? params.colors.leaf : params.colors.trunk;

    // Taper line width: thicker at base, thinner at tips
    const lineWidth = Math.max(0.5, params.lineWidth * Math.pow(0.7, params.depth - depth));

    this.renderer.drawBranch(x, y, jitteredLength, jitteredAngle, lineWidth, color);
    this.branchCount++;

    // Speed control: await configured delay between each branch drawn
    await this.speedControl.wait();

    const endX = x + jitteredLength * Math.cos(jitteredAngle);
    const endY = y - jitteredLength * Math.sin(jitteredAngle);
    const branchAngleRad = (params.angle * Math.PI) / 180;

    // Draw left and right child branches sequentially for step-by-step animation
    await this.drawBranch(
      endX,
      endY,
      length * params.lengthFactor,
      jitteredAngle - branchAngleRad,
      depth - 1,
      params
    );
    await this.drawBranch(
      endX,
      endY,
      length * params.lengthFactor,
      jitteredAngle + branchAngleRad,
      depth - 1,
      params
    );
  }
}
