import { afterEach, describe, expect, it, vi } from 'vitest';
import { viewport } from '../../../src/core/triggers/viewport';
import { mockIntersectionObserver } from '../../mocks/intersectionObserver';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('viewport', () => {
  it('sets display: contents on the element', () => {
    mockIntersectionObserver();
    const element = document.createElement('div');

    viewport().triggerSubscribe(element, vi.fn());

    expect(element.style.display).toBe('contents');
  });

  it('fires only once the element intersects', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');
    const fire = vi.fn();

    viewport().triggerSubscribe(element, fire);
    io.trigger(element, false);
    expect(fire).not.toHaveBeenCalled();

    io.trigger(element, true);
    expect(fire).toHaveBeenCalledOnce();
  });

  it('passes rootMargin and threshold to the IntersectionObserver', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');

    viewport({ rootMargin: '200px', threshold: 0.5 }).triggerSubscribe(element, vi.fn());

    expect(io.instances[0]!.options).toEqual({ rootMargin: '200px', threshold: 0.5 });
  });

  it('disconnects after firing, so it never fires more than once', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');
    const fire = vi.fn();

    viewport().triggerSubscribe(element, fire);
    io.trigger(element, true);
    io.trigger(element, true);

    expect(fire).toHaveBeenCalledOnce();
  });

  it('disconnects when disarmed before it fires', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');
    const fire = vi.fn();

    const cleanup = viewport().triggerSubscribe(element, fire);
    cleanup();
    io.trigger(element, true);

    expect(fire).not.toHaveBeenCalled();
  });

  it('cleanup is safe to call again after firing', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');
    const fire = vi.fn();

    const cleanup = viewport().triggerSubscribe(element, fire);
    io.trigger(element, true);

    expect(() => cleanup()).not.toThrow();
  });
});
