// Web-layer canvas adapter — wraps the browser HTMLCanvasElement.
// Bug fixed: removed module-level document.getElementById call that hard-coded ctx at import time.

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

export function setupCanvas(canvasEl: HTMLCanvasElement): void {
  canvas = canvasEl;
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.8;
  ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function clearCanvas(): void {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Fixed: renamed from drawFractalTree to drawFractalTree and accepts ctx via module state.
// Uses async recursion so animationSpeed can be respected.
export async function drawFractalTree(
  x: number,
  y: number,
  length: number,
  angle: number,
  depth: number,
  branchLengthFactor: number,
  branchAngleDeg: number,
  lineWidth: number,
  color: string,
  leafColor: string,
  animationSpeedMs: number
): Promise<void> {
  if (depth === 0) return;

  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = depth <= 2 ? leafColor : color;
  ctx.moveTo(x, y);
  const endX = x + length * Math.cos(angle);
  const endY = y - length * Math.sin(angle);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  if (animationSpeedMs > 0) {
    await new Promise<void>(resolve => setTimeout(resolve, animationSpeedMs));
  }

  const branchAngleRad = (branchAngleDeg * Math.PI) / 180;
  await drawFractalTree(endX, endY, length * branchLengthFactor, angle - branchAngleRad,
    depth - 1, branchLengthFactor, branchAngleDeg, lineWidth * 0.7, color, leafColor, animationSpeedMs);
  await drawFractalTree(endX, endY, length * branchLengthFactor, angle + branchAngleRad,
    depth - 1, branchLengthFactor, branchAngleDeg, lineWidth * 0.7, color, leafColor, animationSpeedMs);
}
