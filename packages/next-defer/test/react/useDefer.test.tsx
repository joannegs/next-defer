import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RefObject } from 'react';
import { useDefer } from '../../src/react/useDefer';
import type { Trigger } from '../../src/core/types/trigger.types';

// Flushes one pending microtask inside `act`, for resolved promises whose
// `.then` already ran but whose React state update is still queued.
// Can't use `waitFor` here: it polls with real timers, which never
// advance under `vi.useFakeTimers()`.
async function flushMicrotasks() {
  await act(async () => {});
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function Probe({ load, on }: { load: () => Promise<unknown>; on?: Trigger | Trigger[] }) {
  const { ref, state, retry } = useDefer(load, { on });
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
});
