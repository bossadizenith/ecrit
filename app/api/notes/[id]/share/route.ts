import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { notes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { deleteCacheByPattern } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache/cache-keys";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { public: isPublic, password } = body;

    // Verify note ownership
    const existingNote = await db.query.notes.findFirst({
      where: and(eq(notes.id, id), eq(notes.userId, session.user.id)),
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update note sharing settings
    const [updatedNote] = await db
      .update(notes)
      .set({
        public: isPublic,
        sharePassword: isPublic ? hashedPassword : null,
      })
      .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
      .returning();

    // Invalidate cache
    await deleteCacheByPattern(CACHE_KEYS.NOTES.BY_SLUG(existingNote.slug));
    await deleteCacheByPattern(CACHE_KEYS.NOTES.BY_ID(id));

    return NextResponse.json({
      ...updatedNote,
      shareUrl: isPublic
        ? `${process.env.BETTER_AUTH_URL}/shared/${existingNote.slug}`
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update sharing settings" },
      { status: 500 }
    );
  }
}
