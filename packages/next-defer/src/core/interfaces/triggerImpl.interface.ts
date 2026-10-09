export interface TriggerImpl {
  subscribe(element: HTMLElement, fire: () => void): () => void;
}

export const noop: TriggerImpl = {
  subscribe() {
    return () => {};
  },
};
