import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const search = searchParams.get("search") || "";
  const pageSize = 6;

  const where: Prisma.EventWhereInput = {
    isActive: true,
    dateTime: { gte: new Date() },
  };

  if (category) {
    where.category = category;
  }

  if (city) {
    where.city = { contains: city };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const total = await prisma.event.count({ where });
  const events = await prisma.event.findMany({
    where,
    orderBy: { dateTime: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const session = getSessionFromRequest(request);
  let reminderIds = new Set<string>();

  if (session) {
    const reminders = await prisma.reminder.findMany({
      where: { userId: session.id },
      select: { eventId: true },
    });

    reminderIds = new Set(reminders.map((item) => item.eventId));
  }

  return NextResponse.json({
    events: events.map((event) => ({
      ...event,
      isReminder: reminderIds.has(event.id),
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page,
  });
}
