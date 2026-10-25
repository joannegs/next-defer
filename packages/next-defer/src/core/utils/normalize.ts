import { parseDuration } from './duration';
import type { NormalizedTrigger, Trigger } from '../types/trigger.types';

export function normalize(trigger?: Trigger): NormalizedTrigger {
  if (!trigger) {
    return { kind: 'idle' };
  }

  if (typeof trigger === 'string') {
    return { kind: trigger };
  }

  if ('idle' in trigger) {
    return { kind: 'idle', timeout: trigger.idle.timeout };
  }

  if ('viewport' in trigger) {
    return { kind: 'viewport', ...trigger.viewport };
  }

  if ('interaction' in trigger) {
    return { kind: 'interaction', ref: trigger.interaction.ref };
  }

  if ('hover' in trigger) {
    return { kind: 'hover', ref: trigger.hover.ref };
  }

  if ('timer' in trigger) {
    return { kind: 'timer', ms: parseDuration(trigger.timer) };
  }

  return { kind: 'when', value: trigger.when };
}
