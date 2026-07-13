// Implements ITree3DRendererService with raw WebGL — no 3D library (see the
// course of action in docs/ea/1_strategy/2_capabilities-and-resources.md).
// Each Segment3D becomes one screen-facing ribbon: four vertices whose
// corners the vertex shader extrudes perpendicular to the segment's screen
// direction, with perspective-correct width and a fog blend toward the
// background for depth. The adapter owns everything view-related: orbit
// camera (drag), zoom (wheel/pinch), slow spin, and the level-staggered
// growth reveal. The core never learns what a camera is.

import { hexToRgb } from '../../core/application/math';
import { Segment3D } from '../../core/domain/tree3d';
import { CanvasConfig } from '../../core/domain/types';
import { ITree3DRendererService } from '../../core/ports';

const VERTEX_SHADER = `
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute vec2 aCorner;   // x: side (-1|1), y: which endpoint (0|1)
  attribute float aWidth;   // world units
  attribute vec3 aColor;
  attribute float aLevel;

  uniform mat4 uMvp;
  uniform vec2 uViewport;    // pixels
  uniform float uPixelScale; // world→pixel factor at w=1
  uniform float uReveal;     // grow front, in levels
  uniform vec2 uFog;         // [start, end] in clip w

  varying vec3 vColor;
  varying float vFog;

  void main() {
    // Level N grows during reveal time [N-1, N]; before that the segment
    // collapses to its start point (zero length and width).
    float f = clamp(uReveal - aLevel + 1.0, 0.0, 1.0);
    vec4 clipA = uMvp * vec4(aStart, 1.0);
    vec4 clipB = uMvp * vec4(mix(aStart, aEnd, f), 1.0);
    vec4 p = mix(clipA, clipB, aCorner.y);

    vec2 aScreen = clipA.xy / max(clipA.w, 0.0001) * uViewport;
    vec2 bScreen = clipB.xy / max(clipB.w, 0.0001) * uViewport;
    vec2 along = bScreen - aScreen;
    float len = max(length(along), 0.0001);
    vec2 normal = vec2(-along.y, along.x) / len;

    float halfPx = max(aWidth * 0.5 * uPixelScale / max(p.w, 0.0001), 0.4);
    halfPx *= step(0.0001, f);
    p.xy += normal * aCorner.x * halfPx / uViewport * p.w;

    gl_Position = p;
    vColor = aColor;
    vFog = clamp((p.w - uFog.x) / max(uFog.y - uFog.x, 0.0001), 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec3 vColor;
  varying float vFog;
  uniform vec3 uBg;

  void main() {
    gl_FragColor = vec4(mix(vColor, uBg, vFog * 0.55), 1.0);
  }
`;

const FOV_Y = (38 * Math.PI) / 180;
const FLOATS_PER_VERTEX = 13; // start(3) end(3) corner(2) width(1) color(3) level(1)
const SPIN_RADIANS_PER_SECOND = 0.25;
const MIN_PITCH = -0.15;
const MAX_PITCH = 1.35;

type Mat4 = Float32Array;

function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[row] * b[col * 4] +
        a[4 + row] * b[col * 4 + 1] +
        a[8 + row] * b[col * 4 + 2] +
        a[12 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

function mat4Perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

function mat4Translation(x: number, y: number, z: number): Mat4 {
  const out = new Float32Array(16);
  out[0] = out[5] = out[10] = out[15] = 1;
  out[12] = x;
  out[13] = y;
  out[14] = z;
  return out;
}

function mat4RotationX(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const out = new Float32Array(16);
  out[0] = out[15] = 1;
  out[5] = c;
  out[6] = s;
  out[9] = -s;
  out[10] = c;
  return out;
}

function mat4RotationY(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const out = new Float32Array(16);
  out[5] = out[15] = 1;
  out[0] = c;
  out[2] = -s;
  out[8] = s;
  out[10] = c;
  return out;
}

function cssColorToRgb01(color: string): [number, number, number] {
  const [r, g, b] = hexToRgb(color);
  return [r / 255, g / 255, b / 255];
}

export class WebGLTreeRendererService implements ITree3DRendererService {
  private gl: WebGLRenderingContext | null = null;
  private glFailed = false;
  private program: WebGLProgram | null = null;
  private attribs: Record<string, number> = {};
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  private indexCount = 0;
  private maxLevel = 1;
  private background: [number, number, number] = [0.04, 0.06, 0.13];

  // Orbit camera state; target/distance are re-fit to each presented scene.
  private yaw = -0.55;
  private pitch = 0.3;
  private distance = 480;
  private fitDistance = 480;
  private targetY = 90;

  private autoRotate = false;
  private revealStart = 0;
  private revealDuration = 0;
  private lastFrameTime = 0;
  private frameHandle: number | null = null;
  private readonly reducedMotion: boolean;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.attachCameraControls();
  }

  initialize(config: CanvasConfig): void {
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    this.background = cssColorToRgb01(config.backgroundColor);
    const gl = this.ensureContext();
    if (!gl) return;
    gl.viewport(0, 0, config.width, config.height);
    this.paintBackground();
  }

  presentScene(segments: Segment3D[]): void {
    const gl = this.ensureContext();
    if (!gl) return;

    this.uploadGeometry(gl, segments);
    this.fitCameraTo(segments);

    this.maxLevel = segments.reduce((max, s) => Math.max(max, s.level), 1);
    this.revealDuration = this.reducedMotion ? 0 : Math.min(2200, 320 * this.maxLevel);
    this.revealStart = performance.now();

    this.requestFrame();
  }

  setAutoRotate(enabled: boolean): void {
    this.autoRotate = enabled;
    // Forget the last frame time so the spin resumes smoothly instead of
    // jumping by however long the loop has been idle.
    this.lastFrameTime = 0;
    this.requestFrame();
  }

  async save(_outputPath: string): Promise<void> {
    if (!this.gl) return;
    // Draw and read back in the same task so the frame is still in the
    // drawing buffer (no preserveDrawingBuffer needed).
    this.renderFrame(performance.now());
    const link = document.createElement('a');
    link.download = 'fractal-tree-3d.png';
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  clear(): void {
    this.indexCount = 0;
    if (this.frameHandle !== null) {
      cancelAnimationFrame(this.frameHandle);
      this.frameHandle = null;
    }
    this.paintBackground();
  }

  // ── GL plumbing ────────────────────────────────────────────────────

  private ensureContext(): WebGLRenderingContext | null {
    if (this.gl) return this.gl;
    if (this.glFailed) return null;
    const gl = this.canvas.getContext('webgl', { antialias: true });
    if (!gl) {
      // Degrade gracefully: the page keeps working, the canvas stays on its
      // CSS background (contract in docs/ea/4_application/5_interface-contracts.md).
      this.glFailed = true;
      console.error('WebGL is not available; the 3D tree cannot be drawn.');
      return null;
    }

    const compile = (type: number, source: string): WebGLShader => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(`shader compile failed: ${gl.getShaderInfoLog(shader)}`);
      }
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`program link failed: ${gl.getProgramInfoLog(program)}`);
    }
    gl.useProgram(program);

    for (const name of ['aStart', 'aEnd', 'aCorner', 'aWidth', 'aColor', 'aLevel']) {
      this.attribs[name] = gl.getAttribLocation(program, name);
    }
    for (const name of ['uMvp', 'uViewport', 'uPixelScale', 'uReveal', 'uFog', 'uBg']) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }

    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST);

    this.gl = gl;
    this.program = program;
    return gl;
  }

  private uploadGeometry(gl: WebGLRenderingContext, segments: Segment3D[]): void {
    const vertices = new Float32Array(segments.length * 4 * FLOATS_PER_VERTEX);
    const indices = new Uint16Array(segments.length * 6);
    const corners: [number, number][] = [
      [-1, 0],
      [1, 0],
      [-1, 1],
      [1, 1],
    ];

    segments.forEach((segment, i) => {
      const color = cssColorToRgb01(segment.color);
      for (let c = 0; c < 4; c++) {
        let o = (i * 4 + c) * FLOATS_PER_VERTEX;
        vertices[o++] = segment.start.x;
        vertices[o++] = segment.start.y;
        vertices[o++] = segment.start.z;
        vertices[o++] = segment.end.x;
        vertices[o++] = segment.end.y;
        vertices[o++] = segment.end.z;
        vertices[o++] = corners[c][0];
        vertices[o++] = corners[c][1];
        vertices[o++] = segment.width;
        vertices[o++] = color[0];
        vertices[o++] = color[1];
        vertices[o++] = color[2];
        vertices[o] = segment.level;
      }
      const v = i * 4;
      indices.set([v, v + 1, v + 2, v + 2, v + 1, v + 3], i * 6);
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    this.indexCount = indices.length;

    const stride = FLOATS_PER_VERTEX * 4;
    const bind = (name: string, size: number, offsetFloats: number): void => {
      const location = this.attribs[name];
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offsetFloats * 4);
    };
    bind('aStart', 3, 0);
    bind('aEnd', 3, 3);
    bind('aCorner', 2, 6);
    bind('aWidth', 1, 8);
    bind('aColor', 3, 9);
    bind('aLevel', 1, 12);
  }

  private fitCameraTo(segments: Segment3D[]): void {
    let minX = 0,
      minY = 0,
      minZ = 0,
      maxX = 0,
      maxY = 0,
      maxZ = 0;
    for (const s of segments) {
      for (const p of [s.start, s.end]) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        minZ = Math.min(minZ, p.z);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
        maxZ = Math.max(maxZ, p.z);
      }
    }
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const spanZ = maxZ - minZ;
    const radius = Math.max(Math.sqrt(spanX * spanX + spanY * spanY + spanZ * spanZ) / 2, 60);

    this.targetY = (minY + maxY) / 2;
    this.fitDistance = (radius / Math.tan(FOV_Y / 2)) * 1.2;
    this.distance = this.fitDistance;
  }

  // ── Frame loop ─────────────────────────────────────────────────────

  private requestFrame(): void {
    if (this.frameHandle !== null) return;
    this.frameHandle = requestAnimationFrame((now) => {
      this.frameHandle = null;
      this.renderFrame(now);
      const revealing = now - this.revealStart < this.revealDuration;
      if (revealing || this.autoRotate) this.requestFrame();
    });
  }

  private renderFrame(now: number): void {
    const gl = this.gl;
    if (!gl || !this.program) return;

    if (this.autoRotate && this.lastFrameTime > 0) {
      this.yaw += ((now - this.lastFrameTime) / 1000) * SPIN_RADIANS_PER_SECOND;
    }
    this.lastFrameTime = now;

    this.paintBackground();
    if (this.indexCount === 0) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const near = Math.max(this.distance * 0.05, 1);
    const far = this.distance * 6;

    const projection = mat4Perspective(FOV_Y, width / height, near, far);
    let view = mat4Translation(0, 0, -this.distance);
    view = mat4Multiply(view, mat4RotationX(this.pitch));
    view = mat4Multiply(view, mat4RotationY(this.yaw));
    view = mat4Multiply(view, mat4Translation(0, -this.targetY, 0));
    const mvp = mat4Multiply(projection, view);

    const reveal =
      this.revealDuration <= 0
        ? this.maxLevel
        : Math.min(1, (now - this.revealStart) / this.revealDuration) * this.maxLevel;

    gl.uniformMatrix4fv(this.uniforms.uMvp, false, mvp);
    gl.uniform2f(this.uniforms.uViewport, width, height);
    gl.uniform1f(this.uniforms.uPixelScale, height / (2 * Math.tan(FOV_Y / 2)));
    gl.uniform1f(this.uniforms.uReveal, reveal);
    gl.uniform2f(this.uniforms.uFog, this.distance * 0.6, this.distance * 1.8);
    gl.uniform3f(this.uniforms.uBg, this.background[0], this.background[1], this.background[2]);

    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  }

  private paintBackground(): void {
    const gl = this.gl;
    if (!gl) return;
    gl.clearColor(this.background[0], this.background[1], this.background[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  // ── Interaction (orbit, zoom) ──────────────────────────────────────

  private attachCameraControls(): void {
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDistance = 0;

    this.canvas.addEventListener('pointerdown', (event) => {
      this.canvas.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
      }
    });

    this.canvas.addEventListener('pointermove', (event) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;

      if (pointers.size === 1) {
        this.yaw += (event.clientX - previous.x) * 0.008;
        this.pitch = Math.min(
          MAX_PITCH,
          Math.max(MIN_PITCH, this.pitch + (event.clientY - previous.y) * 0.006)
        );
      }
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDistance > 0) this.zoomBy(pinchDistance / distance);
        pinchDistance = distance;
      }
      this.requestFrame();
    });

    const release = (event: PointerEvent): void => {
      pointers.delete(event.pointerId);
      pinchDistance = 0;
    };
    this.canvas.addEventListener('pointerup', release);
    this.canvas.addEventListener('pointercancel', release);

    this.canvas.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        this.zoomBy(Math.exp(event.deltaY * 0.001));
        this.requestFrame();
      },
      { passive: false }
    );
  }

  private zoomBy(factor: number): void {
    this.distance = Math.min(
      this.fitDistance * 4,
      Math.max(this.fitDistance * 0.3, this.distance * factor)
    );
  }
}
