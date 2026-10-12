import { useEffect, useMemo, useRef, useState } from 'react';
import { armTriggers } from '../core/utils/armTriggers';
import { normalize } from '../core/utils/normalize';
import { triggersKey } from '../core/utils/triggersKey';
import type { Trigger } from '../core/types/trigger.types';
import type { UseDeferResult } from './interfaces/useDefer.interface';

export function useDefer(trigger?: Trigger): UseDeferResult {
  const ref = useRef<HTMLElement | null>(null);
  const [triggered, setTriggered] = useState(false);

  const key = triggersKey(trigger);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` is a stable stand-in for `trigger`'s identity; depending on `trigger` itself would re-normalize on every render.
  const normalized = useMemo(() => normalize(trigger), [key]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    return armTriggers(ref.current, [normalized], () => setTriggered(true));
  }, [normalized]);

  return { ref, state: triggered ? 'visible' : 'placeholder' };
}
