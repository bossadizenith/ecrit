import { account, notes, session, user, verification } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof user>;
export type Account = InferSelectModel<typeof account>;
export type Session = InferSelectModel<typeof session>;
export type Verification = InferSelectModel<typeof verification>;
export type Notes = InferSelectModel<typeof notes>;

export type ModalTypes = "create-note" | "search" | "settings";
