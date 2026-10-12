import { RefObject } from "react";
import { DeferState } from "../types/useDefer.types";

export interface UseDeferResult {
  ref: RefObject<HTMLElement | null>;
  state: DeferState;
}