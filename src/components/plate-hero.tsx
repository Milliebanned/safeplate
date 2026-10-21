"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { allergenLabel, type AllergenCode, formatAllergens, matchingAllergens } from "@/lib/allergens";
import type { HeroDish } from "@/lib/hero-dishes";
import { testIdFor } from "@/lib/test-id";
import { formatPrice } from "@/lib/validation";
import { ALLERGEN_COLORS } from "./allergen-emblem";

const TRY_ALLERGENS: AllergenCode[] = ["milk", "gluten", "sesame", "peanuts", "fish"];
const AUTOPLAY_MS = 4800;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Coloured arcs around the rim, one per allergen, that draw themselves in. */
function AllergenArcs({ dish, reduce }: { dish: HeroDish; reduce: boolean }) {
  const r = 47;
  const n = dish.allergens.length;
  const span = 100 / Math.max(n, 1);
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(243,237,226,0.08)" strokeWidth="0.6" />
      {n === 0 ? (
        <motion.circle
          key={`${dish.name}-none`}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.4"
          pathLength={100}
          initial={{ strokeDasharray: "0 100" }}
          animate={{ strokeDasharray: "100 0" }}
          transition={{ duration: reduce ? 0 : 0.9, ease: EASE_OUT, delay: 0.25 }}
        />
      ) : (
        dish.allergens.map((code, i) => (
          <motion.circle
            key={`${dish.name}-${code}`}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={ALLERGEN_COLORS[code]}
            strokeWidth="1.4"
            strokeLinecap="round"
            pathLength={100}
            strokeDashoffset={-i * span}
            initial={{ strokeDasharray: "0 100" }}
            animate={{ strokeDasharray: `${span - 2} 100` }}
            transition={{ duration: reduce ? 0 : 0.7, ease: EASE_OUT, delay: 0.25 + i * 0.12 }}
          />
        ))
      )}
    </svg>
  );
}

/** Text running around the plate, like an engraved rim. */
function RimText({ text, reduce }: { text: string; reduce: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="absolute -inset-[9%] size-[118%]"
      animate={reduce ? undefined : { rotate: -360 }}
      transition={{ duration: 90, ease: "linear", repeat: Infinity }}
      aria-hidden
    >
      <defs>
        <path id="rim" d="M100,100 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
      </defs>
      <text className="fill-[#a49c8c] text-[6.2px] uppercase" style={{ letterSpacing: "0.32em" }}>
        <textPath href="#rim" textLength={576} lengthAdjust="spacing">
          {text}
        </textPath>
      </text>
    </motion.svg>
  );
}

export function PlateHero({ dishes }: { dishes: HeroDish[] }) {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [avoid, setAvoid] = useState<AllergenCode[]>(["milk"]);
  const dish = dishes[index];
  const matches = matchingAllergens(dish.allergens, avoid);
  const go = useCallback((next: number) => setIndex((next + dishes.length) % dishes.length), [dishes.length]);

  useEffect(() => {
    if (reduce || paused || hovering) return;
    const timer = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, hovering, reduce, go]);

  const statement = `${dish.name}  ·  ${
    dish.allergens.length ? `contains ${dish.allergens.map(allergenLabel).join(", ")}` : "free from the 14 major allergens"
  }  ·  `;
  const rim = statement.repeat(statement.length < 48 ? 3 : 2);
  const number = String(index + 1).padStart(2, "0");

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Dishes from the Demo Bistro menu"
      data-testid="hero"
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
    >
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)_minmax(0,1fr)] lg:gap-24 xl:gap-28">
        {/* Left: the dish, set like a menu entry */}
        <div className="order-2 min-w-0 text-center lg:order-1 lg:text-right">
          <p className="text-[11px] uppercase tracking-[0.35em] text-mist">
            No. {number} · {dish.category}
          </p>
          <div className="relative mt-3 flex h-[6.6rem] items-end justify-center overflow-hidden lg:justify-end" aria-live="polite">
            <span className="sr-only" data-testid="hero-dish-name">
              {dish.name}
            </span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={dish.name}
                aria-hidden
                className="font-serif text-[2.9rem] italic leading-[1.05] text-balance text-ivory"
                initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              >
                {dish.name}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mx-auto mt-4 h-px w-24 bg-brass/60 lg:mr-0" />
          <p className="mt-4 font-serif text-2xl text-brass">{formatPrice(dish.priceCents)}</p>
        </div>

        {/* Centre: the plate under a spotlight, turning slowly */}
        <div className="order-1 mx-auto w-[min(72vw,460px)] lg:order-2">
          <div className="relative aspect-square">
            <div aria-hidden className="absolute -inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(243,237,226,0.16),transparent_62%)]" />
            <RimText text={rim} reduce={reduce} />
            <AllergenArcs dish={dish} reduce={reduce} />
            <div className="absolute inset-[7%]">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={dish.name}
                  className="absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { x: "70%", y: "-60%", rotate: 140, scale: 0.6, opacity: 0 }}
                  animate={
                    reduce
                      ? { opacity: 1 }
                      : { x: ["70%", "28%", "0%"], y: ["-60%", "-12%", "0%"], rotate: [140, 40, 0], scale: [0.6, 0.95, 1], opacity: [0, 1, 1] }
                  }
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : { x: "-55%", y: "-55%", rotate: -120, scale: 0.6, opacity: 0, transition: { duration: 0.45, ease: [0.7, 0, 0.84, 0] } }
                  }
                  transition={{ duration: reduce ? 0.2 : 0.75, ease: EASE_OUT, times: [0, 0.55, 1] }}
                >
                  <div aria-hidden className="absolute inset-[4%] translate-x-[6%] translate-y-[9%] rounded-full bg-black/70 blur-2xl" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_26%,#fbf8f2_0%,#e9e2d6_58%,#bfb5a4_100%)] p-[5%] shadow-[inset_0_-8px_18px_rgba(0,0,0,0.18),0_1px_0_rgba(255,255,255,0.6)]"
                    animate={reduce ? undefined : { rotate: 360 }}
                    transition={{ duration: 60, ease: "linear", repeat: Infinity }}
                  >
                    <div className="relative size-full overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        sizes="(min-width: 1024px) 440px, 72vw"
                        priority={index === 0}
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: the allergen check */}
        <div className="order-3 min-w-0 text-center lg:text-left">
          <p className="text-[11px] uppercase tracking-[0.35em] text-mist">Allergen check</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 lg:justify-start">
            {dish.allergens.length === 0 ? (
              <li className="font-serif text-xl italic text-emerald-300">No major allergens</li>
            ) : (
              dish.allergens.map((code) => (
                <li key={code} className="flex items-center gap-2 font-serif text-xl text-ivory">
                  <span className="size-2 rounded-full" style={{ backgroundColor: ALLERGEN_COLORS[code] }} aria-hidden />
                  {allergenLabel(code)}
                </li>
              ))
            )}
          </ul>

          <div className="mx-auto mt-5 h-px w-24 bg-ivory/15 lg:ml-0" />
          <p className="mt-5 text-[11px] uppercase tracking-[0.35em] text-mist">I&apos;m allergic to</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 lg:justify-start">
            {TRY_ALLERGENS.map((code) => {
              const on = avoid.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={on}
                  data-testid={`hero-try-${code}`}
                  onClick={() => setAvoid((a) => (on ? a.filter((c) => c !== code) : [...a, code]))}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    on ? "border-ivory bg-ivory text-ink" : "border-ivory/20 text-ivory/80 hover:border-ivory/50"
                  }`}
                >
                  {allergenLabel(code)}
                </button>
              );
            })}
          </div>
          <div className="mt-4 [perspective:600px]">
            <motion.p
              key={`${dish.name}-${matches.join(",")}-${avoid.length}`}
              animate={reduce ? { opacity: [0, 1] } : { rotateX: [-90, 0], opacity: [0, 1] }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              data-testid="hero-verdict"
              className={`font-serif text-3xl italic ${
                avoid.length === 0 ? "text-mist" : matches.length ? "text-red-400" : "text-emerald-300"
              }`}
            >
              {avoid.length === 0 ? "Pick an allergy" : matches.length ? `Contains: ${formatAllergens(matches)}` : "Safe for you"}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Course selector */}
      <div className="mt-10 flex items-center justify-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous dish"
          data-testid="hero-prev"
          className="grid size-9 shrink-0 place-items-center rounded-full text-ivory/70 hover:text-ivory"
        >
          ←
        </button>
        <ul className="flex min-w-0 gap-1.5 overflow-x-auto p-1.5 sm:gap-2.5">
          {dishes.map((d, i) => (
            <li key={d.name}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${d.name}`}
                aria-current={i === index}
                data-testid={`hero-thumb-${testIdFor(d.name)}`}
                className="relative grid size-10 shrink-0 place-items-center rounded-full sm:size-12"
              >
                {i === index && (
                  <motion.span
                    layoutId="hero-thumb-ring"
                    className="absolute -inset-1 rounded-full border border-brass"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={`relative size-full overflow-hidden rounded-full transition-opacity ${
                    i === index ? "opacity-100" : "opacity-45 hover:opacity-80"
                  }`}
                >
                  <Image src={d.image} alt="" fill sizes="48px" className="object-cover" />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next dish"
          data-testid="hero-next"
          className="grid size-9 shrink-0 place-items-center rounded-full text-ivory/70 hover:text-ivory"
        >
          →
        </button>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play dish slideshow" : "Pause dish slideshow"}
          data-testid="hero-pause"
          className="ml-1 grid size-9 shrink-0 place-items-center rounded-full text-xs text-ivory/60 hover:text-ivory"
        >
          {paused ? "▶" : "❚❚"}
        </button>
      </div>
    </section>
  );
}
