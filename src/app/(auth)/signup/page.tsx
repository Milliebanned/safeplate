import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage() {
  if (await getOwner()) redirect("/dashboard");
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">Create your free account</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">Publish an allergen-safe menu in minutes.</p>
      <SignupForm />
    </>
  );
}
