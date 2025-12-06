import { auth } from "@/lib/auth";
import { cacheKeys, getCache, setCache } from "@/lib/cache";
import { db } from "@/db/drizzle";
import { file as fileTable, notes } from "@/db/schema";
import type { Notes } from "@/lib/types";
import { and, eq } from "drizzle-orm";
import sharp from "sharp";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

export const generateBlurDataUrl = async (
  buffer: Buffer,
  width = 8,
  height?: number
): Promise<string> => {
  try {
    const metadata = await sharp(buffer).metadata();

    if (!height && metadata.width && metadata.height) {
      height = Math.round((metadata.height / metadata.width) * width);
    } else {
      height = width;
    }

    const blurredBuffer = await sharp(buffer)
      .resize(width, height, { fit: "inside" })
      .toFormat("webp")
      .webp({ quality: 20 })
      .toBuffer();

    const base64String = blurredBuffer.toString("base64");
    return `data:image/webp;base64,${base64String}`;
  } catch (error) {
    console.error("Error generating blur data URL:", error);
    return "";
  }
};

const handleAuth = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) throw new UploadThingError("Unauthorized");

  return { user: session.user };
};

const handleNote = async (noteId: string, userId: string) => {
  const cacheKey = cacheKeys.note(userId, noteId);

  const cached = await getCache<Notes>(cacheKey);
  if (cached) {
    return { note: cached };
  }

  const note = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);

  if (note.length === 0) throw new UploadThingError("Note not found");

  await setCache(cacheKey, note[0], 60 * 5);

  return { note: note[0] };
};

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .input(
      z.object({
        noteId: z.string(),
      })
    )
    .middleware(async ({ req, input }) => {
      const { user } = await handleAuth(req);
      const { note } = await handleNote(input.noteId, user.id);

      return { user, note };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const imageResponse = await fetch(file.ufsUrl);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        const blurDataUrl = await generateBlurDataUrl(imageBuffer);

        const [fileRecord] = await db
          .insert(fileTable)
          .values({
            id: crypto.randomUUID(),
            url: file.ufsUrl,
            size: file.size,
            userId: metadata.user.id,
            noteId: metadata.note.id,
          })
          .returning({ id: fileTable.id });

        return {
          uploadedBy: metadata.user.id,
          imageBlurhash: blurDataUrl,
          fileId: fileRecord?.id,
          url: file.ufsUrl,
        };
      } catch (error) {
        if (file && error) {
          const api = new UTApi();
          await api.deleteFiles(file.key);
        }

        console.error(
          "onUploadComplete DB error:",
          error instanceof Error ? error.message : "Unknown error"
        );
        throw new UploadThingError("Failed to persist uploaded file");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
