import { useEffect, useMemo, useRef, useState } from 'react';
import { armTriggers } from '../core/utils/armTriggers';
import { normalize } from '../core/utils/normalize';
import { triggersKey } from '../core/utils/triggersKey';
import { getModule } from './getModule';
import type { DeferState, LoadResult } from './types/useDefer.types';
import type { UseDeferOptions, UseDeferResult } from './interfaces/useDefer.interface';

export function useDefer<T>(load: () => Promise<T>, options: UseDeferOptions = {}): UseDeferResult {
  const { on } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [triggered, setTriggered] = useState(false);
  const [result, setResult] = useState<LoadResult>('pending');
  const [attempt, setAttempt] = useState(0);
  const moduleCache = useRef<Promise<T> | null>(null);

  const triggerList = Array.isArray(on) ? on : [on];
  const key = triggerList.map((item) => triggersKey(item)).join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` is a stable stand-in for `triggerList`'s identity; depending on it directly would re-normalize on every render.
  const normalizedList = useMemo(() => triggerList.map((item) => normalize(item)), [key]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    return armTriggers(ref.current, normalizedList, () => setTriggered(true));
  }, [normalizedList]);

  useEffect(() => {
    if (!triggered) {
      return;
    }

    getModule(moduleCache, load).then(
      () => setResult('visible'),
      () => setResult('error'),
    );
  }, [triggered, load, attempt]);

  function retry(): void {
    if (result !== 'error') {
      return;
    }

    moduleCache.current = null;
    setResult('pending');
    setAttempt((previous) => previous + 1);
  }

  const state: DeferState = !triggered ? 'placeholder' : result === 'pending' ? 'loading' : result;

  return { ref, state, triggered, retry };
}
