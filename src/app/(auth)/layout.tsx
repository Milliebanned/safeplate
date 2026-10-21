import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/80 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8">{children}</div>
    </main>
  );
}
