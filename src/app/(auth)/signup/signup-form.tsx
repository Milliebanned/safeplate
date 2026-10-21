"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FieldError } from "@/components/flash";
import { inputClass, labelClass, primaryButton } from "@/components/ui";
import { type AuthFormState, signupAction } from "../actions";

const FIELDS = [
  { name: "restaurantName", label: "Restaurant name", type: "text", autoComplete: "organization" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
] as const;

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signupAction, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="space-y-4" data-testid="signup-form">
      {FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className={labelClass}>
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            data-testid={`signup-${field.name}`}
            className={inputClass}
            defaultValue={field.type === "password" ? undefined : (state.values?.[field.name] ?? "")}
            aria-invalid={Boolean(errors[field.name])}
            aria-describedby={errors[field.name] ? `error-${field.name}` : undefined}
          />
          <FieldError id={`error-${field.name}`} message={errors[field.name]} />
        </div>
      ))}
      <button type="submit" className={`${primaryButton} w-full`} disabled={pending} data-testid="signup-submit">
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink underline decoration-[#d4a24c] decoration-2 underline-offset-4" data-testid="go-login">
          Log in
        </Link>
      </p>
    </form>
  );
}
