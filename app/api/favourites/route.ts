import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  categories: z.array(z.enum(["Music", "Workshop", "Food", "Sports", "Kids"])),
});

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favourites = await prisma.userFavourite.findMany({
    where: { userId: session.id },
    select: { category: true },
  });

  return NextResponse.json({
    categories: favourites.map((item) => item.category),
  });
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please select valid categories." }, { status: 400 });
  }

  await prisma.userFavourite.deleteMany({
    where: { userId: session.id },
  });

  if (parsed.data.categories.length > 0) {
    await prisma.userFavourite.createMany({
      data: parsed.data.categories.map((category) => ({
        userId: session.id,
        category,
      })),
    });
  }

  return NextResponse.json({
    categories: parsed.data.categories,
  });
}
