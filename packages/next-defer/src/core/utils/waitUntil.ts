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
