import { CanvasConfig, IRendererService } from '../types/interfaces';

export class WebRendererService implements IRendererService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  initialize(config: CanvasConfig): void {
    this.canvas = document.getElementById('fractalCanvas') as HTMLCanvasElement;
    this.canvas.width = config.width;
    this.canvas.height = config.height;
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
    color: string
  ): void {
    this.ctx.beginPath();
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = color;
    this.ctx.moveTo(x, y);
    const endX = x + length * Math.cos(angle);
    const endY = y - length * Math.sin(angle);
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
    if (this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
