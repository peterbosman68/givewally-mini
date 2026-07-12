"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { expectedSessionToken, SESSION_COOKIE } from "@/lib/auth";

export type LoginState = { error: string } | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password");
  const configured = process.env.DASHBOARD_PASSWORD;

  if (!configured) {
    return { error: "DASHBOARD_PASSWORD is niet ingesteld op de server." };
  }
  if (typeof password !== "string" || password !== configured) {
    return { error: "Onjuist wachtwoord." };
  }

  const token = expectedSessionToken();
  if (!token) {
    return { error: "Sessie kon niet worden aangemaakt." };
  }

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dagen
  });

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
