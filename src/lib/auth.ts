import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { restaurants, sessions, users } from "@/db/schema";

const COOKIE_NAME = "sp_session";
const SESSION_DAYS = 30;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await getDb().insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) await getDb().delete(sessions).where(eq(sessions.id, hashToken(token)));
  jar.delete(COOKIE_NAME);
}

export type Owner = {
  userId: string;
  email: string;
  restaurant: { id: string; name: string; slug: string };
};

/** The signed-in owner and their restaurant, or null. Checked against the database every time. */
export async function getOwner(): Promise<Owner | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [row] = await getDb()
    .select({
      userId: users.id,
      email: users.email,
      restaurantId: restaurants.id,
      restaurantName: restaurants.name,
      slug: restaurants.slug,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .innerJoin(restaurants, eq(restaurants.ownerId, users.id))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())));
  if (!row) return null;
  return {
    userId: row.userId,
    email: row.email,
    restaurant: { id: row.restaurantId, name: row.restaurantName, slug: row.slug },
  };
}

/** For dashboard pages and actions: redirects to /login when nobody is signed in. */
export async function requireOwner(returnTo = "/dashboard"): Promise<Owner> {
  const owner = await getOwner();
  if (!owner) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return owner;
}
