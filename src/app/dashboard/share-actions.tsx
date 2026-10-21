"use client";

import { useState } from "react";

export function ShareActions({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        data-testid="copy-menu-link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            setCopied(false);
          }
        }}
        className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-black"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
      <button
        type="button"
        data-testid="print-table-card"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink"
      >
        Print table card
      </button>
    </div>
  );
}
