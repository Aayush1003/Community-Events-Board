import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favourites = await prisma.userFavourite.findMany({
    where: { userId: session.id },
    select: { category: true },
  });

  if (favourites.length === 0) {
    return NextResponse.json({ events: [] });
  }

  const categories = favourites.map((item) => item.category);
  const events = await prisma.event.findMany({
    where: {
      isActive: true,
      dateTime: { gte: new Date() },
      category: { in: categories },
    },
    orderBy: { dateTime: "asc" },
  });

  const reminderRows = await prisma.reminder.findMany({
    where: { userId: session.id },
    select: { eventId: true },
  });

  const reminderIds = new Set(reminderRows.map((item) => item.eventId));

  return NextResponse.json({
    events: events.map((event) => ({
      ...event,
      isReminder: reminderIds.has(event.id),
    })),
  });
}
