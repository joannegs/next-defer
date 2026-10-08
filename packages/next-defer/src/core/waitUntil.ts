/**
 * Returns a promise that resolves once the given instant has passed.
 *
 * If the instant is already in the past (or is now), the promise resolves
 * on the next timer tick instead of synchronously.
 *
 * @param instant - A timestamp in milliseconds in epoch, or a `Date`.
 * @returns A promise that resolves once `instant` has passed.
 * @throws {TypeError} When `instant` does not resolve to a finite timestamp.
 *
 * @example
 * await waitUntil(Date.now() + 2000);
 * await waitUntil(new Date('2030-01-01T00:00:00Z'));
 */
export function waitUntil(instant: number | Date): Promise<void> {
  const target = instant instanceof Date ? instant.getTime() : instant;

  if (!Number.isFinite(target)) {
    throw new TypeError(
      `Invalid instant: ${String(instant)}. Expected a finite timestamp or a Date.`,
    );
  }

  const delay = Math.max(0, target - Date.now());

  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}
