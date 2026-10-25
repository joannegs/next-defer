export function onEvents(element: HTMLElement, events: string[], handler: EventListener): () => void {
  const controller = new AbortController();

  const listener: EventListener = (event) => {
    controller.abort();
    handler(event);
  };

  for (const event of events) {
    element.addEventListener(event, listener, { signal: controller.signal });
  }

  return () => controller.abort();
}
