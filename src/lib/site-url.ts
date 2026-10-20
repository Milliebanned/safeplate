import "server-only";
import { headers } from "next/headers";

/** The address this deployment is being visited on, e.g. https://safeplate.milliebanned.xyz */
export async function siteUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
