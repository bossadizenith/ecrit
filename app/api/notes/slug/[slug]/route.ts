import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { notes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ slug: string }> };

export const GET = async (_request: NextRequest, { params }: Params) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const note = await db
    .select()
    .from(notes)
    .where(and(eq(notes.slug, slug), eq(notes.userId, session.user.id)))
    .limit(1);

  if (note.length === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json(note[0]);
};
