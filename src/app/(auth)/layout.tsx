import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="theme-ink grain flex flex-1 flex-col items-center px-5 py-10 sm:py-16">
      <div className="mb-10">
        <Logo tone="light" />
      </div>
      <div className="w-full max-w-md rounded-[2rem] bg-[#f4efe6] p-7 text-ink shadow-[0_50px_80px_-40px_rgba(0,0,0,0.8)] sm:p-9">
        {children}
      </div>
    </main>
  );
}
