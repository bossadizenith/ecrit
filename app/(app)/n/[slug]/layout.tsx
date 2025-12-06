"use client";

import { NoteProvider } from "@/contex/note";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

const NoteLayout = ({ children }: { children: ReactNode }) => {
  const params = useParams<{ slug: string }>();

  return <NoteProvider slug={params.slug}>{children}</NoteProvider>;
};

export default NoteLayout;
