"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FlashMessage } from "@/components/flash";
import { inputClass, labelClass, primaryButton } from "@/components/ui";
import { type AuthFormState, loginAction } from "../actions";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(loginAction, {});

  return (
    <form action={formAction} noValidate className="space-y-4" data-testid="login-form">
      {notice && !state.error && (
        <p role="status" data-testid="login-notice" className="rounded-full border border-[#d4a24c]/40 bg-[#d4a24c]/10 px-5 py-2.5 text-sm text-stone-800">
          {notice}
        </p>
      )}
      <FlashMessage flash={state.error ? { kind: "error", text: state.error } : null} />
      {next && <input type="hidden" name="next" value={next} />}
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
          defaultValue={state.values?.email ?? ""}
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
        />
      </div>
      <button type="submit" className={`${primaryButton} w-full`} disabled={pending} data-testid="login-submit">
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-stone-600">
        New to SafePlate?{" "}
        <Link href="/signup" className="font-semibold text-ink underline decoration-[#d4a24c] decoration-2 underline-offset-4" data-testid="go-signup">
          Create a free account
        </Link>
      </p>
    </form>
  );
}
