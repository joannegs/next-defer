import { parseDuration } from '../duration';
import type { TriggerImpl } from '../interfaces/triggerImpl.interface';

/**
 * A trigger that runs after a fixed amount of time.
 *
 * Calling the cleanup function returned by subscribe cancels the timer. 
 * If it is canceled in time, fire will not run.
 *
 * @param duration - A non-negative number in milliseconds, or a
 * string with the `ms` or `s` unit. See {@link parseDuration}.
 * @throws {TypeError} When `duration` is invalid. See {@link parseDuration}.
 *
 * @example
 * const trigger = timer('2s');
 * const unsubscribe = trigger.subscribe(element, show);
 * // later, if the content shows for another reason first:
 * unsubscribe();
 */
export function timer(duration: number | string): TriggerImpl {
  const delay = parseDuration(duration);

  return {
    subscribe(_element, fire) {
      const id = setTimeout(fire, delay);
      return () => clearTimeout(id);
    },
  };
}
