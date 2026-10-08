import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { timer } from '../../../src/core/triggers/timer';

describe('timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not fire before the delay elapses', () => {
    const fire = vi.fn();
    timer(1000).subscribe(document.createElement('div'), fire);

    vi.advanceTimersByTime(999);
    expect(fire).not.toHaveBeenCalled();
  });

  it('fires once the delay elapses (number, ms)', () => {
    const fire = vi.fn();
    timer(1000).subscribe(document.createElement('div'), fire);

    vi.advanceTimersByTime(1000);
    expect(fire).toHaveBeenCalledOnce();
  });

  it('accepts a duration string ("2s")', () => {
    const fire = vi.fn();
    timer('2s').subscribe(document.createElement('div'), fire);

    vi.advanceTimersByTime(1999);
    expect(fire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fire).toHaveBeenCalledOnce();
  });

  it('cancels the pending timer when the cleanup function runs', () => {
    const fire = vi.fn();
    const cleanup = timer(1000).subscribe(document.createElement('div'), fire);

    cleanup();
    vi.advanceTimersByTime(10_000);

    expect(fire).not.toHaveBeenCalled();
  });

  it('cleanup is safe to call again after firing', () => {
    const fire = vi.fn();
    const cleanup = timer(1000).subscribe(document.createElement('div'), fire);

    vi.advanceTimersByTime(1000);
    expect(() => cleanup()).not.toThrow();
  });

  it('throws synchronously for an invalid duration', () => {
    expect(() => timer('not-a-duration')).toThrow(TypeError);
  });

  it('creates an independent timer for each subscribe call', () => {
    const trigger = timer(1000);
    const fireA = vi.fn();
    const fireB = vi.fn();

    trigger.subscribe(document.createElement('div'), fireA);
    vi.advanceTimersByTime(500);
    trigger.subscribe(document.createElement('div'), fireB);
    vi.advanceTimersByTime(500);

    expect(fireA).toHaveBeenCalledOnce();
    expect(fireB).not.toHaveBeenCalled();
  });
});
