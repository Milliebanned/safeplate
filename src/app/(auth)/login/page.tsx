import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getOwner()) redirect("/dashboard");
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Log in to SafePlate</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">Manage your ingredients, dishes and public menu.</p>
      <LoginForm next={nextPath} notice={nextPath ? "Please log in to continue." : undefined} />
    </>
  );
}
