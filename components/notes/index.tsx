"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERIES } from "@/lib/query";
import { KEYS } from "@/lib/keys";
import { Notes as NoteType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useDesktopOS } from "@/hooks/use-os";
import useModal from "@/hooks/use-modal";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export const Notes = () => {
  const os = useDesktopOS();
  const { onOpen } = useModal();
  const { data, isLoading, error } = useQuery({
    queryKey: [KEYS.NOTES],
    queryFn: () => QUERIES.NOTES.all(),
  });

  if (isLoading)
    return (
      <div className="flex flex-col divide-y w-full border">
        {Array.from({ length: 10 }).map((_, index) => (
          <NoteSkeleton key={index} />
        ))}
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

  if (data.length === 0)
    return (
      <div>
        <div className="flex flex-col gap-8 items-center justify-center h-full">
          <div className="flex flex-col gap-2 items-center justify-center">
            <h1 className="text-2xl font-bold font-mono">No notes found</h1>
            <p className="text-lg text-muted-foreground">
              Create your first note to get started
            </p>
          </div>
          <Button onClick={() => onOpen("create-note")}>
            Create Note{" "}
            <span className="text-muted-foreground">{`(${os} + N)`}</span>
          </Button>
        </div>
      </div>
    );

  return (
    <div className="flex  flex-col justify-between w-full border divide-y">
      {data.map((note: NoteType) => (
        <Note key={note.id} note={note} />
      ))}
    </div>
  );
};

const Note = ({ note }: { note: NoteType }) => {
  console.log(note);
  return (
    <Link href={`/n/${note.slug}`} className="p-4 flex items-center gap-4">
      <div className="size-8 flex items-center justify-center border bg-muted/20">
        <Icons.file className="size-4" />
      </div>
      <div className="flex flex-col flex-1">
        <p className="text-sm font-mono first-letter:uppercase">{note.title}</p>
        <p className="text-xs text-muted-foreground w-fit ml-auto">
          {new Date(note.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
};

const NoteSkeleton = () => {
  return (
    <div className="p-4 flex items-center gap-4">
      <div className="size-8 flex items-center justify-center border bg-muted/20">
        <Icons.file className="size-4" />
      </div>
      <div className="flex flex-col flex-1">
        <p className="text-sm font-mono first-letter:uppercase">
          <Skeleton className="w-1/2 h-4" />
        </p>
        <p className="text-xs text-muted-foreground w-fit ml-auto">
          <Skeleton className="w-20 h-3" />
        </p>
      </div>
    </div>
  );
};
