import { describe, expect, it, vi } from 'vitest';
import { hover } from '../../../src/core/triggers/hover';

describe('hover', () => {
  it('sets display: contents on the element', () => {
    const element = document.createElement('div');
    hover().triggerSubscribe(element, vi.fn());

    expect(element.style.display).toBe('contents');
  });

  it('fires on mouseenter', () => {
    const element = document.createElement('div');
    const fire = vi.fn();

    hover().triggerSubscribe(element, fire);
    element.dispatchEvent(new Event('mouseenter'));

    expect(fire).toHaveBeenCalledOnce();
  });

  it('fires only once even if mouseenter dispatches again', () => {
    const element = document.createElement('div');
    const fire = vi.fn();

    hover().triggerSubscribe(element, fire);
    element.dispatchEvent(new Event('mouseenter'));
    element.dispatchEvent(new Event('mouseenter'));

    expect(fire).toHaveBeenCalledOnce();
  });

  it('stops listening once disarmed', () => {
    const element = document.createElement('div');
    const fire = vi.fn();

    const cleanup = hover().triggerSubscribe(element, fire);
    cleanup();
    element.dispatchEvent(new Event('mouseenter'));

    expect(fire).not.toHaveBeenCalled();
  });

  it('cleanup is safe to call again after firing', () => {
    const element = document.createElement('div');
    const fire = vi.fn();

    const cleanup = hover().triggerSubscribe(element, fire);
    element.dispatchEvent(new Event('mouseenter'));

    expect(() => cleanup()).not.toThrow();
  });
});
