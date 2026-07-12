// FractalService instances are not safe for overlapping generate() calls
// (see docs/ea/4_application/5_interface-contracts.md), so every page serializes its runs: while one is in
// flight, remember only the latest requested params and run once more when
// the current run finishes.

export function createSerialRunner<P = void>(
  run: (params: P) => Promise<void>
): (params: P) => Promise<void> {
  let busy = false;
  let queued: { params: P } | null = null;

  return async (params: P): Promise<void> => {
    if (busy) {
      queued = { params };
      return;
    }
    busy = true;
    try {
      let next: { params: P } | null = { params };
      while (next) {
        const current = next.params;
        next = null;
        await run(current);
        next = queued;
        queued = null;
      }
    } catch (err) {
      console.error(err);
    } finally {
      busy = false;
    }
  };
}
