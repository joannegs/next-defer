import { elementObservable } from '../utils/trigger';
import type { TriggerInterface } from '../interfaces/trigger.interface';
import { ViewportOptions } from '../interfaces/viewport.interface';

export function viewport(options: ViewportOptions = {}): TriggerInterface {
  return elementObservable((element, fire) => {
    const observer = new IntersectionObserver(([elementEntry]) => {
      if (elementEntry?.isIntersecting) {
        observer.disconnect();
        fire();
      }
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  });
}
