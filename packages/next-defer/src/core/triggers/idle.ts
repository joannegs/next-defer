import { parseDuration } from '../utils/duration';
import type { TriggerInterface } from '../interfaces/trigger.interface';

export function idle(timeout?: number | string): TriggerInterface {
  const timeoutMs = timeout === undefined ? undefined : parseDuration(timeout);

  return {
    triggerSubscribe(_element, fire) {
      if (typeof requestIdleCallback === 'function') {
        const handle =
          timeoutMs === undefined
            ? requestIdleCallback(fire)
            : requestIdleCallback(fire, { timeout: timeoutMs });

        return () => cancelIdleCallback(handle);
      }

      // to old browsers that don't support requestIdleCallback
      const id = setTimeout(fire, 1);
      return () => clearTimeout(id);
    },
  };
}
