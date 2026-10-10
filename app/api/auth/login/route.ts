import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, SessionUser, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    const email = result.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(result.data.password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const role = user.role === "ADMIN" ? "ADMIN" : "USER";
    const session: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
    };

    const token = signToken(session);
    const response = NextResponse.json({
      message: "Logged in successfully.",
      token,
      user: session,
    });

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Something went wrong while logging in." }, { status: 500 });
  }
}
