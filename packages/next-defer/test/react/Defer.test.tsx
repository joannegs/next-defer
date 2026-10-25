import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Defer } from '../../src/react/Defer';

afterEach(() => {
  cleanup();
});

function Loaded({ label }: { label: string }) {
  return <span data-testid="loaded">{label}</span>;
}

function load() {
  return Promise.resolve({ default: Loaded });
}

describe('Defer', () => {
  it('renders the placeholder inside the wrapper while in "placeholder" state', () => {
    const { getByTestId } = render(
      <Defer load={load} on="interaction" placeholder={<span data-testid="ph">loading…</span>} />,
    );

    expect(getByTestId('ph')).toBeTruthy();
  });

  it('applies display: contents to the wrapper element', () => {
    const { container } = render(<Defer load={load} on="interaction" placeholder={<span>ph</span>} />);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.display).toBe('contents');
  });

  it('removes the placeholder once the trigger fires', () => {
    const { container, queryByTestId } = render(
      <Defer load={load} on="interaction" placeholder={<span data-testid="ph">loading…</span>} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.click(wrapper);

    expect(queryByTestId('ph')).toBeNull();
  });

  it('renders the loaded component with the given props once visible', async () => {
    const { container, getByTestId } = render(
      <Defer load={load} on="interaction" props={{ label: 'hello' }} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.click(wrapper);

    await waitFor(() => expect(getByTestId('loaded').textContent).toBe('hello'));
  });

  it('does not render the loaded component while still "loading"', async () => {
    let resolveLoad: (value: { default: typeof Loaded }) => void = () => {};
    const pendingLoad = () =>
      new Promise<{ default: typeof Loaded }>((resolve) => {
        resolveLoad = resolve;
      });

    const { container, queryByTestId, getByTestId } = render(
      <Defer load={pendingLoad} on="interaction" props={{ label: 'hello' }} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.click(wrapper);

    expect(queryByTestId('loaded')).toBeNull();

    resolveLoad({ default: Loaded });
    await waitFor(() => expect(getByTestId('loaded').textContent).toBe('hello'));
  });

  it('never renders the placeholder and the loaded component at the same time', async () => {
    const { container, queryByTestId, getByTestId } = render(
      <Defer
        load={load}
        on="interaction"
        props={{ label: 'hello' }}
        placeholder={<span data-testid="ph">loading…</span>}
      />,
    );

    expect(queryByTestId('ph')).toBeTruthy();
    expect(queryByTestId('loaded')).toBeNull();

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.click(wrapper);

    await waitFor(() => expect(getByTestId('loaded')).toBeTruthy());
    expect(queryByTestId('ph')).toBeNull();
  });

  it('shows the loading content while loading, then removes it once visible', async () => {
    let resolveLoad: (value: { default: typeof Loaded }) => void = () => {};
    const pendingLoad = () =>
      new Promise<{ default: typeof Loaded }>((resolve) => {
        resolveLoad = resolve;
      });

    const { container, queryByTestId, getByTestId } = render(
      <Defer load={pendingLoad} on="interaction" loading={<span data-testid="loading">…</span>} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.click(wrapper);

    expect(getByTestId('loading')).toBeTruthy();

    resolveLoad({ default: Loaded });
    await waitFor(() => expect(queryByTestId('loading')).toBeNull());
  });

  it('shows static error content when load fails', async () => {
    const failingLoad = () => Promise.reject(new Error('boom'));

    const { container, getByTestId } = render(
      <Defer load={failingLoad} on="interaction" error={<span data-testid="err">failed</span>} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.click(wrapper);

    await waitFor(() => expect(getByTestId('err')).toBeTruthy());
  });

  it('retries via the error render-prop and eventually shows the loaded component', async () => {
    const load = vi.fn<() => Promise<{ default: typeof Loaded }>>();
    load.mockImplementationOnce(() => Promise.reject(new Error('boom')));
    load.mockImplementationOnce(() => Promise.resolve({ default: Loaded }));

    const { container, getByTestId, queryByTestId } = render(
      <Defer
        load={load}
        on="interaction"
        props={{ label: 'hello' }}
        error={(retry) => (
          <button data-testid="retry-btn" onClick={retry}>
            retry
          </button>
        )}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.click(wrapper);

    await waitFor(() => expect(getByTestId('retry-btn')).toBeTruthy());

    fireEvent.click(getByTestId('retry-btn'));

    await waitFor(() => expect(getByTestId('loaded').textContent).toBe('hello'));
    expect(queryByTestId('retry-btn')).toBeNull();
  });

  it('has no aria-busy while in "placeholder" state', () => {
    const { container } = render(<Defer load={load} on="interaction" />);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.getAttribute('aria-busy')).toBeNull();
  });

  it('sets aria-busy="true" while loading, then removes it once visible', async () => {
    let resolveLoad: (value: { default: typeof Loaded }) => void = () => {};
    const pendingLoad = () =>
      new Promise<{ default: typeof Loaded }>((resolve) => {
        resolveLoad = resolve;
      });

    const { container } = render(<Defer load={pendingLoad} on="interaction" />);
    const wrapper = container.firstElementChild as HTMLElement;

    fireEvent.click(wrapper);
    expect(wrapper.getAttribute('aria-busy')).toBe('true');

    resolveLoad({ default: Loaded });
    await waitFor(() => expect(wrapper.getAttribute('aria-busy')).toBeNull());
  });

  it('renders the wrapper with no extra content when no placeholder is given', () => {
    const { container } = render(<Defer load={load} on="interaction" />);

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.childNodes.length).toBe(0);
  });
});
