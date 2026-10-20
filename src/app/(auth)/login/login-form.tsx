"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { FlashMessage } from "@/components/flash";
import { inputClass, labelClass, primaryButton } from "@/components/ui";
import { login } from "../actions";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await login({ email, password, next });
      setError(result?.error ?? null);
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" data-testid="login-form">
      {notice && !error && (
        <p role="status" data-testid="login-notice" className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {notice}
        </p>
      )}
      <FlashMessage flash={error ? { kind: "error", text: error } : null} />
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          data-testid="login-email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          data-testid="login-password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" className={`${primaryButton} w-full`} disabled={pending} data-testid="login-submit">
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-slate-600">
        New to SafePlate?{" "}
        <Link href="/signup" className="font-semibold text-emerald-700 hover:underline" data-testid="go-signup">
          Create a free account
        </Link>
      </p>
    </form>
  );
}
