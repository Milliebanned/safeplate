"use server";

import { eq, like, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { restaurants, users } from "@/db/schema";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import {
  slugify,
  validateEmail,
  validatePassword,
  validateRestaurantName,
} from "@/lib/validation";

export type AuthResult = { fieldErrors?: Record<string, string>; error?: string };

/** Form state for <form action>: errors plus the values to put back (never the password). */
export type AuthFormState = AuthResult & { values?: Record<string, string> };

const text = (form: FormData, key: string) => String(form.get(key) ?? "");

const EMAIL_TAKEN = "An account with this email already exists";

async function emailTaken(email: string) {
  const rows = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email.toLowerCase()));
  return rows.length > 0;
}

/** "luna-cafe" → "luna-cafe", or "luna-cafe-2" if that address is taken, and so on. */
async function uniqueSlug(base: string) {
  const taken = new Set(
    (
      await getDb()
        .select({ slug: restaurants.slug })
        .from(restaurants)
        .where(or(eq(restaurants.slug, base), like(restaurants.slug, `${base}-%`)))
    ).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

export async function signup(input: {
  restaurantName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthResult> {
  const restaurantName = input.restaurantName.trim();
  const email = input.email.trim().toLowerCase();
  const fieldErrors: Record<string, string> = {};

  const nameError = validateRestaurantName(restaurantName);
  if (nameError) fieldErrors.restaurantName = nameError;
  const emailError = validateEmail(email);
  if (emailError) fieldErrors.email = emailError;
  else if (await emailTaken(email)) fieldErrors.email = EMAIL_TAKEN;
  const passwordError = validatePassword(input.password);
  if (passwordError) fieldErrors.password = passwordError;
  if (input.confirmPassword !== input.password) fieldErrors.confirmPassword = "Passwords do not match";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const passwordHash = await hashPassword(input.password);
  const slug = await uniqueSlug(slugify(restaurantName));
  let userId: string;
  try {
    userId = await getDb().transaction(async (tx) => {
      const [user] = await tx.insert(users).values({ email, passwordHash }).returning({ id: users.id });
      await tx.insert(restaurants).values({ ownerId: user.id, name: restaurantName, slug });
      return user.id;
    });
  } catch (error) {
    // Two sign-ups racing for the same email: the unique index decides.
    if ((error as { cause?: { code?: string } }).cause?.code === "23505" && (await emailTaken(email))) {
      return { fieldErrors: { email: EMAIL_TAKEN } };
    }
    throw error;
  }
  await createSession(userId);
  redirect("/dashboard?welcome=1");
}

export async function login(input: { email: string; password: string; next?: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const [user] = await getDb()
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email));
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return { error: "Incorrect email or password" };
  }
  await createSession(user.id);
  const next = input.next ?? "";
  // Only ever return to a dashboard page, never to an outside address.
  redirect(/^\/dashboard(\/[\w-]*)*$/.test(next) ? next : "/dashboard");
}

// Form-action versions: these work even if the button is clicked before the page's
// JavaScript has loaded, and they always POST, so credentials never appear in a URL.

export async function signupAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const values = { restaurantName: text(form, "restaurantName"), email: text(form, "email") };
  const result = await signup({ ...values, password: text(form, "password"), confirmPassword: text(form, "confirmPassword") });
  return { ...result, values };
}

export async function loginAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const values = { email: text(form, "email") };
  const result = await login({ ...values, password: text(form, "password"), next: text(form, "next") || undefined });
  return { ...result, values };
}

export async function logout() {
  await destroySession();
  redirect("/?loggedOut=1");
}
