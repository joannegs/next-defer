import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitUntil } from '../../src/core/waitUntil';

describe('waitUntil', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not resolve before the target instant', async () => {
    let resolved = false;
    void waitUntil(Date.now() + 1000).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(resolved).toBe(false);
  });

  it('resolves exactly when the target instant (number) is reached', async () => {
    let resolved = false;
    void waitUntil(Date.now() + 1000).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(resolved).toBe(true);
  });

  it('accepts a Date instance', async () => {
    let resolved = false;
    void waitUntil(new Date(Date.now() + 500)).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(499);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
  });

  it('resolves on the next tick when the instant is already in the past', async () => {
    let resolved = false;
    void waitUntil(Date.now() - 1000).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(true);
  });

  it('resolves on the next tick when the instant is exactly now', async () => {
    let resolved = false;
    void waitUntil(Date.now()).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(true);
  });

  it.each([[NaN], [Infinity], [-Infinity], [new Date('invalid')], [null], [undefined], ['2024-01-01']])(
    'throws synchronously for invalid instant %p',
    (input) => {
      expect(() => waitUntil(input as unknown as number | Date)).toThrow(TypeError);
    },
  );
});
