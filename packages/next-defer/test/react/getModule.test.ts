import { describe, expect, it, vi } from 'vitest';
import { getModule } from '../../src/react/getModule';
import type { ModuleCache } from '../../src/react/interfaces/module.interface';

describe('getModule', () => {
  it('calls load on the first call', async () => {
    const cache: ModuleCache<string> = { current: null };
    const load = vi.fn(() => Promise.resolve('module'));

    await expect(getModule(cache, load)).resolves.toBe('module');
    expect(load).toHaveBeenCalledOnce();
  });

  it('does not call load again on later calls', async () => {
    const cache: ModuleCache<string> = { current: null };
    const load = vi.fn(() => Promise.resolve('module'));

    getModule(cache, load);
    getModule(cache, load);
    await getModule(cache, load);

    expect(load).toHaveBeenCalledOnce();
  });

  it('ignores a different load reference once cached', async () => {
    const cache: ModuleCache<string> = { current: null };
    const firstLoad = vi.fn(() => Promise.resolve('first'));
    const secondLoad = vi.fn(() => Promise.resolve('second'));

    await getModule(cache, firstLoad);
    const result = await getModule(cache, secondLoad);

    expect(result).toBe('first');
    expect(secondLoad).not.toHaveBeenCalled();
  });

  it('returns the exact same promise across calls', () => {
    const cache: ModuleCache<string> = { current: null };
    const load = vi.fn(() => Promise.resolve('module'));

    const first = getModule(cache, load);
    const second = getModule(cache, load);

    expect(first).toBe(second);
  });
});
