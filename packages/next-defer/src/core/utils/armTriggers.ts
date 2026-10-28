import { idle } from '../triggers/idle';
import { timer } from '../triggers/timer';
import { domTriggerRegistry } from './domTriggerRegistry';
import type { ElementRef, NormalizedTrigger } from '../types/trigger.types';

type ArmableTrigger = Exclude<NormalizedTrigger, { kind: 'when' }>;

function resolveElement(element: HTMLElement | null, ref?: ElementRef): HTMLElement | null {
  return ref ? ref.current : element;
}

function armSinglesTrigger(
  element: HTMLElement,
  viewportFallback: HTMLElement | null,
  trigger: ArmableTrigger,
  fire: () => void,
): () => void {
  switch (trigger.kind) {
    case 'idle':
      return idle(trigger.timeout).triggerSubscribe(element, fire);
    case 'timer':
      return timer(trigger.ms).triggerSubscribe(element, fire);
    case 'viewport': {
      // the wrapper itself is `display: contents` (no layout box), so
      // IntersectionObserver can never see it intersect — fall back to a
      // sentinel element that does have a box when no custom ref is given.
      const target = resolveElement(viewportFallback, trigger.ref);
      return target ? domTriggerRegistry.viewport(trigger).triggerSubscribe(target, fire) : () => {};
    }
    case 'interaction': {
      const target = resolveElement(element, trigger.ref);
      return target ? domTriggerRegistry.interaction().triggerSubscribe(target, fire) : () => {};
    }
    case 'hover': {
      const target = resolveElement(element, trigger.ref);
      return target ? domTriggerRegistry.hover().triggerSubscribe(target, fire) : () => {};
    }
  }
}

export function armTriggers(
  element: HTMLElement,
  viewportFallback: HTMLElement | null,
  triggers: NormalizedTrigger[],
  fire: () => void,
): () => void {
  if (triggers.some((trigger) => trigger.kind === 'when' && trigger.value)) {
    fire();
    return () => {};
  }

  let fired = false;
  const cleanups: Array<() => void> = [];

  const disarmAll = () => {
    for(const cleanup of cleanups) {
      cleanup();
    }
  };

  const fireOnce = () => {
    if (fired) return;
    fired = true;
    disarmAll();
    fire();
  };

  for(const trigger of triggers) {
    if (trigger.kind === 'when') {
      continue;
    }
    cleanups.push(armSinglesTrigger(element, viewportFallback, trigger, fireOnce));
  }

  return disarmAll;
}
