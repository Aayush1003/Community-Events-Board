import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(2),
  category: z.enum(["Music", "Workshop", "Food", "Sports", "Kids"]),
  city: z.string().min(2),
  dateTime: z.string().min(1),
  price: z.number().min(0),
  description: z.string().min(10),
  imageUrl: z.string().url(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: { dateTime: "desc" },
  });

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please complete all event details." }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title: parsed.data.title,
        category: parsed.data.category,
        city: parsed.data.city,
        dateTime: new Date(parsed.data.dateTime),
        price: parsed.data.price,
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl,
        isActive: parsed.data.isActive ?? true,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create event." }, { status: 500 });
  }
}
