import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900" data-testid="page-not-found">
        Page not found
      </h1>
      <p className="mt-2 text-slate-600">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 font-semibold text-emerald-700 hover:underline">
        Go to the home page
      </Link>
    </main>
  );
}
