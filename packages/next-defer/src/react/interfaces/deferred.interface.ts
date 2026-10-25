import { DeferProps } from "./defer.interface";

export type DeferredOptions<P extends object = object> = Omit<DeferProps<P>, "load" | "props">;
