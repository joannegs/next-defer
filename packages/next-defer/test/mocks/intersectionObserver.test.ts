import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockIntersectionObserver } from './intersectionObserver';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('mockIntersectionObserver', () => {
  it('replaces the global IntersectionObserver', () => {
    mockIntersectionObserver();
    const observer = new IntersectionObserver(() => {});

    expect(typeof observer.observe).toBe('function');
  });

  it('calls the callback with isIntersecting when triggered', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');
    const callback = vi.fn();

    new IntersectionObserver(callback).observe(element);
    io.trigger(element, true);

    expect(callback).toHaveBeenCalledOnce();
    const [entries] = callback.mock.calls[0]!;
    expect(entries).toHaveLength(1);
    expect(entries[0].target).toBe(element);
    expect(entries[0].isIntersecting).toBe(true);
  });

  it('does nothing when the target is not observed', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');
    const callback = vi.fn();

    new IntersectionObserver(callback);
    expect(() => io.trigger(element, true)).not.toThrow();
    expect(callback).not.toHaveBeenCalled();
  });

  it('stops notifying after unobserve', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');
    const callback = vi.fn();

    const observer = new IntersectionObserver(callback);
    observer.observe(element);
    observer.unobserve(element);
    io.trigger(element, true);

    expect(callback).not.toHaveBeenCalled();
  });

  it('stops notifying every observed element after disconnect', () => {
    const io = mockIntersectionObserver();
    const a = document.createElement('div');
    const b = document.createElement('span');
    const callback = vi.fn();

    const observer = new IntersectionObserver(callback);
    observer.observe(a);
    observer.observe(b);
    observer.disconnect();

    io.trigger(a, true);
    io.trigger(b, true);

    expect(callback).not.toHaveBeenCalled();
  });

  it('tracks multiple observer instances independently', () => {
    const io = mockIntersectionObserver();
    const a = document.createElement('div');
    const b = document.createElement('span');
    const callbackA = vi.fn();
    const callbackB = vi.fn();

    new IntersectionObserver(callbackA).observe(a);
    new IntersectionObserver(callbackB).observe(b);

    io.trigger(a, true);

    expect(callbackA).toHaveBeenCalledOnce();
    expect(callbackB).not.toHaveBeenCalled();
    expect(io.instances).toHaveLength(2);
  });

  it('exposes the options passed to the constructor', () => {
    const io = mockIntersectionObserver();
    new IntersectionObserver(() => {}, { threshold: 0.5 });

    expect(io.instances[0]!.options).toEqual({ threshold: 0.5 });
  });

  it('applies entry overrides passed to trigger', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');
    const callback = vi.fn();

    new IntersectionObserver(callback).observe(element);
    io.trigger(element, true, { intersectionRatio: 0.75 });

    const [entries] = callback.mock.calls[0]!;
    expect(entries[0].intersectionRatio).toBe(0.75);
  });
});
