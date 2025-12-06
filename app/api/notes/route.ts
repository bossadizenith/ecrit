import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { notes } from "@/db/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import { nanoid } from "nanoid";
import { noteSchema } from "@/lib/zod-schema";

export const GET = async (request: NextRequest) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");

  const whereConditions = search
    ? and(
        eq(notes.userId, session.user.id),
        or(
          ilike(notes.title, `%${search}%`),
          ilike(notes.content, `%${search}%`)
        )
      )
    : eq(notes.userId, session.user.id);

  const userNotes = await db
    .select()
    .from(notes)
    .where(whereConditions)
    .orderBy(desc(notes.createdAt));

  return NextResponse.json(userNotes);
};

export const POST = async (request: NextRequest) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, slug } = noteSchema.parse(body);

  try {
    const newNote = await db
      .insert(notes)
      .values({
        id: nanoid(),
        title,
        slug,
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json(newNote[0], { status: 201 });
  } catch (error: unknown) {
    const dbError = error as { cause?: { code?: string } };
    if (dbError.cause?.code === "23505") {
      return NextResponse.json(
        { error: `A note with slug "${slug}" already exists` },
        { status: 409 }
      );
    }
    throw error;
  }
};
