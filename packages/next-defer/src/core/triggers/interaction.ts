import { onEvents } from '../utils/onEvents';
import { elementObservable } from '../utils/trigger';
import { INTERACTION_EVENTS } from '../constants/interaction.constants';
import type { TriggerInterface } from '../interfaces/trigger.interface';

export function interaction(): TriggerInterface {
  return elementObservable((element, fire) => onEvents(element, INTERACTION_EVENTS, fire));
}
