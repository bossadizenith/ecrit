import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
});

export const noteContentSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  content: z.string().min(1),
});

export const displayNameSchema = z.object({
  displayName: z
    .string()
    .min(4, "4 characters minimum")
    .max(32, "32 characters maximum"),
});

export const url = z.object({
  url: z
    .string()
    .min(4, "4 characters minimum")
    .regex(
      /^[a-z0-9_-]+$/,
      "Only lowercase letters, numbers, hyphens, and underscores are allowed"
    )
    .max(32, "32 characters maximum"),
});

export const visible = z.object({
  visible: z.boolean(),
});

export type NoteSchema = z.infer<typeof noteSchema>;
export type NoteContentSchema = z.infer<typeof noteContentSchema>;
export type DisplayNameSchema = z.infer<typeof displayNameSchema>;
export type UsernameUrl = z.infer<typeof url>;
export type Visible = z.infer<typeof visible>;
