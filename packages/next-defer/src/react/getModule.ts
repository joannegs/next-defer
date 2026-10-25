import { ModuleCache } from "./interfaces/module.interface";

export function getModule<T>(cache: ModuleCache<T>, load: () => Promise<T>): Promise<T> {
  if (cache.current === null) {
    cache.current = load();
  }

  return cache.current;
}
