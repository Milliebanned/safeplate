import Image from "next/image";
import { allergenLabel } from "@/lib/allergens";

// One colour per allergen, used for the segmented rim of each dish's plate emblem.
export const ALLERGEN_COLORS: Record<string, string> = {
  celery: "#84cc16",
  crustaceans: "#f97316",
  eggs: "#facc15",
  fish: "#0ea5e9",
  gluten: "#d97706",
  lupin: "#a855f7",
  milk: "#60a5fa",
  molluscs: "#14b8a6",
  mustard: "#ca8a04",
  peanuts: "#b45309",
  sesame: "#a8a29e",
  soybeans: "#65a30d",
  sulphites: "#e11d48",
  "tree-nuts": "#7c2d12",
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** A plate whose rim is split into one coloured segment per allergen. */
export function AllergenEmblem({
  name,
  allergens,
  highlight = [],
  size = 76,
  tone = "light",
  photoUrl,
}: {
  name: string;
  photoUrl?: string | null;
  allergens: readonly string[];
  highlight?: readonly string[];
  size?: number;
  tone?: "light" | "dark";
}) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const gap = allergens.length > 1 ? 3 : 0;
  const segment = allergens.length ? circumference / allergens.length : circumference;
  const photo = photoUrl;
  const label = allergens.length
    ? `${name}: contains ${allergens.map(allergenLabel).join(", ")}`
    : `${name}: no major allergens`;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke={tone === "dark" ? "rgba(243,237,226,0.12)" : "#e7e1d8"} strokeWidth="9" />
        {allergens.length === 0 ? (
          <circle cx="50" cy="50" r={r} fill="none" stroke="#10b981" strokeWidth="9" />
        ) : (
          allergens.map((code, i) => (
            <circle
              key={code}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={ALLERGEN_COLORS[code] ?? "#94a3b8"}
              strokeWidth={highlight.includes(code) ? 12 : 9}
              strokeDasharray={`${Math.max(segment - gap, 1)} ${circumference}`}
              strokeDashoffset={-i * segment}
            />
          ))
        )}
      </svg>
      <div className="absolute inset-[15%] overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_25%,#ffffff,#f1ece4)] shadow-[inset_0_-3px_8px_rgba(0,0,0,0.08),0_2px_6px_rgba(15,23,42,0.12)]">
        {photo ? (
          <Image src={photo} alt="" fill sizes={`${size}px`} className="object-cover" />
        ) : (
          <span className="font-display grid size-full place-items-center text-lg font-bold text-slate-700">
            {initials(name)}
          </span>
        )}
      </div>
    </div>
  );
}
