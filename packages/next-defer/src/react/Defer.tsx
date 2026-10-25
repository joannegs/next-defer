import type { RefObject } from 'react';
import { useDefer } from './useDefer';
import type { DeferProps } from './interfaces/defer.interface';

export function Defer<P extends object = object>({
  load,
  placeholder,
  loading,
  error,
  props,
  ...options
}: DeferProps<P>) {
  const { ref, state, module, retry } = useDefer(load, options);
  const Component = module?.default;

  return (
    <span
      ref={ref as RefObject<HTMLSpanElement>}
      style={{ display: 'contents' }}
      aria-busy={state === 'loading' || undefined}
    >
      {state === 'placeholder' ? placeholder : null}
      {state === 'loading' ? loading : null}
      {state === 'error' ? (typeof error === 'function' ? error(retry) : error) : null}
      {state === 'visible' && Component ? <Component {...(props as P)} /> : null}
    </span>
  );
}
