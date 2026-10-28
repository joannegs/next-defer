import type { TriggerInterface } from '../interfaces/trigger.interface';

export function elementObservable(
  observe: (element: HTMLElement, fire: () => void) => () => void,
): TriggerInterface {
  return {
    triggerSubscribe(element, fire) {
      return observe(element, fire);
    },
  };
}
