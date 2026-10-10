import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  eventId: z.string().min(1),
});

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.id },
    select: { eventId: true },
  });

  return NextResponse.json({
    eventIds: reminders.map((item) => item.eventId),
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
    return NextResponse.json({ error: "Invalid reminder request." }, { status: 400 });
  }

  const existingReminder = await prisma.reminder.findUnique({
    where: {
      userId_eventId: {
        userId: session.id,
        eventId: parsed.data.eventId,
      },
    },
  });

  if (existingReminder) {
    await prisma.reminder.delete({ where: { id: existingReminder.id } });
    return NextResponse.json({ isReminder: false });
  }

  await prisma.reminder.create({
    data: {
      userId: session.id,
      eventId: parsed.data.eventId,
    },
  });

  return NextResponse.json({ isReminder: true });
}
