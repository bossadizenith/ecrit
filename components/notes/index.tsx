"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERIES } from "@/lib/query";
import { KEYS } from "@/lib/keys";
import { Notes as NoteType } from "@/lib/types";
import { Button } from "../ui/button";
import { useDesktopOS } from "@/hooks/use-os";

export const Notes = () => {
  const os = useDesktopOS();
  const { data, isLoading, error } = useQuery({
    queryKey: [KEYS.NOTES],
    queryFn: () => QUERIES.NOTES.all(),
    initialData: [],
  });

  if (isLoading) return <div>Loading...</div>;
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
          <Button>
            Create Note{" "}
            <span className="text-muted-foreground">{`(${os} + N)`}</span>
          </Button>
        </div>
      </div>
    );

  return (
    <div>
      {data.map((note: NoteType) => (
        <Note key={note.id} note={note} />
      ))}
    </div>
  );
};

const Note = ({ note }: { note: NoteType }) => {
  return <div>{note.title}</div>;
};
