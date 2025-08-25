// src/app/country/[iso]/error.tsx
'use client';

import * as React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Country page error:', error);
  }, [error]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Something went wrong while rendering this country.</h2>
      {error?.digest ? <p><b>Digest:</b> {error.digest}</p> : null}
      {error?.message ? <pre style={{ whiteSpace: 'pre-wrap' }}>{String(error.message)}</pre> : null}
      <button
        onClick={() => reset()}
        style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8 }}
      >
        Try again
      </button>
    </div>
  );
}
