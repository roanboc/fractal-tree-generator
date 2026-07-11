import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CanvasConfig } from '../../core/domain/types';
import { IRendererService } from '../../core/ports';

export class NodeCanvasRendererService implements IRendererService {
  private canvas!: Canvas;
  private ctx!: CanvasRenderingContext2D;

  initialize(config: CanvasConfig): void {
    this.canvas = createCanvas(config.width, config.height);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = config.backgroundColor;
    this.ctx.fillRect(0, 0, config.width, config.height);
  }

  // strokeMs is part of the port for animating renderers; headless PNG
  // rendering always draws instantly.
  drawBranch(
    x: number,
    y: number,
    length: number,
    angle: number,
    lineWidth: number,
    color: string,
    _strokeMs = 0
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

  async save(outputPath: string): Promise<void> {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const buffer = this.canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
  }

  clear(): void {
    if (this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
