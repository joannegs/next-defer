import { ComponentType, ReactNode } from "react";
import { UseDeferOptions } from "./useDefer.interface";

export interface DeferProps<P extends object = object> extends UseDeferOptions {
  load: () => Promise<{ default: ComponentType<P> }>;
  placeholder?: ReactNode;
  loading?: ReactNode;
  error?: ReactNode | ((retry: () => void) => ReactNode);
  props?: P;
}
