import type { Trigger } from '../types/trigger.types';

export function triggersKey(trigger: Trigger = 'idle'): string {
  if (typeof trigger === 'string') {
    return trigger;
  }

  const [kind, config] = Object.entries(trigger)[0]!;

  if (typeof config !== 'object' || config === null) {
    return `${kind}:${JSON.stringify(config)}`;
  }

  const withoutRef = Object.fromEntries(Object.entries(config).filter(([key]) => key !== 'ref'));

  return `${kind}:${JSON.stringify(withoutRef)}`;
}
