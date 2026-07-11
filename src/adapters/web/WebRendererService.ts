import { CanvasConfig } from '../../core/domain/types';
import { IRendererService } from '../../core/ports';

export class WebRendererService implements IRendererService {
  private ctx!: CanvasRenderingContext2D;
  private backgroundColor = 'transparent';

  constructor(private readonly canvas: HTMLCanvasElement) {}

  initialize(config: CanvasConfig): void {
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    this.backgroundColor = config.backgroundColor;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.fillStyle = config.backgroundColor;
    this.ctx.fillRect(0, 0, config.width, config.height);
  }

  drawBranch(
    x: number,
    y: number,
    length: number,
    angle: number,
    lineWidth: number,
    color: string,
    strokeMs = 0
  ): void | Promise<void> {
    const endX = x + length * Math.cos(angle);
    const endY = y - length * Math.sin(angle);

    if (strokeMs <= 0) {
      this.strokeSegment(x, y, endX, endY, lineWidth, color);
      return;
    }

    // Animate the stroke growing from base to tip, like a pen drawing the
    // stick by hand. Each frame redraws the line from the base up to the
    // current progress point; overdrawing the same opaque path is seamless.
    return new Promise((resolve) => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / strokeMs);
        this.strokeSegment(x, y, x + (endX - x) * t, y + (endY - y) * t, lineWidth, color);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  private strokeSegment(
    x: number,
    y: number,
    endX: number,
    endY: number,
    lineWidth: number,
    color: string
  ): void {
    this.ctx.beginPath();
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = color;
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  }

  async save(_outputPath: string): Promise<void> {
    // Trigger browser download of the canvas as PNG
    const link = document.createElement('a');
    link.download = 'fractal-tree.png';
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  clear(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
