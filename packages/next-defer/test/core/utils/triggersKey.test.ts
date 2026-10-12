import { describe, expect, it } from 'vitest';
import { triggersKey } from '../../../src/core/utils/triggersKey';
import type { ElementRef } from '../../../src/core/types/trigger.types';

describe('triggersKey', () => {
  it('defaults to "idle" when no trigger is given', () => {
    expect(triggersKey()).toBe('idle');
  });

  it.each(['idle', 'viewport', 'interaction', 'hover'] as const)(
    'returns the "%s" string shorthand as-is',
    (trigger) => {
      expect(triggersKey(trigger)).toBe(trigger);
    },
  );

  it('encodes { idle } options', () => {
    expect(triggersKey({ idle: { timeout: 500 } })).toBe('idle:{"timeout":500}');
  });

  it('encodes { timer } from a number', () => {
    expect(triggersKey({ timer: 500 })).toBe('timer:500');
  });

  it('encodes { timer } from a duration string', () => {
    expect(triggersKey({ timer: '2s' })).toBe('timer:"2s"');
  });

  it('gives different timer durations different keys', () => {
    expect(triggersKey({ timer: 500 })).not.toBe(triggersKey({ timer: 1000 }));
  });

  it.each([true, false])('encodes { when: %s }', (value) => {
    expect(triggersKey({ when: value })).toBe(`when:${value}`);
  });

  it('gives when:true and when:false different keys', () => {
    expect(triggersKey({ when: true })).not.toBe(triggersKey({ when: false }));
  });

  it('ignores ref identity: same config with different refs produces the same key', () => {
    const refA: ElementRef = { current: null };
    const refB: ElementRef = { current: document.createElement('div') };

    const keyA = triggersKey({ viewport: { ref: refA, rootMargin: '200px', threshold: 0.5 } });
    const keyB = triggersKey({ viewport: { ref: refB, rootMargin: '200px', threshold: 0.5 } });

    expect(keyA).toBe(keyB);
    expect(keyA).toBe('viewport:{"rootMargin":"200px","threshold":0.5}');
  });

  it('strips ref even when nothing else is configured', () => {
    const ref: ElementRef = { current: null };
    expect(triggersKey({ interaction: { ref } })).toBe('interaction:{}');
    expect(triggersKey({ hover: { ref } })).toBe('hover:{}');
  });
});
