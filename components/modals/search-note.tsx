"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useModal from "@/hooks/use-modal";
import { KEYS } from "@/lib/keys";
import { QUERIES } from "@/lib/query";
import { Notes } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const SearchNote = () => {
  const { onClose, type } = useModal();
  const router = useRouter();
  const isSearchNoteModalOpen = type === "search";

  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [KEYS.NOTES],
    queryFn: () => QUERIES.NOTES.all(),
    enabled: isSearchNoteModalOpen,
  });

  const filteredNotes =
    data?.filter((note: Notes) =>
      note.title.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, isSearchNoteModalOpen]);

  useEffect(() => {
    if (!isSearchNoteModalOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isSearchNoteModalOpen]);

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleNavigateToNote = (slug: string) => {
    router.push(`/n/${slug}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredNotes.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredNotes.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredNotes.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        const selectedNote = filteredNotes[selectedIndex];
        if (selectedNote) {
          handleNavigateToNote(selectedNote.slug);
        }
        break;
    }
  };

  return (
    <Dialog open={isSearchNoteModalOpen} onOpenChange={onClose}>
      <DialogContent className="-translate-y-full outline-none min-h-fit max-h-[400px] overflow-hidden p-0">
        <div className="flex flex-col h-full" onKeyDown={handleKeyDown}>
          <div className="sticky top-0 bg-background z-10 border-b">
            <Input
              placeholder="Search notes..."
              className="border-none focus-visible:ring-0"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div
            className="flex flex-col flex-1 p-2 overflow-y-auto"
            ref={listRef}
          >
            {isLoading && (
              <p className="text-sm text-muted-foreground p-2">Loading...</p>
            )}
            {error && (
              <p className="text-sm text-destructive p-2">
                Error: {error.message}
              </p>
            )}
            {!isLoading && filteredNotes.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">
                No notes found
              </p>
            )}
            {filteredNotes.map((note: Notes, index: number) => (
              <button
                key={note.id}
                type="button"
                className={cn(
                  "text-left p-2 rounded-md transition-colors",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
                onClick={() => handleNavigateToNote(note.slug)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="font-medium">{note.title}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
