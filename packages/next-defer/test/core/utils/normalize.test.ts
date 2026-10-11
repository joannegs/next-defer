import { describe, expect, it } from 'vitest';
import { normalize } from '../../../src/core/utils/normalize';
import type { ElementRef, Trigger } from '../../../src/core/types/trigger.types';

const ref: ElementRef = { current: null };

describe('normalize', () => {
  it('falls back to idle when no trigger is given', () => {
    expect(normalize()).toEqual({ kind: 'idle' });
    expect(normalize(undefined)).toEqual({ kind: 'idle' });
  });

  it.each(['idle', 'viewport', 'interaction', 'hover'] as const)(
    'converts the "%s" string shorthand',
    (trigger) => {
      expect(normalize(trigger)).toEqual({ kind: trigger });
    },
  );

  it('converts { idle } with a timeout', () => {
    expect(normalize({ idle: { timeout: 500 } })).toEqual({ kind: 'idle', timeout: 500 });
  });

  it('converts { idle } without a timeout', () => {
    expect(normalize({ idle: {} })).toEqual({ kind: 'idle' });
  });

  it('converts { viewport } with its options', () => {
    expect(normalize({ viewport: { ref, rootMargin: '200px', threshold: 0.5 } })).toEqual({
      kind: 'viewport',
      ref,
      rootMargin: '200px',
      threshold: 0.5,
    });
  });

  it('converts { viewport } with no options', () => {
    expect(normalize({ viewport: {} })).toEqual({ kind: 'viewport' });
  });

  it('converts { interaction }', () => {
    expect(normalize({ interaction: { ref } })).toEqual({ kind: 'interaction', ref });
  });

  it('converts { hover }', () => {
    expect(normalize({ hover: { ref } })).toEqual({ kind: 'hover', ref });
  });

  it('converts { timer } from a number', () => {
    expect(normalize({ timer: 500 })).toEqual({ kind: 'timer', ms: 500 });
  });

  it('converts { timer } from a duration string', () => {
    expect(normalize({ timer: '2s' })).toEqual({ kind: 'timer', ms: 2000 });
  });

  it('propagates the parseDuration error for an invalid { timer }', () => {
    const invalid = { timer: 'not-a-duration' } as unknown as Trigger;
    expect(() => normalize(invalid)).toThrow(TypeError);
  });

  it.each([true, false])('converts { when: %s }', (value) => {
    expect(normalize({ when: value })).toEqual({ kind: 'when', value });
  });
});
