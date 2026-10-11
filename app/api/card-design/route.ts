import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  eventId: z.string().min(1),
  theme: z.enum(["sunset", "ocean", "cyber"]),
  stickers: z.array(z.enum(["🎉", "🎵", "🌟", "🍕", "🎨"])).max(3),
});

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid card design data." }, { status: 400 });
  }

  const design = await prisma.cardDesign.upsert({
    where: {
      userId_eventId: {
        userId: session.id,
        eventId: parsed.data.eventId,
      },
    },
    update: {
      theme: parsed.data.theme,
      stickers: JSON.stringify(parsed.data.stickers),
    },
    create: {
      userId: session.id,
      eventId: parsed.data.eventId,
      theme: parsed.data.theme,
      stickers: JSON.stringify(parsed.data.stickers),
    },
  });

  return NextResponse.json({
    design: {
      ...design,
      stickers: typeof design.stickers === "string" ? JSON.parse(design.stickers) : [],
    },
  });
}
