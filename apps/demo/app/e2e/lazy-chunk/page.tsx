'use client';

import { Defer } from 'next-defer';

export default function LazyChunkPage() {
  return (
    <main>
      <Defer
        load={() => import('../../../components/heavy/HeavyCard')}
        on="interaction"
        props={{ label: 'e2e' }}
        placeholder={<div>click to load</div>}
        error={(retry) => (
          <div>
            <span>failed to load</span>
            <button onClick={retry}>retry</button>
          </div>
        )}
      />
    </main>
  );
}
