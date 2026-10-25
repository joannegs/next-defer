export interface ModuleCache<T> {
  current: Promise<T> | null;
}