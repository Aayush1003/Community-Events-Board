import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(2).optional(),
  category: z.enum(["Music", "Workshop", "Food", "Sports", "Kids"]).optional(),
  city: z.string().min(2).optional(),
  dateTime: z.string().optional(),
  price: z.number().min(0).optional(),
  description: z.string().min(10).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSessionFromRequest(request);

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update request." }, { status: 400 });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(parsed.data.title ? { title: parsed.data.title } : {}),
        ...(parsed.data.category ? { category: parsed.data.category } : {}),
        ...(parsed.data.city ? { city: parsed.data.city } : {}),
        ...(parsed.data.dateTime ? { dateTime: new Date(parsed.data.dateTime) } : {}),
        ...(parsed.data.price !== undefined ? { price: parsed.data.price } : {}),
        ...(parsed.data.description ? { description: parsed.data.description } : {}),
        ...(parsed.data.imageUrl ? { imageUrl: parsed.data.imageUrl } : {}),
        ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
      },
    });

    return NextResponse.json({ event });
  } catch {
    return NextResponse.json({ error: "Unable to update event." }, { status: 500 });
  }
}
