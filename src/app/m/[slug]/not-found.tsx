import Link from "next/link";

export default function MenuNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900" data-testid="menu-not-found">
        Menu not found
      </h1>
      <p className="mt-2 text-slate-600">Check the address, or ask the restaurant for their SafePlate link.</p>
      <Link href="/" className="mt-6 font-semibold text-emerald-700 hover:underline">
        Go to SafePlate
      </Link>
    </main>
  );
}
