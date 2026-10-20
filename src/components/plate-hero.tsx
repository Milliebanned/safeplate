"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { allergenLabel, type AllergenCode, formatAllergens, matchingAllergens } from "@/lib/allergens";
import type { HeroDish } from "@/lib/hero-dishes";
import { testIdFor } from "@/lib/test-id";
import { formatPrice } from "@/lib/validation";

const TRY_ALLERGENS: AllergenCode[] = ["milk", "gluten", "sesame", "peanuts", "fish"];
const AUTOPLAY_MS = 5200;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Title that wipes in letter by letter, in two weights (thin + heavy). */
function RevealTitle({ light, bold, reduce }: { light: string; bold: string; reduce: boolean }) {
  const line = (text: string, className: string, offset: number) => (
    <span className={`block overflow-hidden pb-1 ${className}`} aria-hidden>
      {[...text].map((ch, i) => (
        <motion.span
          key={`${text}-${i}`}
          className="inline-block whitespace-pre"
          initial={reduce ? { opacity: 0 } : { y: "110%", opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { y: "0%", opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "-110%", opacity: 0, transition: { duration: 0.25, delay: i * 0.012 } }}
          transition={{ duration: 0.55, ease: EASE_OUT, delay: offset + i * 0.03 }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
  return (
    <>
      {line(light, "font-extralight tracking-tight", 0.35)}
      {line(bold, "font-extrabold tracking-tight", 0.5)}
    </>
  );
}

/** A ceramic plate that swoops in on a curved 3D arc while spinning, like a plate being set down. */
function Plate({ dish, reduce, priority }: { dish: HeroDish; reduce: boolean; priority: boolean }) {
  const arcIn = {
    x: [340, 170, 0],
    y: [-300, -70, 0],
    rotate: [170, 55, 0],
    scale: [0.72, 0.96, 1],
    opacity: [0, 1, 1],
  };
  return (
    <motion.div
      className="absolute inset-0"
      initial={reduce ? { opacity: 0 } : { x: 340, y: -300, rotate: 170, scale: 0.72, opacity: 0 }}
      animate={reduce ? { opacity: 1 } : arcIn}
      exit={
        reduce
          ? { opacity: 0 }
          : { x: -140, y: -320, rotate: -150, scale: 0.7, opacity: 0, transition: { duration: 0.6, ease: [0.55, 0, 0.75, 0.25] } }
      }
      transition={reduce ? { duration: 0.3 } : { duration: 1.15, ease: EASE_OUT, times: [0, 0.6, 1] }}
    >
      {/* soft contact shadow, light from the upper left */}
      <div className="absolute inset-[6%] translate-x-[5%] translate-y-[7%] rounded-full bg-slate-900/25 blur-2xl" aria-hidden />
      {/* ceramic rim */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,#ffffff_0%,#f6f3ee_55%,#e7e1d8_100%)] p-[5.5%] shadow-[inset_0_-6px_14px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.9)]">
        <div className="relative size-full overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            sizes="(min-width: 1024px) 420px, 280px"
            priority={priority}
            className="object-cover"
          />
        </div>
      </div>
    </motion.div>
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

  // Autoplay (never for people who prefer reduced motion), paused while hovering or paused by the user.
  useEffect(() => {
    if (reduce || paused || hovering) return;
    const timer = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, hovering, reduce, go]);

  // Subtle 3D tilt of the whole stage following the pointer.
  const stageRef = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [9, -9]), { stiffness: 120, damping: 14 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 14 });

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Dishes from the Demo Bistro menu"
      data-testid="hero"
      className="relative isolate"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        px.set(0);
        py.set(0);
      }}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-4">
        {/* Plate stage */}
        <div
          ref={stageRef}
          className="relative mx-auto aspect-square w-full max-w-[460px] [perspective:1100px]"
          onMouseMove={(e) => {
            if (reduce || !stageRef.current) return;
            const r = stageRef.current.getBoundingClientRect();
            px.set((e.clientX - r.left) / r.width - 0.5);
            py.set((e.clientY - r.top) / r.height - 0.5);
          }}
        >
          {/* Rotating colour arc behind the plate */}
          <motion.svg
            viewBox="0 0 400 400"
            className="pointer-events-none absolute -inset-[22%] -z-10 size-[144%]"
            animate={{ rotate: reduce ? 0 : index * 62 }}
            transition={{ duration: 1.4, ease: EASE_OUT }}
            aria-hidden
          >
            <motion.circle
              cx="200"
              cy="200"
              r="150"
              fill="none"
              strokeWidth="58"
              strokeLinecap="round"
              strokeDasharray="520 1000"
              animate={{ stroke: dish.tint }}
              transition={{ duration: 0.9 }}
            />
            <motion.circle
              cx="200"
              cy="200"
              r="186"
              fill="none"
              strokeWidth="2"
              strokeDasharray="4 10"
              animate={{ stroke: dish.accent }}
              opacity={0.35}
              transition={{ duration: 0.9 }}
            />
          </motion.svg>

          <motion.div className="absolute inset-[7%]" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
            <AnimatePresence initial={false} mode="popLayout">
              <Plate key={dish.name} dish={dish} reduce={reduce} priority={index === 0} />
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Title + glass card */}
        <div className="relative space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Demo Bistro · {dish.category}
            </p>
            <h2 className="font-display text-5xl leading-[0.95] text-slate-900 sm:text-6xl" aria-live="polite">
              <span className="sr-only" data-testid="hero-dish-name">
                {dish.name}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={dish.name} className="block">
                  <RevealTitle light={dish.light} bold={dish.bold} reduce={reduce} />
                </motion.span>
              </AnimatePresence>
            </h2>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/65 p-5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <motion.div
                key={`count-${dish.name}`}
                initial={reduce ? false : { rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 }}
                className="grid size-16 shrink-0 place-items-center rounded-2xl text-white shadow-lg [transform-style:preserve-3d]"
                style={{ backgroundColor: dish.accent }}
              >
                <span className="text-center leading-none">
                  <span className="block text-2xl font-extrabold">{dish.allergens.length}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide">allergens</span>
                </span>
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-slate-900">Allergen check</p>
                  <p className="text-sm font-semibold text-slate-700">{formatPrice(dish.priceCents)}</p>
                </div>
                <p className="mt-0.5 text-sm text-slate-600">
                  {dish.allergens.length
                    ? `Contains ${formatAllergens(dish.allergens)} — calculated from every ingredient and sauce.`
                    : "No major allergens — calculated from every ingredient and sauce."}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200/70 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Try it — I&apos;m allergic to:</p>
              <div className="flex flex-wrap gap-1.5">
                {TRY_ALLERGENS.map((code) => {
                  const on = avoid.includes(code);
                  return (
                    <motion.button
                      key={code}
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      aria-pressed={on}
                      data-testid={`hero-try-${code}`}
                      onClick={() => setAvoid((a) => (on ? a.filter((c) => c !== code) : [...a, code]))}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                        on ? "border-red-600 bg-red-600 text-white" : "border-slate-300 bg-white/80 text-slate-700 hover:bg-white"
                      }`}
                    >
                      {allergenLabel(code)}
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-3 [perspective:600px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={`${dish.name}-${matches.join(",")}-${avoid.length === 0}`}
                    data-testid="hero-verdict"
                    initial={reduce ? { opacity: 0 } : { rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { rotateX: 90, opacity: 0 }}
                    transition={{ duration: 0.32, ease: EASE_OUT }}
                    className={`inline-flex rounded-xl px-3 py-1.5 text-sm font-semibold ${
                      avoid.length === 0
                        ? "bg-slate-100 text-slate-700"
                        : matches.length
                          ? "bg-red-50 text-red-800"
                          : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {avoid.length === 0
                      ? "Pick an allergy to check this dish"
                      : matches.length
                        ? `Contains: ${formatAllergens(matches)}`
                        : "Safe for you"}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dish strip with a sliding highlight */}
      <div className="mt-8 flex items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous dish"
          data-testid="hero-prev"
          className="grid size-10 place-items-center rounded-full text-slate-600 hover:bg-white"
        >
          ‹
        </button>
        <ul className="flex gap-1 sm:gap-2">
          {dishes.map((d, i) => (
            <li key={d.name}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${d.name}`}
                aria-current={i === index}
                data-testid={`hero-thumb-${testIdFor(d.name)}`}
                className="relative grid w-14 place-items-center rounded-2xl px-1 py-2 sm:w-20"
              >
                {i === index && (
                  <motion.span
                    layoutId="hero-thumb-highlight"
                    className="absolute inset-0 rounded-2xl bg-white shadow-md"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative size-10 overflow-hidden rounded-full ring-2 ring-white sm:size-12">
                  <Image src={d.image} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <span className="relative mt-1 hidden truncate text-[11px] font-medium text-slate-600 sm:block">{d.bold}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next dish"
          data-testid="hero-next"
          className="grid size-10 place-items-center rounded-full text-slate-600 hover:bg-white"
        >
          ›
        </button>
        {!reduce && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play dish slideshow" : "Pause dish slideshow"}
            data-testid="hero-pause"
            className="ml-1 grid size-10 place-items-center rounded-full text-slate-600 hover:bg-white"
          >
            {paused ? "▶" : "❚❚"}
          </button>
        )}
      </div>
    </section>
  );
}
