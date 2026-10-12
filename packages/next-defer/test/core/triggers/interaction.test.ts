import { describe, expect, it, vi } from 'vitest';
import { interaction } from '../../../src/core/triggers/interaction';

describe('interaction', () => {
  it('sets display: contents on the element', () => {
    const element = document.createElement('div');
    interaction().triggerSubscribe(element, vi.fn());

    expect(element.style.display).toBe('contents');
  });

  it.each(['click', 'touchstart', 'keydown'])('fires on %s', (eventType) => {
    const element = document.createElement('div');
    const fire = vi.fn();

    interaction().triggerSubscribe(element, fire);
    element.dispatchEvent(new Event(eventType));

    expect(fire).toHaveBeenCalledOnce();
  });

  it('stops listening once disarmed', () => {
    const element = document.createElement('div');
    const fire = vi.fn();

    const cleanup = interaction().triggerSubscribe(element, fire);
    cleanup();
    element.dispatchEvent(new Event('click'));

    expect(fire).not.toHaveBeenCalled();
  });
});
