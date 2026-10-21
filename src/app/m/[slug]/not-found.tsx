import Link from "next/link";

export default function MenuNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-serif text-4xl leading-tight text-ink" data-testid="menu-not-found">
        Menu not found
      </h1>
      <p className="mt-2 text-stone-600">Check the address, or ask the restaurant for their SafePlate link.</p>
      <Link href="/" className="mt-6 font-semibold text-ink underline decoration-[#d4a24c] decoration-2 underline-offset-4">
        Go to SafePlate
      </Link>
    </main>
  );
}
