import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { deferred } from '../../src/react/deferred';

afterEach(() => {
  cleanup();
});

function Loaded({ label }: { label: string }) {
  return <span data-testid="loaded">{label}</span>;
}

function load() {
  return Promise.resolve({ default: Loaded });
}

describe('deferred', () => {
  it('creates a component that passes its own JSX attributes through as props', async () => {
    const Heavy = deferred(load, { on: 'interaction' });

    const { container, getByTestId } = render(<Heavy label="hello" />);
    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.click(wrapper);

    await waitFor(() => expect(getByTestId('loaded').textContent).toBe('hello'));
  });

  it('applies the options captured at creation, e.g. the placeholder', () => {
    const Heavy = deferred(load, {
      on: 'interaction',
      placeholder: <span data-testid="ph">loading…</span>,
    });

    const { getByTestId } = render(<Heavy label="hello" />);
    expect(getByTestId('ph')).toBeTruthy();
  });
});
