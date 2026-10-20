"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { FieldError } from "@/components/flash";
import { inputClass, labelClass, primaryButton } from "@/components/ui";
import { signup } from "../actions";

const FIELDS = [
  { name: "restaurantName", label: "Restaurant name", type: "text", autoComplete: "organization" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
] as const;

type Values = Record<(typeof FIELDS)[number]["name"], string>;

export function SignupForm() {
  const [values, setValues] = useState<Values>({ restaurantName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await signup(values);
      setErrors(result?.fieldErrors ?? {});
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" data-testid="signup-form">
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
            value={values[field.name]}
            aria-invalid={Boolean(errors[field.name])}
            aria-describedby={errors[field.name] ? `error-${field.name}` : undefined}
            onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
          />
          <FieldError id={`error-${field.name}`} message={errors[field.name]} />
        </div>
      ))}
      <button type="submit" className={`${primaryButton} w-full`} disabled={pending} data-testid="signup-submit">
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-emerald-700 hover:underline" data-testid="go-login">
          Log in
        </Link>
      </p>
    </form>
  );
}
