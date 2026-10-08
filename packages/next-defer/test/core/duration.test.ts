import { describe, expect, it } from 'vitest';
import { parseDuration } from '../../src/core/duration';

describe('parseDuration', () => {
  describe('valid formats', () => {
    it.each([
      [0, 0],
      [500, 500],
      [1500.5, 1500.5],
      ['0ms', 0],
      ['500ms', 500],
      ['500 ms', 500],
      ['500MS', 500],
      ['1.5ms', 1.5],
      ['0s', 0],
      ['2s', 2000],
      ['2.5s', 2500],
      ['1.005s', 1005],
      ['2S', 2000],
      [' 10s ', 10000],
    ])('parses %p as %p ms', (input, expected) => {
      expect(parseDuration(input as number | string)).toBe(expected);
    });
  });

  describe('invalid formats', () => {
    it.each([
      [-1],
      [NaN],
      [Infinity],
      [-Infinity],
      [''],
      ['   '],
      ['500'],
      ['ms'],
      ['s'],
      ['-5ms'],
      ['5m'],
      ['5sec'],
      ['5 s s'],
      ['10.'],
      ['10..5s'],
      [null],
      [undefined],
      [{}],
      [[]],
    ])('throws for %p', (input) => {
      expect(() => parseDuration(input as unknown as number | string)).toThrow(TypeError);
    });
  });
});
