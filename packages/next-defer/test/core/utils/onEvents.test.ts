import { describe, expect, it, vi } from 'vitest';
import { onEvents } from '../../../src/core/utils/onEvents';

describe('onEvents', () => {
  it('calls the handler when any listed event fires', () => {
    const element = document.createElement('div');
    const handler = vi.fn();

    onEvents(element, ['click', 'keydown'], handler);
    element.dispatchEvent(new Event('click'));

    expect(handler).toHaveBeenCalledOnce();
  });

  it('removes every listener once the first event fires', () => {
    const element = document.createElement('div');
    const handler = vi.fn();

    onEvents(element, ['click', 'keydown'], handler);
    element.dispatchEvent(new Event('click'));
    element.dispatchEvent(new Event('keydown'));

    expect(handler).toHaveBeenCalledOnce();
  });

  it('cleanup removes listeners before anything fires', () => {
    const element = document.createElement('div');
    const handler = vi.fn();

    const cleanup = onEvents(element, ['click'], handler);
    cleanup();
    element.dispatchEvent(new Event('click'));

    expect(handler).not.toHaveBeenCalled();
  });
});
