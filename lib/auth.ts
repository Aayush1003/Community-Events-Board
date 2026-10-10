import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export const AUTH_COOKIE = "community_events_token";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

export function signToken(user: SessionUser) {
  return jwt.sign(user, process.env.JWT_SECRET || "dev-secret-key", {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string | undefined) {
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET || "dev-secret-key") as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  return verifyToken(token);
}

export async function requireUserSession() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getSessionFromCookies();

  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return session;
}

export function getSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${AUTH_COOKIE}=`));

  const token = tokenCookie ? tokenCookie.split("=")[1] : null;
  return verifyToken(token ?? undefined);
}
