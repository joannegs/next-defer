import { afterEach, describe, expect, it, vi } from 'vitest';
import { armTriggers } from '../../../src/core/utils/armTriggers';
import { mockIntersectionObserver } from '../../mocks/intersectionObserver';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('armTriggers', () => {
  it('dispatches "idle" to the idle trigger', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
    vi.stubGlobal('cancelIdleCallback', undefined);

    const fire = vi.fn();
    armTriggers(document.createElement('div'), { kind: 'idle' }, fire);

    vi.advanceTimersByTime(1);
    expect(fire).toHaveBeenCalledOnce();
  });

  it('dispatches "timer" to the timer trigger', () => {
    vi.useFakeTimers();

    const fire = vi.fn();
    armTriggers(document.createElement('div'), { kind: 'timer', ms: 1000 }, fire);

    vi.advanceTimersByTime(999);
    expect(fire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fire).toHaveBeenCalledOnce();
  });

  it('dispatches "viewport" to the viewport trigger', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');
    const fire = vi.fn();

    armTriggers(element, { kind: 'viewport', rootMargin: '200px' }, fire);
    io.trigger(element, true);

    expect(fire).toHaveBeenCalledOnce();
    expect(io.instances[0]!.options).toEqual({ rootMargin: '200px' });
  });

  it('dispatches "interaction" to the interaction trigger', () => {
    const element = document.createElement('div');
    const fire = vi.fn();

    armTriggers(element, { kind: 'interaction' }, fire);
    element.dispatchEvent(new Event('click'));

    expect(fire).toHaveBeenCalledOnce();
  });

  it('dispatches "hover" to the hover trigger', () => {
    const element = document.createElement('div');
    const fire = vi.fn();

    armTriggers(element, { kind: 'hover' }, fire);
    element.dispatchEvent(new Event('mouseenter'));

    expect(fire).toHaveBeenCalledOnce();
  });

  it('fires immediately when "when" is true', () => {
    const fire = vi.fn();
    armTriggers(document.createElement('div'), { kind: 'when', value: true }, fire);

    expect(fire).toHaveBeenCalledOnce();
  });

  it('does not fire when "when" is false', () => {
    const fire = vi.fn();
    armTriggers(document.createElement('div'), { kind: 'when', value: false }, fire);

    expect(fire).not.toHaveBeenCalled();
  });

  it('returns a cleanup function that stops a pending timer trigger', () => {
    vi.useFakeTimers();

    const fire = vi.fn();
    const cleanup = armTriggers(document.createElement('div'), { kind: 'timer', ms: 1000 }, fire);

    cleanup();
    vi.advanceTimersByTime(1000);

    expect(fire).not.toHaveBeenCalled();
  });
});
