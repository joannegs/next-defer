import { Defer } from './Defer';
import type { DeferProps } from './interfaces/defer.interface';
import type { DeferredOptions } from './interfaces/deferred.interface';

export function deferred<P extends object = object>(
  load: DeferProps<P>['load'],
  options?: DeferredOptions<P>,
) {
  return function Deferred(props: P) {
    return <Defer load={load} {...options} props={props} />;
  };
}
