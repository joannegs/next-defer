# next-defer

A `<Defer>` component (plus a `useDefer` hook and a `deferred()` factory) for
React/Next.js that lets you **declaratively control when** a component's JavaScript is
downloaded and displayed. Inspired by Angular's [\@defer](https://angular.dev/guide/templates/defer).

`next/dynamic` already splits code into chunks, but fetches the chunk as soon as the
component mounts. But with `next-defer` it is possible to pick the **trigger** that kicks off the download, with its own placeholder/loading/error states and optional prefetch separate from display. 

```tsx
import { Defer } from 'next-defer';

<Defer
  load={() => import('./HeavyChart')}
  on="viewport"
  placeholder={<Skeleton />}
  loading={<Spinner />}
/>;
```

## Why

A heavy component (chart, editor, map, chat) that not every visitor will use shouldn't
compete for the main thread on first page load. `next-defer` makes the condition that
justifies paying that cost explicit, right in the JSX.


## Installation

```bash
pnpm add next-defer
# or: npm install next-defer / yarn add next-defer
```

Peer dependencies: `react >= 18` and, optionally, `next >= 14` (the library works in any
React app, not just Next.js. This package ships with a
`'use client'` banner, so it works directly from Server Components with no extra setup
with `deferred()`.

## Usage

### `<Defer>`

```tsx
<Defer
  load={() => import('./HeavyChart')}
  on="interaction"
  props={{ data }}
  placeholder={<button>Load chart</button>}
  loading={<Spinner />}
  error={(retry) => <button onClick={retry}>Retry</button>}
/>
```

| Prop | Type | Description |
| --- | --- | --- |
| `load` | `() => Promise<{ default: ComponentType<P> }>` | Same shape as a dynamic `import()`. `P` is inferred from it. |
| `props` | `P` | Props passed to the loaded component once visible. |
| `placeholder` | `ReactNode` | Rendered before the trigger fires. |
| `loading` | `ReactNode` | Rendered while the module is being downloaded. |
| `error` | `ReactNode \| ((retry: () => void) => ReactNode)` | Static, or a render-prop with a `retry()` function. |
| `UseDeferOptions` | — | `on`, `prefetch`, `loadingDelay`, `minPlaceholderTime`, `minLoadingTime`, `onStateChange` |

### `useDefer`

For full control over rendering instead of the `<Defer>` component:

```tsx
const { ref, viewportRef, state, module, retry } = useDefer(
  () => import('./HeavyChart'),
  { on: 'hover' },
);
```

> IMPORTANT: `ref` goes on the element that should react to `interaction` or `hover` (click,
  touch, keydown, or mouse-enter on that element fires the trigger), as long as no
  custom `ref` was given inside the trigger option itself.
 `viewportRef` is a separate element just for the `viewport` trigger. It exists
  because `viewport` works by checking, via `IntersectionObserver`, whether an element
  is visible on screen, and that check only works on an element with actual layout with
  width and height. If your wrapper has no size of its own (for example `display:
  contents`, like `<Defer>` uses internally), `viewport` would never fire on it. So
  `viewportRef` gives it a small, separate element to watch instead.

### `deferred()` (for Server Components)

`<Defer load={...} />` requires passing a function (`load`) as a prop and React Server
Components doesn't allow passing functions from a Server Component to a Client
Component. `deferred()` works around this by pre-capturing `load` and the options once,
inside a `'use client'` file:

```tsx
// components/DeferredChart.tsx
'use client';
import { deferred } from 'next-defer';

export const DeferredChart = deferred(() => import('./HeavyChart'), {
  on: 'interaction',
  placeholder: <button>Load</button>,
});
```

```tsx
// app/page.tsx (Server Component)
import { DeferredChart } from '../components/DeferredChart';

export default function Page() {
  return <DeferredChart data={data} />;
}
```

> Calling `deferred()` directly inside a Server Component's own module **does not
> work** — it fails the build ("Attempted to call deferred() from the server but
> deferred is on the client"). It must be called once inside its own `'use client'`
> file, as shown above.

## Triggers (`on` / `prefetch`)

```ts
type Trigger =
  | 'idle'
  | { idle: { timeout?: number } }
  | 'viewport'
  | { viewport: { ref?: ElementRef; rootMargin?: string; threshold?: number } }
  | 'interaction'
  | { interaction: { ref: ElementRef } }
  | 'hover'
  | { hover: { ref: ElementRef } }
  | { timer: Duration }        // Duration = number | `${number}ms` | `${number}s`
  | { when: boolean };
```

- **`idle`** — fires via `requestIdleCallback.
- **`viewport`** — fires when the element enters the viewport (`IntersectionObserver`).
- **`interaction`** — fires on the first `click`, `touchstart`, or `keydown`.
- **`hover`** — fires on the first `mouseenter`.
- **`timer`** — fires after a fixed duration.
- **`when`** — fires when a boolean you control becomes `true` (useful for arbitrary
  conditions from your own application).

- `on` accepts a single `Trigger` or an array, in which case it behaves as an OR:
whichever fires first wins, and the rest are disarmed. 

- `prefetch` uses the same syntax,
but only downloads the module in the background without changing what's displayed —
useful for, say, prefetching on `hover` while content is only shown on `click`.

Any trigger that depends on an element (`viewport`/`interaction`/`hover`) accepts a
custom `ref` to observe/listen on a different element than the `<Defer>` wrapper.

## Timing options

| Option | Effect |
| --- | --- |
| `loadingDelay` | Only shows `loading` if the download is still pending after this delay (avoids a loading flash on fast downloads). |
| `minPlaceholderTime` | Keeps `placeholder` visible for at least this long, even if the trigger fires sooner. |
| `minLoadingTime` | Keeps `loading` visible for at least this long, even if the module has already resolved. |
| `onStateChange` | Callback invoked on every `state` transition (`'placeholder' \| 'loading' \| 'visible' \| 'error'`). |


```

### `packages/next-defer/src`

```
core/
  triggers/      each trigger's implementation (idle, viewport, interaction, hover, timer)
  utils/         armTriggers (combines/disarms triggers etc)
  types/         Trigger, NormalizedTrigger, Duration
react/
  Defer.tsx      the component
  useDefer.ts    the hook
  deferred.tsx   factory for Server Components
  getModule.ts   module cache (guarantees a single import() per instance)
```

## Development

Prerequisites: Node ≥ 20, pnpm ≥ 10 (`packageManager` pinned to `pnpm@10.20.0`).

```bash
pnpm install

pnpm dev          # runs apps/demo (next dev)
pnpm build        # builds every workspace (tsup for the package, next build for the demo)
pnpm lint         # eslint at the monorepo root
pnpm typecheck    # tsc --noEmit in each workspace
pnpm test         # vitest for the package (unit tests)
pnpm --filter demo run e2e   # Playwright against apps/demo (builds+starts the server itself)
pnpm checkpack    # size-limit + publint + arethetypeswrong, for the package
```

Husky runs `commitlint` (Conventional Commits) on `commit-msg` and `lint` on
`pre-commit`.

### CI

`.github/workflows/ci.yml` runs, in this order, on every push/PR: lint → test (unit) →
build → typecheck → Playwright's Chromium install → e2e → checkpack. Typecheck runs
after build on purpose: `apps/demo` imports `next-defer` through its published types in
`dist/`, which only exist after the package's `tsup build`.

## License

[MIT](./LICENSE)
