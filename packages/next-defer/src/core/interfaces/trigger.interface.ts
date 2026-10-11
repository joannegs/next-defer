export interface TriggerInterface {
  triggerSubscribe(element: HTMLElement, fire: () => void): () => void;
}
