import { useEffect, useMemo, useRef, useState } from 'react';
import { armTriggers } from '../core/utils/armTriggers';
import { normalize } from '../core/utils/normalize';
import { triggersKey } from '../core/utils/triggersKey';
import { parseDuration } from '../core/utils/duration';
import { getModule } from './getModule';
import type { DeferState, LoadResult } from './types/useDefer.types';
import type { UseDeferOptions, UseDeferResult } from './interfaces/useDefer.interface';

export function useDefer<T>(load: () => Promise<T>, options: UseDeferOptions = {}): UseDeferResult<T> {
  const { on, prefetch, loadingDelay, minPlaceholderTime, minLoadingTime, onStateChange } = options;
  const ref = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLElement | null>(null);
  const [triggered, setTriggered] = useState(false);
  const [result, setResult] = useState<LoadResult>('pending');
  const [module, setModule] = useState<T | null>(null);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [placeholderMinIsOver, setPlaceholderMinIsOver] = useState(minPlaceholderTime === undefined);
  const [loadingMinIsOver, setLoadingMinIsOver] = useState(minLoadingTime === undefined);
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

    return armTriggers(ref.current, viewportRef.current, normalizedList, () => setTriggered(true));
  }, [normalizedList]);

  useEffect(() => {
    if (!ref.current || normalizedPrefetchList.length === 0) {
      return;
    }

    return armTriggers(ref.current, viewportRef.current, normalizedPrefetchList, () => {
      getModule(moduleCache, load).catch(() => {});
    });
  }, [normalizedPrefetchList, load]);

  useEffect(() => {
    if (!triggered) {
      return;
    }

    getModule(moduleCache, load).then(
      (resolved) => {
        setModule(resolved);
        setResult('visible');
      },
      () => setResult('error'),
    );
  }, [triggered, load, attempt]);

  useEffect(() => {
    if (!triggered || loadingDelay === undefined || result !== 'pending') {
      return;
    }

    const id = setTimeout(() => setLoadingVisible(true), parseDuration(loadingDelay));
    return () => clearTimeout(id);
  }, [triggered, loadingDelay, attempt, result]);

  useEffect(() => {
    if (minPlaceholderTime === undefined) {
      return;
    }

    const id = setTimeout(() => setPlaceholderMinIsOver(true), parseDuration(minPlaceholderTime));
    return () => clearTimeout(id);
  }, [minPlaceholderTime]);

  useEffect(() => {
    if (!triggered || minLoadingTime === undefined) {
      return;
    }

    const offset = loadingDelay === undefined ? 0 : parseDuration(loadingDelay);
    const id = setTimeout(() => setLoadingMinIsOver(true), offset + parseDuration(minLoadingTime));
    return () => clearTimeout(id);
  }, [triggered, loadingDelay, minLoadingTime, attempt]);

  function retry(): void {
    if (result !== 'error') {
      return;
    }

    moduleCache.current = null;
    setResult('pending');
    setModule(null);
    setLoadingVisible(false);
    setLoadingMinIsOver(minLoadingTime === undefined);
    setAttempt((previous) => previous + 1);
  }

  const isLoadingNow = loadingDelay === undefined || loadingVisible;
  const resultReady = result !== 'pending' && (!isLoadingNow || loadingMinIsOver);

  const state: DeferState = !placeholderMinIsOver
    ? 'placeholder'
    : !triggered
      ? 'placeholder'
      : resultReady
        ? result
        : isLoadingNow
          ? 'loading'
          : 'placeholder';

  const onStateChangeRef = useRef(onStateChange);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  });

  useEffect(() => {
    onStateChangeRef.current?.(state);
  }, [state]);

  return { ref, viewportRef, state, triggered, retry, module };
}
