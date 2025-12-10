"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERIES } from "@/lib/query";
import { KEYS } from "@/lib/keys";
import { Notes as NoteType, PaginatedNotes } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useDesktopOS } from "@/hooks/use-os";
import useModal from "@/hooks/use-modal";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Notes = () => {
  const os = useDesktopOS();
  const { onOpen } = useModal();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<PaginatedNotes>({
    queryKey: [KEYS.NOTES, page],
    queryFn: () => QUERIES.NOTES.all({ page, limit: 10 }),
  });

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (data?.pagination.hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col divide-y w-full border">
        {Array.from({ length: 10 }).map((_, index) => (
          <NoteSkeleton key={index} />
        ))}
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

  const notes = data?.data ?? [];

  if (notes.length === 0)
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
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col justify-between w-full border divide-y">
        {notes.map((note: NoteType) => (
          <Note key={note.id} note={note} />
        ))}
      </div>
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between w-full">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </p>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn("border-l-0", page === 1 && "border-l")}
              onClick={handleNextPage}
              disabled={!data.pagination.hasMore}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const Note = ({ note }: { note: NoteType }) => {
  return (
    <Link href={`/n/${note.slug}`} className="p-4 flex items-center gap-4">
      <div className="size-8 flex items-center justify-center border bg-muted/20">
        <Icons.file className="size-4" />
      </div>
      <div className="flex flex-col flex-1">
        <p className="text-sm font-mono">{note.title}</p>
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

// voice transcribing

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
