import { hover } from '../triggers/hover';
import { interaction } from '../triggers/interaction';
import { viewport } from '../triggers/viewport';
import type { NormalizedTrigger } from '../types/trigger.types';

export const domTriggerRegistry = {
  viewport: (trigger: Extract<NormalizedTrigger, { kind: 'viewport' }>) =>
    viewport({ rootMargin: trigger.rootMargin, threshold: trigger.threshold }),
  interaction: () => interaction(),
  hover: () => hover()
};
