import { describe, expect, it, vi } from 'vitest';
import { observable } from '../../src/core/trigger';
import { noop, type TriggerImpl } from '../../src/core/interfaces/triggerImpl.interface';

describe('noop', () => {
  it('never calls fire', () => {
    const fire = vi.fn();
    noop.subscribe(document.createElement('div'), fire);
    expect(fire).not.toHaveBeenCalled();
  });

  it('returns a cleanup function that does nothing', () => {
    const cleanup = noop.subscribe(document.createElement('div'), vi.fn());
    expect(() => cleanup()).not.toThrow();
  });

  it('satisfies the TriggerImpl contract', () => {
    const trigger: TriggerImpl = noop;
    expect(typeof trigger.subscribe).toBe('function');
  });
});

describe('observable', () => {
  it('sets display: contents on the element before observing', () => {
    const element = document.createElement('div');
    let seenDisplay: string | undefined;

    const trigger = observable((el) => {
      seenDisplay = el.style.display;
      return () => {};
    });

    trigger.subscribe(element, vi.fn());

    expect(element.style.display).toBe('contents');
    expect(seenDisplay).toBe('contents');
  });

  it('passes the element and fire callback through to observe', () => {
    const element = document.createElement('div');
    const fire = vi.fn();
    const observe = vi.fn(() => () => {});

    const trigger = observable(observe);
    trigger.subscribe(element, fire);

    expect(observe).toHaveBeenCalledWith(element, fire);
  });

  it('forwards the cleanup function returned by observe', () => {
    const cleanup = vi.fn();
    const trigger = observable(() => cleanup);

    const returnedCleanup = trigger.subscribe(document.createElement('div'), vi.fn());
    returnedCleanup();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('calls fire when observe invokes it', () => {
    const fire = vi.fn();
    const trigger = observable((_el, f) => {
      f();
      return () => {};
    });

    trigger.subscribe(document.createElement('div'), fire);
    expect(fire).toHaveBeenCalledOnce();
  });
});
