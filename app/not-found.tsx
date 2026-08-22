import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found | Haziq Haiqal',
  robots: 'noindex',
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center dark:bg-gray-800">
      <p className="font-space-grotesk text-sm uppercase tracking-widest text-blue-600 dark:text-blue-400">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-gray-600 dark:text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Go home
      </Link>
    </main>
  );
}
