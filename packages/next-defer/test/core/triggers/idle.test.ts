import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { idle } from '../../../src/core/triggers/idle';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('idle', () => {
  describe('without requestIdleCallback (fallback)', () => {
    beforeEach(() => {
      vi.stubGlobal('requestIdleCallback', undefined);
      vi.stubGlobal('cancelIdleCallback', undefined);
      vi.useFakeTimers();
    });

    it('fires via the setTimeout fallback', () => {
      const fire = vi.fn();
      idle().subscribe(document.createElement('div'), fire);

      expect(fire).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(fire).toHaveBeenCalledOnce();
    });

    it('cancels the fallback timer when disarmed', () => {
      const fire = vi.fn();
      const cleanup = idle().subscribe(document.createElement('div'), fire);

      cleanup();
      vi.advanceTimersByTime(1000);
      expect(fire).not.toHaveBeenCalled();
    });

    it('fires on the next tick regardless of timeout', () => {
      const fire = vi.fn();
      idle('10s').subscribe(document.createElement('div'), fire);

      vi.advanceTimersByTime(1);
      expect(fire).toHaveBeenCalledOnce();
    });
  });

  describe('with requestIdleCallback', () => {
    let requestIdleCallbackMock: ReturnType<typeof vi.fn>;
    let cancelIdleCallbackMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      requestIdleCallbackMock = vi.fn((cb: () => void) => {
        cb();
        return 42;
      });
      cancelIdleCallbackMock = vi.fn();
      vi.stubGlobal('requestIdleCallback', requestIdleCallbackMock);
      vi.stubGlobal('cancelIdleCallback', cancelIdleCallbackMock);
    });

    it('delegates to requestIdleCallback instead of setTimeout', () => {
      const fire = vi.fn();
      idle().subscribe(document.createElement('div'), fire);

      expect(requestIdleCallbackMock).toHaveBeenCalledOnce();
      expect(fire).toHaveBeenCalledOnce();
    });

    it('omits options when no timeout is given', () => {
      const fire = vi.fn();
      idle().subscribe(document.createElement('div'), fire);

      expect(requestIdleCallbackMock).toHaveBeenCalledWith(fire);
    });

    it('passes the parsed timeout through to requestIdleCallback', () => {
      const fire = vi.fn();
      idle('2s').subscribe(document.createElement('div'), fire);

      expect(requestIdleCallbackMock).toHaveBeenCalledWith(fire, { timeout: 2000 });
    });

    it('cancels via cancelIdleCallback when disarmed', () => {
      requestIdleCallbackMock.mockImplementation(() => 99);
      const fire = vi.fn();
      const cleanup = idle().subscribe(document.createElement('div'), fire);

      cleanup();

      expect(cancelIdleCallbackMock).toHaveBeenCalledWith(99);
    });
  });

  it('throws synchronously for an invalid timeout', () => {
    expect(() => idle('not-a-duration')).toThrow(TypeError);
  });
});
