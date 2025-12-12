import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { notes } from "@/db/schema";
import { eq, desc, and, or, ilike, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { noteSchema } from "@/lib/zod-schema";
import { cacheKeys, getCache, setCache, deleteCacheKeys } from "@/lib/cache";

const CACHE_TTL = 60 * 5;

export const GET = async (request: NextRequest) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
  );
  const offset = (page - 1) * limit;

  const cacheKey = cacheKeys.notesList(
    session.user.id,
    String(page),
    String(limit),
    search || ""
  );

  const cached = await getCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const whereConditions = search
    ? and(
        eq(notes.userId, session.user.id),
        or(
          ilike(notes.title, `%${search}%`),
          ilike(notes.content, `%${search}%`)
        )
      )
    : eq(notes.userId, session.user.id);

  const [userNotes, totalResult] = await Promise.all([
    db
      .select({
        id: notes.id,
        title: notes.title,
        slug: notes.slug,
        userId: notes.userId,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(whereConditions)
      .orderBy(desc(notes.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(notes).where(whereConditions),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  const response = {
    data: userNotes,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };

  await setCache(cacheKey, response, CACHE_TTL);

  return NextResponse.json(response);
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

    await deleteCacheKeys(cacheKeys.allNotesListKeys(session.user.id));

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
