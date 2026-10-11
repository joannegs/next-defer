import { parseDuration } from '../utils/duration';
import type { TriggerInterface } from '../interfaces/trigger.interface';

export function timer(duration: number | string): TriggerInterface {
  const delay = parseDuration(duration);

  return {
    triggerSubscribe(_element, fire) {
      const id = setTimeout(fire, delay);
      return () => clearTimeout(id);
    },
  };
}
