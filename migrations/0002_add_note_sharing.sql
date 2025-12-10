ALTER TABLE "notes" ADD COLUMN "public" boolean DEFAULT false NOT NULL;
ALTER TABLE "notes" ADD COLUMN "share_password" text;
