'use client';

import { useState, type ReactNode } from 'react';
import { Defer } from 'next-defer';

const box: React.CSSProperties = {
  padding: 16,
  border: '1px dashed #94a3b8',
  borderRadius: 8,
  color: '#64748b',
};

function placeholder(text: string): ReactNode {
  return <div style={box}>{text}</div>;
}

const loading = <div style={box}>loading</div>;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2>{title}</h2>
      <p style={{ color: '#657284' }}>{description}</p>
      {children}
    </section>
  );
}

export default function Page() {
  const [when, setWhen] = useState(false);

  return (
    <main style={{ margin: '0 auto', padding: 32, fontFamily: 'arial' }}>
      <h1>next-defer playground</h1>
      <p>An exemple for each trigger (`on`). Scroll the page and interact with each section.</p>

      <Section title="idle" description="Loads when the browser is idle.">
        <Defer
          load={() => import('../components/heavy/HeavyCard')}
          on="idle"
          props={{ label: 'idle' }}
          placeholder={placeholder('waiting for the browser to be idle…')}
          loading={loading}
        />
      </Section>

      <Section title="interaction" description="Loads when clicked (or focused + Enter).">
        <Defer
          load={() => import('../components/heavy/HeavyCard')}
          on="interaction"
          props={{ label: 'interaction' }}
          placeholder={<button style={box}>click here to load</button>}
          loading={loading}
        />
      </Section>

      <Section title="hover" description="Loads when the mouse hovers over the area below.">
        <Defer
          load={() => import('../components/heavy/HeavyCard')}
          on="hover"
          props={{ label: 'hover' }}
          placeholder={placeholder('hover here to load')}
          loading={loading}
        />
      </Section>

      <Section title="timer" description="Loads automatically after 2 seconds.">
        <Defer
          load={() => import('../components/heavy/HeavyCard')}
          on={{ timer: '2s' }}
          props={{ label: 'timer' }}
          placeholder={placeholder('loading in 2s…')}
          loading={loading}
        />
      </Section>

      <Section
        title="when"
        description="Loads when the condition controlled by the button below is true."
      >
        <button onClick={() => setWhen(true)} disabled={when} style={{ marginBottom: 12 }}>
          {when ? 'condition activated' : 'activate condition'}
        </button>
        <Defer
          load={() => import('../components/heavy/HeavyCard')}
          on={{ when }}
          props={{ label: 'when' }}
          placeholder={placeholder('waiting for the condition…')}
          loading={loading}
        />
      </Section>

      <div style={{ height: '100vh' }} />

      <Section title="viewport" description="Loads when the section enters the visible area (scroll the page).">
        <Defer
          load={() => import('../components/heavy/HeavyCard')}
          on="viewport"
          props={{ label: 'viewport' }}
          placeholder={placeholder('waiting for the section to enter the viewport…')}
          loading={loading}
        />
      </Section>
    </main>
  );
}
