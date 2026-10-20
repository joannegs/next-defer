import { DeferState } from "../types/useDefer.types";
import { Trigger } from "../../core/types/trigger.types";

export interface UseDeferResult {
  ref: React.MutableRefObject<HTMLElement | null>;
  state: DeferState;
  triggered: boolean;
  retry: () => void;
}

export interface UseDeferOptions {
  on?: Trigger | Trigger[];
}