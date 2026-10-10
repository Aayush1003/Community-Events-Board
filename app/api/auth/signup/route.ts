import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE, SessionUser, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Please provide a valid name, email and password." }, { status: 400 });
    }

    const email = result.data.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(result.data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: result.data.name.trim(),
        email,
        passwordHash,
        role: "USER",
      },
    });

    const session: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "USER",
    };

    const token = signToken(session);
    const response = NextResponse.json({
      message: "Account created successfully.",
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
    return NextResponse.json({ error: "Something went wrong while creating the account." }, { status: 500 });
  }
}
