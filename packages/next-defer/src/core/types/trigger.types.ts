import { Duration } from "./duration.types";

export type ElementRef = { 
  readonly current: Element | null 
};

export type Trigger =
  | 'idle'
  | { idle: { timeout?: number } }
  | 'viewport'
  | { viewport: { ref?: ElementRef; rootMargin?: string; threshold?: number } }
  | 'interaction'
  | { interaction: { ref: ElementRef } }
  | 'hover'
  | { hover: { ref: ElementRef } }
  | { timer: Duration }
  | { when: boolean };

export type NormalizedTrigger =
  | { kind: 'idle'; timeout?: number }
  | { kind: 'viewport'; ref?: ElementRef; rootMargin?: string; threshold?: number }
  | { kind: 'interaction'; ref?: ElementRef }
  | { kind: 'hover'; ref?: ElementRef }
  | { kind: 'timer'; ms: number }
  | { kind: 'when'; value: boolean };

export type TriggerKind = NormalizedTrigger['kind'];