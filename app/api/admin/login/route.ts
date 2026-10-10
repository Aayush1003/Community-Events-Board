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
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 400 });
    }

    const email = result.data.email.toLowerCase();
    const password = result.data.password;

    let adminUser = await prisma.user.findUnique({ where: { email } });

    if (!adminUser) {
      const passwordHash = await bcrypt.hash(password, 10);
      adminUser = await prisma.user.create({
        data: {
          name: "Admin User",
          email,
          passwordHash,
          role: "ADMIN",
        },
      });
    }

    const passwordMatches = await bcrypt.compare(password, adminUser.passwordHash);

    if (!passwordMatches || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    const session: SessionUser = {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    };

    const token = signToken(session);
    const response = NextResponse.json({
      message: "Admin login successful.",
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
    return NextResponse.json({ error: "Unable to log in as admin." }, { status: 500 });
  }
}
