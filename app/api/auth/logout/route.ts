import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully." });
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  return response;
}
