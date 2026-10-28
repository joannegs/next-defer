import { afterEach, describe, expect, it, vi } from 'vitest';
import { armTriggers } from '../../../src/core/utils/armTriggers';
import { mockIntersectionObserver } from '../../mocks/intersectionObserver';
import type { ElementRef } from '../../../src/core/types/trigger.types';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('armTriggers', () => {
  describe('single trigger', () => {
    it('dispatches "idle" to the idle trigger', () => {
      vi.useFakeTimers();
      vi.stubGlobal('requestIdleCallback', undefined);
      vi.stubGlobal('cancelIdleCallback', undefined);

      const fire = vi.fn();
      armTriggers(document.createElement('div'), null, [{ kind: 'idle' }], fire);

      vi.advanceTimersByTime(1);
      expect(fire).toHaveBeenCalledOnce();
    });

    it('dispatches "timer" to the timer trigger', () => {
      vi.useFakeTimers();

      const fire = vi.fn();
      armTriggers(document.createElement('div'), null, [{ kind: 'timer', ms: 1000 }], fire);

      vi.advanceTimersByTime(999);
      expect(fire).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(fire).toHaveBeenCalledOnce();
    });

    it('dispatches "viewport" to the viewport trigger, observing the viewport fallback', () => {
      const io = mockIntersectionObserver();
      const element = document.createElement('div');
      const viewportFallback = document.createElement('div');
      const fire = vi.fn();

      armTriggers(element, viewportFallback, [{ kind: 'viewport', rootMargin: '200px' }], fire);
      io.trigger(viewportFallback, true);

      expect(fire).toHaveBeenCalledOnce();
      expect(io.instances[0]!.options).toEqual({ rootMargin: '200px' });
    });

    it('dispatches "interaction" to the interaction trigger', () => {
      const element = document.createElement('div');
      const fire = vi.fn();

      armTriggers(element, null, [{ kind: 'interaction' }], fire);
      element.dispatchEvent(new Event('click'));

      expect(fire).toHaveBeenCalledOnce();
    });

    it('dispatches "hover" to the hover trigger', () => {
      const element = document.createElement('div');
      const fire = vi.fn();

      armTriggers(element, null, [{ kind: 'hover' }], fire);
      element.dispatchEvent(new Event('mouseenter'));

      expect(fire).toHaveBeenCalledOnce();
    });

    it('fires immediately when "when" is true', () => {
      const fire = vi.fn();
      armTriggers(document.createElement('div'), null, [{ kind: 'when', value: true }], fire);

      expect(fire).toHaveBeenCalledOnce();
    });

    it('does not fire when "when" is false', () => {
      const fire = vi.fn();
      armTriggers(document.createElement('div'), null, [{ kind: 'when', value: false }], fire);

      expect(fire).not.toHaveBeenCalled();
    });

    it('returns a cleanup function that stops a pending timer trigger', () => {
      vi.useFakeTimers();

      const fire = vi.fn();
      const cleanup = armTriggers(document.createElement('div'), null, [{ kind: 'timer', ms: 1000 }], fire);

      cleanup();
      vi.advanceTimersByTime(1000);

      expect(fire).not.toHaveBeenCalled();
    });
  });

  describe('OR combination', () => {
    it('fires once whichever trigger wins, and disarms the others', () => {
      vi.useFakeTimers();

      const fire = vi.fn();
      armTriggers(
        document.createElement('div'),
        null,
        [{ kind: 'timer', ms: 1000 }, { kind: 'timer', ms: 2000 }],
        fire,
      );

      vi.advanceTimersByTime(1000);
      expect(fire).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(1000);
      expect(fire).toHaveBeenCalledOnce();
    });

    it('fires at most once even if two triggers settle in the same tick', () => {
      vi.useFakeTimers();

      const fire = vi.fn();
      armTriggers(
        document.createElement('div'),
        null,
        [{ kind: 'timer', ms: 1000 }, { kind: 'timer', ms: 1000 }],
        fire,
      );

      vi.advanceTimersByTime(1000);
      expect(fire).toHaveBeenCalledOnce();
    });

    it('cleanup disarms every trigger in the combination', () => {
      vi.useFakeTimers();

      const fire = vi.fn();
      const cleanup = armTriggers(
        document.createElement('div'),
        null,
        [{ kind: 'timer', ms: 1000 }, { kind: 'timer', ms: 2000 }],
        fire,
      );

      cleanup();
      vi.advanceTimersByTime(2000);

      expect(fire).not.toHaveBeenCalled();
    });
  });

  describe('"when" short-circuit', () => {
    it('fires immediately and arms nothing else when when:true is combined with another trigger', () => {
      vi.useFakeTimers();

      const fire = vi.fn();
      armTriggers(
        document.createElement('div'),
        null,
        [{ kind: 'when', value: true }, { kind: 'timer', ms: 1000 }],
        fire,
      );

      expect(fire).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(1000);
      expect(fire).toHaveBeenCalledOnce();
    });

    it('contributes nothing when when:false is combined with another trigger', () => {
      vi.useFakeTimers();

      const fire = vi.fn();
      armTriggers(
        document.createElement('div'),
        null,
        [{ kind: 'when', value: false }, { kind: 'timer', ms: 1000 }],
        fire,
      );

      vi.advanceTimersByTime(1000);
      expect(fire).toHaveBeenCalledOnce();
    });
  });

  describe('ref targeting', () => {
    it('observes the ref target instead of the element when given', () => {
      const io = mockIntersectionObserver();
      const wrapper = document.createElement('div');
      const other = document.createElement('div');
      const ref: ElementRef = { current: other };
      const fire = vi.fn();

      armTriggers(wrapper, null, [{ kind: 'viewport', ref }], fire);

      io.trigger(wrapper, true);
      expect(fire).not.toHaveBeenCalled();

      io.trigger(other, true);
      expect(fire).toHaveBeenCalledOnce();
    });

    it('observes the viewport fallback instead of the wrapper when no ref is given', () => {
      const io = mockIntersectionObserver();
      const wrapper = document.createElement('div');
      const viewportFallback = document.createElement('div');
      const fire = vi.fn();

      armTriggers(wrapper, viewportFallback, [{ kind: 'viewport' }], fire);

      io.trigger(wrapper, true);
      expect(fire).not.toHaveBeenCalled();

      io.trigger(viewportFallback, true);
      expect(fire).toHaveBeenCalledOnce();
    });

    it('listens on the ref target for interaction', () => {
      const wrapper = document.createElement('div');
      const other = document.createElement('div');
      const ref: ElementRef = { current: other };
      const fire = vi.fn();

      armTriggers(wrapper, null, [{ kind: 'interaction', ref }], fire);

      wrapper.dispatchEvent(new Event('click'));
      expect(fire).not.toHaveBeenCalled();

      other.dispatchEvent(new Event('click'));
      expect(fire).toHaveBeenCalledOnce();
    });

    it('falls back to the element when no ref is given', () => {
      const element = document.createElement('div');
      const fire = vi.fn();

      armTriggers(element, null, [{ kind: 'hover' }], fire);
      element.dispatchEvent(new Event('mouseenter'));

      expect(fire).toHaveBeenCalledOnce();
    });

    it('arms nothing when ref.current is null', () => {
      const element = document.createElement('div');
      const ref: ElementRef = { current: null };
      const fire = vi.fn();

      const cleanup = armTriggers(element, null, [{ kind: 'hover', ref }], fire);

      element.dispatchEvent(new Event('mouseenter'));
      expect(fire).not.toHaveBeenCalled();
      expect(() => cleanup()).not.toThrow();
    });

    it('arms nothing for viewport when no ref is given and the fallback is null', () => {
      const element = document.createElement('div');
      const fire = vi.fn();

      const cleanup = armTriggers(element, null, [{ kind: 'viewport' }], fire);

      expect(() => cleanup()).not.toThrow();
      expect(fire).not.toHaveBeenCalled();
    });
  });
});
