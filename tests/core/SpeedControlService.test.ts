import { describe, expect, it } from 'vitest';
import { SpeedControlService } from '../../src/core/application/SpeedControlService';

describe('SpeedControlService', () => {
  it('clamps delay to the 0-10000ms range', () => {
    const service = new SpeedControlService();

    service.setDelay(50000);
    expect(service.getDelay()).toBe(10000);

    service.setDelay(-5);
    expect(service.getDelay()).toBe(0);
  });

  it('is disabled at zero delay and enabled otherwise', () => {
    const service = new SpeedControlService();

    expect(service.isEnabled()).toBe(false);

    service.setDelay(100);
    expect(service.isEnabled()).toBe(true);
  });

  it('resolves wait() immediately when delay is zero', async () => {
    const service = new SpeedControlService();

    const start = Date.now();
    await service.wait();

    expect(Date.now() - start).toBeLessThan(20);
  });
});
