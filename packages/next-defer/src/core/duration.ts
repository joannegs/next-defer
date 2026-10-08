const DURATION_PATTERN = /^(\d+(?:\.\d+)?)\s*(ms|s)$/i;

/**
 * Converts a duration value into milliseconds.
 *
 * A plain number is interpreted as milliseconds. A string must include an
 * explicit unit, such as `"500ms"` or `"2s"`.
 *
 * @param input - A non-negative number in milliseconds or a string
 * containing a numeric value with `ms` or `s`.
 * @returns The input in milliseconds.
 * @throws {TypeError} When `input` is negative, non-finite, malformed or
 * uses an unsupported unit.
 *
 * @example
 * parseDuration(500); // 500
 * parseDuration("2s"); // 2000
 * parseDuration("1.5s"); // 1500
 * parseDuration("500ms"); // 500
 */
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
