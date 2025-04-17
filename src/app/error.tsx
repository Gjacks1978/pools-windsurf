'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Algo deu errado!</h2>
      <p>{error.message || 'Ocorreu um erro inesperado.'}</p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        style={{ marginTop: '10px', padding: '5px 10px' }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
