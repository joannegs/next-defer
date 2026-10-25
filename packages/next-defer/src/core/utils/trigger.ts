import type { TriggerInterface } from '../interfaces/trigger.interface';

export function elementObservable(
  observe: (element: HTMLElement, fire: () => void) => () => void,
): TriggerInterface {
  return {
    triggerSubscribe(element, fire) {
      // display: contents so the element won't generate a box, but its children will still be rendered 
      element.style.display = 'contents';
      return observe(element, fire);
    },
  };
}
