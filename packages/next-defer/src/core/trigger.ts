import type { TriggerImpl } from './interfaces/triggerImpl.interface';

/**
 * Builds a trigger that observes a real DOM element.
 *
 * The element is switched to `display: contents` before `observe` runs,
 * so the wrapper never participates in layout.
 *
 * @param observe - Starts watching `element` and must call `fire` at most
 * once. Returns a cleanup function.
 *
 * @example
 * const onIntersect = observable((element, fire) => {
 *   const observer = new IntersectionObserver(([entry]) => {
 *     if (entry.isIntersecting) fire();
 *   });
 *   observer.observe(element);
 *   return () => observer.disconnect();
 * });
 */
export function observable(
  observe: (element: HTMLElement, fire: () => void) => () => void,
): TriggerImpl {
  return {
    subscribe(element, fire) {
      element.style.display = 'contents';
      return observe(element, fire);
    },
  };
}
