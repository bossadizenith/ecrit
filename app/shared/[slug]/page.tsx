"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QUERIES } from "@/lib/query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Lock, FileText } from "lucide-react";
import { toast } from "sonner";

type SharedNote = {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type SharedNoteResponse = SharedNote | { requiresPassword: boolean; title: string };

export default function SharedNotePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [note, setNote] = useState<SharedNote | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response: SharedNoteResponse = await QUERIES.SHARED.get(slug);
        if ("requiresPassword" in response && response.requiresPassword) {
          setRequiresPassword(true);
          setNoteTitle(response.title);
        } else {
          setNote(response as SharedNote);
        }
      } catch (err: unknown) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          setError("Note not found or not shared");
        } else {
          setError("Failed to load note");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [slug]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await QUERIES.SHARED.access(slug, password);
      setNote(response);
      setRequiresPassword(false);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || "Invalid password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-semibold">{error}</h1>
          <p className="text-muted-foreground">
            This note may have been deleted or is no longer shared.
          </p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-semibold">{noteTitle}</h1>
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
              loading={submitting}
              disabled={!password || submitting}
            >
              Access Note
            </LoadingButton>
          </form>
        </div>
      </div>
    );
  }

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
          <article
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
      </div>
    );
  }

  return null;
}
