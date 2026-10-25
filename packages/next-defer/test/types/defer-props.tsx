import { Defer } from '../../src/react/Defer';

interface HeavyProps {
  label: string;
  count: number;
}

function Heavy({ label, count }: HeavyProps) {
  return (
    <span>
      {label} {count}
    </span>
  );
}

function load() {
  return Promise.resolve({ default: Heavy });
}

export function propsAreInferredFromLoad() {
  return <Defer load={load} props={{ label: 'hi', count: 1 }} />;
}

export function rejectsMissingRequiredProp() {
  // @ts-expect-error - error: missing required prop 'count'
  return <Defer load={load} props={{ label: 'hi' }} />;
}

export function rejectsWrongPropType() {
  // @ts-expect-error - error: wrong type for prop 'count', should be number
  return <Defer load={load} props={{ label: 'hi', count: 'nope' }} />;
}
