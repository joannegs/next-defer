import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import type { RefObject } from 'react';
import { useDefer } from '../../src/react/useDefer';
import type { Trigger } from '../../src/core/types/trigger.types';
import type { Duration } from '../../src/core/types/duration.types';

async function flushMicrotasks() {
  await act(async () => {});
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function Probe({
  load,
  on,
  prefetch,
  loadingDelay,
  minPlaceholderTime,
  minLoadingTime,
  onStateChange,
}: {
  load: () => Promise<unknown>;
  on?: Trigger | Trigger[];
  prefetch?: Trigger | Trigger[];
  loadingDelay?: Duration;
  minPlaceholderTime?: Duration;
  minLoadingTime?: Duration;
  onStateChange?: (state: string) => void;
}) {
  const { ref, state, retry } = useDefer(load, {
    on,
    prefetch,
    loadingDelay,
    minPlaceholderTime,
    minLoadingTime,
    onStateChange,
  });
  return (
    <>
      <div ref={ref as RefObject<HTMLDivElement>} data-testid="target">
        {state}
      </div>
      <button data-testid="retry" onClick={retry}>
        retry
      </button>
    </>
  );
}

describe('useDefer', () => {
  it('starts with state "placeholder" and does not call load yet', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
    vi.stubGlobal('cancelIdleCallback', undefined);

    const load = vi.fn(() => Promise.resolve());
    const { getByTestId } = render(<Probe load={load} />);

    expect(getByTestId('target').textContent).toBe('placeholder');
    expect(load).not.toHaveBeenCalled();
  });

  it('loads and becomes "visible" once the timer trigger fires', async () => {
    vi.useFakeTimers();

    const load = vi.fn(() => Promise.resolve());
    const { getByTestId } = render(<Probe load={load} on={{ timer: 1000 }} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(getByTestId('target').textContent).toBe('loading');
    expect(load).toHaveBeenCalledOnce();

    await flushMicrotasks();
    expect(getByTestId('target').textContent).toBe('visible');
  });

  it('becomes "visible" once the interaction trigger fires', async () => {
    const load = vi.fn(() => Promise.resolve());
    const { getByTestId } = render(<Probe load={load} on="interaction" />);

    fireEvent.click(getByTestId('target'));

    await waitFor(() => expect(getByTestId('target').textContent).toBe('visible'));
  });

  it('becomes "error" when load rejects', async () => {
    const load = vi.fn(() => Promise.reject(new Error('boom')));
    const { getByTestId } = render(<Probe load={load} on="interaction" />);

    fireEvent.click(getByTestId('target'));

    await waitFor(() => expect(getByTestId('target').textContent).toBe('error'));
  });

  it('fires once whichever trigger in the array wins', async () => {
    vi.useFakeTimers();

    const load = vi.fn(() => Promise.resolve());
    const { getByTestId } = render(<Probe load={load} on={[{ timer: 1000 }, { timer: 2000 }]} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await flushMicrotasks();
    expect(getByTestId('target').textContent).toBe('visible');
    expect(load).toHaveBeenCalledOnce();
  });

  it('disarms the trigger on unmount without throwing', () => {
    vi.useFakeTimers();

    const load = vi.fn(() => Promise.resolve());
    const { unmount } = render(<Probe load={load} on={{ timer: 1000 }} />);
    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }).not.toThrow();
  });

  it('keeps the same timer running across a re-render with an equivalent trigger', async () => {
    vi.useFakeTimers();

    const load = vi.fn(() => Promise.resolve());
    const { rerender, getByTestId } = render(<Probe load={load} on={{ timer: 1000 }} />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender(<Probe load={load} on={{ timer: 1000 }} />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await flushMicrotasks();
    expect(getByTestId('target').textContent).toBe('visible');
  });

  describe('retry', () => {
    it('reloads after an error and becomes "visible" on success', async () => {
      const load = vi.fn<() => Promise<unknown>>();
      load.mockImplementationOnce(() => Promise.reject(new Error('boom')));
      load.mockImplementationOnce(() => Promise.resolve());

      const { getByTestId } = render(<Probe load={load} on="interaction" />);

      fireEvent.click(getByTestId('target'));
      await waitFor(() => expect(getByTestId('target').textContent).toBe('error'));

      fireEvent.click(getByTestId('retry'));

      expect(getByTestId('target').textContent).toBe('loading');
      await waitFor(() => expect(getByTestId('target').textContent).toBe('visible'));
      expect(load).toHaveBeenCalledTimes(2);
    });

    it('can land on "error" again after a failed retry', async () => {
      const load = vi.fn(() => Promise.reject(new Error('boom')));
      const { getByTestId } = render(<Probe load={load} on="interaction" />);

      fireEvent.click(getByTestId('target'));
      await waitFor(() => expect(getByTestId('target').textContent).toBe('error'));

      fireEvent.click(getByTestId('retry'));
      await waitFor(() => expect(getByTestId('target').textContent).toBe('error'));

      expect(load).toHaveBeenCalledTimes(2);
    });

    it('does nothing when called before anything was ever triggered', () => {
      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(<Probe load={load} on="interaction" />);

      fireEvent.click(getByTestId('retry'));

      expect(getByTestId('target').textContent).toBe('placeholder');
      expect(load).not.toHaveBeenCalled();
    });

    it('does nothing while the module is already visible', async () => {
      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(<Probe load={load} on="interaction" />);

      fireEvent.click(getByTestId('target'));
      await waitFor(() => expect(getByTestId('target').textContent).toBe('visible'));

      fireEvent.click(getByTestId('retry'));

      expect(getByTestId('target').textContent).toBe('visible');
      expect(load).toHaveBeenCalledOnce();
    });
  });

  describe('prefetch', () => {
    it('calls load without displaying when the prefetch trigger fires', () => {
      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(<Probe load={load} on="interaction" prefetch="hover" />);

      fireEvent.mouseEnter(getByTestId('target'));

      expect(load).toHaveBeenCalledOnce();
      expect(getByTestId('target').textContent).toBe('placeholder');
    });

    it('reuses the prefetched module instead of loading again on display', async () => {
      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(<Probe load={load} on="interaction" prefetch="hover" />);

      fireEvent.mouseEnter(getByTestId('target'));
      expect(load).toHaveBeenCalledOnce();

      fireEvent.click(getByTestId('target'));
      await waitFor(() => expect(getByTestId('target').textContent).toBe('visible'));

      expect(load).toHaveBeenCalledOnce();
    });

    it('does not prefetch when no prefetch option is given', () => {
      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(<Probe load={load} on="interaction" />);

      fireEvent.mouseEnter(getByTestId('target'));

      expect(load).not.toHaveBeenCalled();
      expect(getByTestId('target').textContent).toBe('placeholder');
    });

    it('surfaces the error later if the prefetched load eventually fails', async () => {
      const load = vi.fn(() => Promise.reject(new Error('boom')));
      const { getByTestId } = render(<Probe load={load} on="interaction" prefetch="hover" />);

      fireEvent.mouseEnter(getByTestId('target'));
      expect(getByTestId('target').textContent).toBe('placeholder');

      fireEvent.click(getByTestId('target'));
      await waitFor(() => expect(getByTestId('target').textContent).toBe('error'));

      expect(load).toHaveBeenCalledOnce();
    });
  });

  describe('loadingDelay', () => {
    it('skips "loading" entirely when the load resolves before the delay elapses', async () => {
      vi.useFakeTimers();

      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(<Probe load={load} on="interaction" loadingDelay={200} />);

      fireEvent.click(getByTestId('target'));
      await flushMicrotasks();

      expect(getByTestId('target').textContent).toBe('visible');
    });

    it('shows "loading" only after the delay elapses for a slow load', async () => {
      vi.useFakeTimers();

      let resolveLoad = () => {};
      const load = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveLoad = resolve;
          }),
      );
      const { getByTestId } = render(<Probe load={load} on="interaction" loadingDelay={200} />);

      fireEvent.click(getByTestId('target'));
      expect(getByTestId('target').textContent).toBe('placeholder');

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(getByTestId('target').textContent).toBe('loading');

      resolveLoad();
      await flushMicrotasks();
      expect(getByTestId('target').textContent).toBe('visible');
    });

    it('does not throw when unmounted during the loading delay window', () => {
      vi.useFakeTimers();

      const load = vi.fn(() => new Promise<void>(() => {}));
      const { getByTestId, unmount } = render(
        <Probe load={load} on="interaction" loadingDelay={200} />,
      );

      fireEvent.click(getByTestId('target'));
      unmount();

      expect(() => {
        act(() => {
          vi.advanceTimersByTime(200);
        });
      }).not.toThrow();
    });
  });

  describe('minPlaceholderTime', () => {
    it('shows "placeholder" for at least the minimum even when triggered immediately', async () => {
      vi.useFakeTimers();

      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(<Probe load={load} on={{ when: true }} minPlaceholderTime={300} />);

      expect(getByTestId('target').textContent).toBe('placeholder');

      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(getByTestId('target').textContent).toBe('placeholder');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      await flushMicrotasks();
      expect(getByTestId('target').textContent).toBe('visible');
    });

    it('does not throw when unmounted during the minPlaceholderTime window', () => {
      vi.useFakeTimers();

      const load = vi.fn(() => Promise.resolve());
      const { unmount } = render(<Probe load={load} on="interaction" minPlaceholderTime={300} />);

      unmount();

      expect(() => {
        act(() => {
          vi.advanceTimersByTime(300);
        });
      }).not.toThrow();
    });
  });

  describe('minLoadingTime', () => {
    it('does not apply when loading was never actually shown', async () => {
      vi.useFakeTimers();

      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(
        <Probe load={load} on="interaction" loadingDelay={200} minLoadingTime={1000} />,
      );

      fireEvent.click(getByTestId('target'));
      await flushMicrotasks();

      expect(getByTestId('target').textContent).toBe('visible');
    });

    it('keeps "loading" visible for at least the minimum once shown', async () => {
      vi.useFakeTimers();

      let resolveLoad = () => {};
      const load = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveLoad = resolve;
          }),
      );
      const { getByTestId } = render(<Probe load={load} on="interaction" minLoadingTime={300} />);

      fireEvent.click(getByTestId('target'));
      expect(getByTestId('target').textContent).toBe('loading');

      resolveLoad();
      await flushMicrotasks();
      expect(getByTestId('target').textContent).toBe('loading');

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(getByTestId('target').textContent).toBe('visible');
    });

    it('does not throw when unmounted during the minLoadingTime window', () => {
      vi.useFakeTimers();

      const load = vi.fn(() => Promise.resolve());
      const { getByTestId, unmount } = render(
        <Probe load={load} on="interaction" minLoadingTime={300} />,
      );

      fireEvent.click(getByTestId('target'));
      unmount();

      expect(() => {
        act(() => {
          vi.advanceTimersByTime(300);
        });
      }).not.toThrow();
    });
  });

  describe('onStateChange', () => {
    it('fires with the initial state on mount', () => {
      const onStateChange = vi.fn();
      const load = vi.fn(() => Promise.resolve());
      render(<Probe load={load} onStateChange={onStateChange} />);

      expect(onStateChange).toHaveBeenCalledWith('placeholder');
    });

    it('fires for each state transition', async () => {
      const onStateChange = vi.fn();
      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(
        <Probe load={load} on="interaction" onStateChange={onStateChange} />,
      );

      fireEvent.click(getByTestId('target'));
      await waitFor(() => expect(getByTestId('target').textContent).toBe('visible'));

      expect(onStateChange.mock.calls.map(([s]) => s)).toEqual(['placeholder', 'loading', 'visible']);
    });

    it('always calls the latest callback, even after a re-render with a new reference', async () => {
      const load = vi.fn(() => Promise.resolve());
      const first = vi.fn();
      const second = vi.fn();

      const { rerender, getByTestId } = render(
        <Probe load={load} on="interaction" onStateChange={first} />,
      );
      rerender(<Probe load={load} on="interaction" onStateChange={second} />);

      fireEvent.click(getByTestId('target'));
      await waitFor(() => expect(getByTestId('target').textContent).toBe('visible'));

      expect(second).toHaveBeenCalledWith('loading');
      expect(second).toHaveBeenCalledWith('visible');
      expect(first).not.toHaveBeenCalledWith('loading');
    });
  });

  describe('StrictMode', () => {
    it('calls load only once despite the double-invoked mount effects', async () => {
      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(
        <StrictMode>
          <Probe load={load} on="interaction" />
        </StrictMode>,
      );

      fireEvent.click(getByTestId('target'));
      await waitFor(() => expect(getByTestId('target').textContent).toBe('visible'));

      expect(load).toHaveBeenCalledOnce();
    });

    it('cleans up the discarded first mount pass (no leaked timer)', () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      const load = vi.fn(() => Promise.resolve());
      render(
        <StrictMode>
          <Probe load={load} on={{ timer: 1000 }} />
        </StrictMode>,
      );

      expect(clearTimeoutSpy).toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(load).toHaveBeenCalledOnce();
    });

    it('still disarms on a real unmount after the StrictMode double-invoke', () => {
      vi.useFakeTimers();

      const load = vi.fn(() => Promise.resolve());
      const { unmount } = render(
        <StrictMode>
          <Probe load={load} on={{ timer: 1000 }} />
        </StrictMode>,
      );

      unmount();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(load).not.toHaveBeenCalled();
    });

    it('reaches "visible" normally with prefetch enabled, loading load only once', async () => {
      const load = vi.fn(() => Promise.resolve());
      const { getByTestId } = render(
        <StrictMode>
          <Probe load={load} on="interaction" prefetch="hover" />
        </StrictMode>,
      );

      fireEvent.mouseEnter(getByTestId('target'));
      fireEvent.click(getByTestId('target'));
      await waitFor(() => expect(getByTestId('target').textContent).toBe('visible'));

      expect(load).toHaveBeenCalledOnce();
    });
  });
});
