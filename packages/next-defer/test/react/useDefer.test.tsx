import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RefObject } from 'react';
import { useDefer } from '../../src/react/useDefer';
import type { Trigger } from '../../src/core/types/trigger.types';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function Probe({ trigger }: { trigger?: Trigger }) {
  const { ref, state } = useDefer(trigger);
  return (
    <div ref={ref as RefObject<HTMLDivElement>} data-testid="target">
      {state}
    </div>
  );
}

describe('useDefer', () => {
  it('starts with state "placeholder"', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
    vi.stubGlobal('cancelIdleCallback', undefined);

    const { getByTestId } = render(<Probe />);
    expect(getByTestId('target').textContent).toBe('placeholder');
  });

  it('becomes "visible" once the timer trigger fires', () => {
    vi.useFakeTimers();

    const { getByTestId } = render(<Probe trigger={{ timer: 1000 }} />);
    expect(getByTestId('target').textContent).toBe('placeholder');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(getByTestId('target').textContent).toBe('visible');
  });

  it('becomes "visible" once the interaction trigger fires', () => {
    const { getByTestId } = render(<Probe trigger="interaction" />);
    expect(getByTestId('target').textContent).toBe('placeholder');

    fireEvent.click(getByTestId('target'));

    expect(getByTestId('target').textContent).toBe('visible');
  });

  it('disarms the trigger on unmount without throwing', () => {
    vi.useFakeTimers();

    const { unmount } = render(<Probe trigger={{ timer: 1000 }} />);
    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }).not.toThrow();
  });

  it('keeps the same timer running across a re-render with an equivalent trigger', () => {
    vi.useFakeTimers();

    const { rerender, getByTestId } = render(<Probe trigger={{ timer: 1000 }} />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender(<Probe trigger={{ timer: 1000 }} />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(getByTestId('target').textContent).toBe('visible');
  });
});
