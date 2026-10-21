import Link from "next/link";

/**
 * The SafePlate mark: a plate seen from above. The rim is broken at a single point,
 * marked in brass, the one ingredient a guest needs to know about.
 */
export function LogoMark({ className = "size-8", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const ink = tone === "light" ? "#f3ede2" : "#0d0c0a";
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="86 14"
        strokeDashoffset="-19.5"
        transform="rotate(-90 16 16)"
      />
      <circle cx="16" cy="16" r="7.2" fill="none" stroke={ink} strokeWidth="1" opacity="0.55" />
      <circle cx="25.19" cy="6.81" r="2.3" fill="#d4a24c" />
    </svg>
  );
}

export function Logo({ href = "/", tone = "dark" }: { href?: string; tone?: "dark" | "light" }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 ${tone === "light" ? "text-ivory" : "text-slate-900"}`}
      data-testid="logo"
      aria-label="SafePlate home"
    >
      <LogoMark tone={tone} />
      <span className="font-serif text-2xl leading-none tracking-tight">SafePlate</span>
    </Link>
  );
}
