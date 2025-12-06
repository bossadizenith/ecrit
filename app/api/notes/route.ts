import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { notes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { noteSchema } from "@/lib/zod-schema";

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(session.user.id);

  const userNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, session.user.id))
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
};
