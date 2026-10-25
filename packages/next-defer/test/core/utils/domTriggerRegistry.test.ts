import { afterEach, describe, expect, it, vi } from 'vitest';
import { domTriggerRegistry } from '../../../src/core/utils/domTriggerRegistry';
import { mockIntersectionObserver } from '../../mocks/intersectionObserver';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('domTriggerRegistry', () => {
  it('viewport forwards rootMargin and threshold to the IntersectionObserver', () => {
    const io = mockIntersectionObserver();
    const element = document.createElement('div');

    domTriggerRegistry
      .viewport({ kind: 'viewport', rootMargin: '150px', threshold: 0.25 })
      .triggerSubscribe(element, vi.fn());

    expect(io.instances[0]!.options).toEqual({ rootMargin: '150px', threshold: 0.25 });
  });

  it('interaction fires on click', () => {
    const element = document.createElement('div');
    const fire = vi.fn();

    domTriggerRegistry.interaction().triggerSubscribe(element, fire);
    element.dispatchEvent(new Event('click'));

    expect(fire).toHaveBeenCalledOnce();
  });

  it('hover fires on mouseenter', () => {
    const element = document.createElement('div');
    const fire = vi.fn();

    domTriggerRegistry.hover().triggerSubscribe(element, fire);
    element.dispatchEvent(new Event('mouseenter'));

    expect(fire).toHaveBeenCalledOnce();
  });
});
