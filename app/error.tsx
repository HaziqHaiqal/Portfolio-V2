'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import GridBackground from '@components/Layout/GridBackground';
import { TriangleAlert, RotateCw, ArrowLeft } from 'lucide-react';

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
    <main className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-800">
      <GridBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 font-mono text-sm">
          <TriangleAlert size={16} className="text-rose-500" />
          <span className="text-gray-500 dark:text-gray-400">
            error.caught()
          </span>
        </div>

        <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Something went wrong
        </h1>

        <div className="mb-8 h-[3px] w-11 rounded-full bg-gradient-to-r from-rose-600 to-rose-400" />

        <p className="mb-4 max-w-md text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          An unexpected error occurred while rendering this page. You can try
          again, or head back to the homepage.
        </p>

        {error.digest && (
          <p className="mb-6 font-mono text-xs text-gray-400 dark:text-gray-500">
            digest: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="group inline-flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 font-medium text-white shadow-[0_0_45px_rgba(17,24,39,0.25)] transition-transform hover:scale-[1.03] dark:bg-white dark:text-gray-900 dark:shadow-[0_0_45px_rgba(255,255,255,0.25)]"
          >
            <RotateCw
              size={17}
              className="transition-transform group-hover:rotate-180"
            />
            Try again
          </button>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-gray-300 px-7 py-3.5 font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
