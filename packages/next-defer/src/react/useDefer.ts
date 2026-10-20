import { useEffect, useMemo, useRef, useState } from 'react';
import { armTriggers } from '../core/utils/armTriggers';
import { normalize } from '../core/utils/normalize';
import { triggersKey } from '../core/utils/triggersKey';
import { getModule } from './getModule';
import type { DeferState, LoadResult } from './types/useDefer.types';
import type { UseDeferOptions, UseDeferResult } from './interfaces/useDefer.interface';

export function useDefer<T>(load: () => Promise<T>, options: UseDeferOptions = {}): UseDeferResult {
  const { on, prefetch } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [triggered, setTriggered] = useState(false);
  const [result, setResult] = useState<LoadResult>('pending');
  const [attempt, setAttempt] = useState(0);
  const moduleCache = useRef<Promise<T> | null>(null);

  const triggerList = Array.isArray(on) ? on : [on];
  const key = triggerList.map((item) => triggersKey(item)).join('|');
  const normalizedList = useMemo(() => triggerList.map((item) => normalize(item)), [key]);

  const prefetchList = prefetch === undefined ? [] : Array.isArray(prefetch) ? prefetch : [prefetch];
  const prefetchKey = prefetchList.map((item) => triggersKey(item)).join('|');
  const normalizedPrefetchList = useMemo(() => prefetchList.map((item) => normalize(item)), [prefetchKey]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    return armTriggers(ref.current, normalizedList, () => setTriggered(true));
  }, [normalizedList]);

  useEffect(() => {
    if (!ref.current || normalizedPrefetchList.length === 0) {
      return;
    }

    return armTriggers(ref.current, normalizedPrefetchList, () => {
      getModule(moduleCache, load).catch(() => {});
    });
  }, [normalizedPrefetchList, load]);

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
