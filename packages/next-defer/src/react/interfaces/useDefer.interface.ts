import { DeferState } from "../types/useDefer.types";
import { Trigger } from "../../core/types/trigger.types";
import { Duration } from "../../core/types/duration.types";

export interface UseDeferResult<T> {
  ref: React.MutableRefObject<HTMLElement | null>;
  state: DeferState;
  triggered: boolean;
  retry: () => void;
  module: T | null;
}

export interface UseDeferOptions {
  on?: Trigger | Trigger[];
  prefetch?: Trigger | Trigger[];
  loadingDelay?: Duration;
  minPlaceholderTime?: Duration;
  minLoadingTime?: Duration;
  onStateChange?: (state: DeferState) => void;
}