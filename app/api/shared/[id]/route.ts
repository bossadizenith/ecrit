import { db } from "@/db/drizzle";
import { notes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    // Find the public note
    const note = await db.query.notes.findFirst({
      where: and(eq(notes.id, id), eq(notes.public, true)),
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found or not shared" },
        { status: 404 }
      );
    }

    // Check password if required
    if (note.sharePassword) {
      if (!password) {
        return NextResponse.json(
          { error: "Password required", requiresPassword: true },
          { status: 401 }
        );
      }

      const isValidPassword = await bcrypt.compare(
        password,
        note.sharePassword
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid password", requiresPassword: true },
          { status: 401 }
        );
      }
    }

    // Return note without sensitive data
    return NextResponse.json({
      id: note.id,
      title: note.title,
      slug: note.slug,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch shared note" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the public note
    const note = await db.query.notes.findFirst({
      where: and(eq(notes.id, id), eq(notes.public, true)),
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found or not shared" },
        { status: 404 }
      );
    }

    // If password protected, indicate that
    if (note.sharePassword) {
      return NextResponse.json({
        requiresPassword: true,
        title: note.title,
      });
    }

    // Return note without sensitive data
    return NextResponse.json({
      id: note.id,
      title: note.title,
      slug: note.slug,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch shared note" },
      { status: 500 }
    );
  }
}
