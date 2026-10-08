import { parseDuration } from '../duration';
import type { TriggerImpl } from '../interfaces/triggerImpl.interface';

export function idle(timeout?: number | string): TriggerImpl {
  const timeoutMs = timeout === undefined ? undefined : parseDuration(timeout);

  return {
    subscribe(_element, fire) {
      if (typeof requestIdleCallback === 'function') {
        const handle =
          timeoutMs === undefined
            ? requestIdleCallback(fire)
            : requestIdleCallback(fire, { timeout: timeoutMs });

        return () => cancelIdleCallback(handle);
      }

      const id = setTimeout(fire, 1);
      return () => clearTimeout(id);
    },
  };
}
