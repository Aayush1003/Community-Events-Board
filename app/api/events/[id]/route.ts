import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: {
      id,
      isActive: true,
      dateTime: { gte: new Date() },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const session = getSessionFromRequest(request);
  let isReminder = false;
  let cardDesign = null;

  if (session) {
    const reminder = await prisma.reminder.findUnique({
      where: {
        userId_eventId: {
          userId: session.id,
          eventId: event.id,
        },
      },
    });

    isReminder = Boolean(reminder);

    const design = await prisma.cardDesign.findUnique({
      where: {
        userId_eventId: {
          userId: session.id,
          eventId: event.id,
        },
      },
    });

    cardDesign = design
      ? {
          theme: design.theme,
          stickers: typeof design.stickers === "string" ? JSON.parse(design.stickers) : [],
        }
      : null;
  }

  return NextResponse.json({
    ...event,
    dateTime: event.dateTime.toISOString(),
    isReminder,
    cardDesign,
  });
}
