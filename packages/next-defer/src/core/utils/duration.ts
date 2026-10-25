import { DURATION_PATTERN } from '../constants/durations.constants';

export function parseDuration(input: number | string): number {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input < 0) {
      throw new TypeError(
        `Invalid duration: ${input}. Expected a finite, non-negative number of milliseconds.`,
      );
    }
    return input;
  }

  if (typeof input === 'string') {
    const match = DURATION_PATTERN.exec(input.trim());

    if (!match) {
      throw new TypeError(
        `Invalid duration: "${input}". Expected a number or a string like "500ms" or "2s".`,
      );
    }

    const value = match[1]!;
    const unit = match[2]!;
    const amount = Number(value);

    return unit.toLowerCase() === 's' ? Math.round(amount * 1000) : amount;
  }

  throw new TypeError(`Invalid duration: ${String(input)}. Expected a number or string.`);
}
