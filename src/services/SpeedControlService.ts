import { ISpeedControlService } from '../types/interfaces';

export class SpeedControlService implements ISpeedControlService {
  private delayMs: number = 0;

  setDelay(ms: number): void {
    this.delayMs = Math.max(0, Math.min(10000, ms));
  }

  getDelay(): number {
    return this.delayMs;
  }

  isEnabled(): boolean {
    return this.delayMs > 0;
  }

  wait(): Promise<void> {
    if (this.delayMs === 0) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, this.delayMs));
  }
}
