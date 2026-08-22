'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center dark:bg-gray-800">
      <p className="font-space-grotesk text-sm uppercase tracking-widest text-blue-600 dark:text-blue-400">
        error
      </p>
      <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-gray-600 dark:text-gray-400">
        An unexpected error occurred while rendering this page. You can try
        again, or head back to the homepage.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-gray-400 dark:text-gray-500">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
