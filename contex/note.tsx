"use client";

import { KEYS } from "@/lib/keys";
import { QUERIES } from "@/lib/query";
import type { Notes } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, type PropsWithChildren } from "react";

type NoteContextType = {
  data: Notes | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

const NoteContext = createContext<NoteContextType | null>(null);

type NoteProviderProps = PropsWithChildren<{
  slug: string;
}>;

export const NoteProvider = ({ children, slug }: NoteProviderProps) => {
  const { data, isLoading, isError, error, refetch } = useQuery<Notes>({
    queryKey: [KEYS.NOTES, slug],
    queryFn: () => QUERIES.NOTES.bySlug(slug),
    enabled: !!slug,
  });

  return (
    <NoteContext.Provider
      value={{
        data,
        isLoading,
        isError,
        error: error as Error | null,
        refetch,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNote = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNote must be used within a NoteProvider");
  }
  return context;
};
