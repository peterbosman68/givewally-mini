import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "gw_session";

/**
 * Stateless sessietoken: HMAC van een vaste string met het dashboardwachtwoord
 * als sleutel. Verandert het wachtwoord, dan vervallen alle sessies vanzelf.
 */
export function expectedSessionToken(): string | null {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("givewally-dashboard-sessie").digest("hex");
}

export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const expected = expectedSessionToken();
  if (!token || !expected) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/login");
}
