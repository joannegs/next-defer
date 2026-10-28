import { describe, expect, it, vi } from 'vitest';
import { elementObservable } from '../../../src/core/utils/trigger';
import type { TriggerInterface } from '../../../src/core/interfaces/trigger.interface';
import { neverFired } from '../../../src/core/constants/trigger.constants';

describe('neverFired', () => {
  it('never calls fire', () => {
    const fire = vi.fn();
    neverFired.triggerSubscribe(document.createElement('div'), fire);
    expect(fire).not.toHaveBeenCalled();
  });

  it('returns a cleanup function that does nothing', () => {
    const cleanup = neverFired.triggerSubscribe(document.createElement('div'), vi.fn());
    expect(() => cleanup()).not.toThrow();
  });

  it('satisfies the TriggerInterface contract', () => {
    const trigger: TriggerInterface = neverFired;
    expect(typeof trigger.triggerSubscribe).toBe('function');
  });
});

describe('elementObservable', () => {
  it('passes the element and fire callback through to observe', () => {
    const element = document.createElement('div');
    const fire = vi.fn();
    const observe = vi.fn(() => () => {});

    const trigger = elementObservable(observe);
    trigger.triggerSubscribe(element, fire);

    expect(observe).toHaveBeenCalledWith(element, fire);
  });

  it('forwards the cleanup function returned by observe', () => {
    const cleanup = vi.fn();
    const trigger = elementObservable(() => cleanup);

    const returnedCleanup = trigger.triggerSubscribe(document.createElement('div'), vi.fn());
    returnedCleanup();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('calls fire when observe invokes it', () => {
    const fire = vi.fn();
    const trigger = elementObservable((_el: HTMLElement, f: () => void) => {
      f();
      return () => {};
    });

    trigger.triggerSubscribe(document.createElement('div'), fire);
    expect(fire).toHaveBeenCalledOnce();
  });
});
