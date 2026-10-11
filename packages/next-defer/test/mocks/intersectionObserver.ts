import { vi } from 'vitest';

export interface MockIntersectionObserverInstance extends IntersectionObserver {
  readonly observedElements: ReadonlySet<Element>;
  readonly options?: IntersectionObserverInit;
}

export interface IntersectionObserverMock {
  readonly instances: readonly MockIntersectionObserverInstance[];

  trigger(
    target: Element,
    isIntersecting: boolean,
    overrides?: Partial<IntersectionObserverEntry>,
  ): void;
}

const EMPTY_RECT: DOMRectReadOnly = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  toJSON() {
    return this;
  },
};

export function mockIntersectionObserver(): IntersectionObserverMock {
  class MockIntersectionObserverImpl implements MockIntersectionObserverInstance {
    readonly root: Element | Document | null = null;
    readonly rootMargin = '';
    readonly scrollMargin = '';
    readonly thresholds: ReadonlyArray<number> = [];
    readonly observedElements = new Set<Element>();

    constructor(
      private readonly callback: IntersectionObserverCallback,
      public readonly options?: IntersectionObserverInit,
    ) {
      instances.push(this);
    }

    observe(target: Element): void {
      this.observedElements.add(target);
    }

    unobserve(target: Element): void {
      this.observedElements.delete(target);
    }

    disconnect(): void {
      this.observedElements.clear();
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }

    notify(entry: IntersectionObserverEntry): void {
      this.callback([entry], this);
    }
  }

  const instances: MockIntersectionObserverImpl[] = [];

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserverImpl);

  return {
    instances,
    trigger(target, isIntersecting, overrides) {
      const entry: IntersectionObserverEntry = {
        target,
        isIntersecting,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: isIntersecting ? target.getBoundingClientRect() : EMPTY_RECT,
        rootBounds: null,
        time: 0,
        ...overrides,
      };

      for (const instance of instances) {
        if (instance.observedElements.has(target)) {
          instance.notify(entry);
        }
      }
    },
  };
}
