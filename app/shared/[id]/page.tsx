"use client";

import { parseContent } from "@/components/editor";
import { defaultExtensions } from "@/components/editor/extensions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { QUERIES } from "@/lib/query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Lock } from "lucide-react";
import { useParams } from "next/navigation";
import { EditorContent, EditorRoot } from "novel";
import { useState } from "react";
import { toast } from "sonner";

type SharedNote = {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type SharedNoteResponse =
  | SharedNote
  | { requiresPassword: boolean; title: string };

const SHARED_NOTE_KEY = "shared-note";

export default function SharedNotePage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");

  const { data, isLoading, error } = useQuery<SharedNoteResponse>({
    queryKey: [SHARED_NOTE_KEY, id],
    queryFn: () => QUERIES.SHARED.get(id),
  });

  const { mutate: submitPassword, isPending: isSubmitting } = useMutation({
    mutationFn: (pwd: string) => QUERIES.SHARED.access(id, pwd),
    onSuccess: (response: SharedNote) => {
      queryClient.setQueryData([SHARED_NOTE_KEY, id], response);
      setPassword("");
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || "Invalid password");
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPassword(password);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    const axiosError = error as { response?: { status?: number } };
    const errorMessage =
      axiosError.response?.status === 404
        ? "Note not found or not shared"
        : "Failed to load note";

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-semibold">{errorMessage}</h1>
          <p className="text-muted-foreground">
            This note may have been deleted or is no longer shared.
          </p>
        </div>
      </div>
    );
  }

  if (data && "requiresPassword" in data && data.requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-semibold">{data.title}</h1>
            <p className="text-muted-foreground">
              This note is password protected
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <LoadingButton
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={!password || isSubmitting}
            >
              Access Note
            </LoadingButton>
          </form>
        </div>
      </div>
    );
  }

  const note = data as SharedNote | undefined;

  if (note) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 pb-4 border-b">
            <h1 className="text-3xl font-bold">{note.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date(note.updatedAt).toLocaleDateString()}
            </p>
          </header>
          <EditorRoot>
            <EditorContent
              immediatelyRender={false}
              editable={false}
              initialContent={parseContent(note.content as string)}
              extensions={defaultExtensions}
              editorProps={{
                attributes: {
                  class:
                    "prose dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
                },
              }}
            />
          </EditorRoot>
        </div>
      </div>
    );
  }

  return null;
}
