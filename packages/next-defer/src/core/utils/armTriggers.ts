import { idle } from '../triggers/idle';
import { timer } from '../triggers/timer';
import { domTriggerRegistry } from './domTriggerRegistry';
import type { NormalizedTrigger } from '../types/trigger.types';

export function armTriggers(
  element: HTMLElement,
  trigger: NormalizedTrigger,
  fire: () => void,
): () => void {
  switch (trigger.kind) {
    case 'idle':
      return idle(trigger.timeout).triggerSubscribe(element, fire);
    case 'timer':
      return timer(trigger.ms).triggerSubscribe(element, fire);
    case 'viewport':
      return domTriggerRegistry.viewport(trigger).triggerSubscribe(element, fire);
    case 'interaction':
      return domTriggerRegistry.interaction().triggerSubscribe(element, fire);
    case 'hover':
      return domTriggerRegistry.hover().triggerSubscribe(element, fire);
    case 'when':
      if (trigger.value) {
        fire();
      }
      return () => {};
  }
}
