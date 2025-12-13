import {
  Dialog,
  DialogContent,
  DialogContentWrapper,
  DialogHeader,
  DialogMiniPadding,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import useModal from "@/hooks/use-modal";
import { KEYS } from "@/lib/keys";
import { QUERIES } from "@/lib/query";
import { Notes, PaginatedNotes } from "@/lib/types";
import { NoteSchema, noteSchema } from "@/lib/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const CreateNote = () => {
  const { onClose, type } = useModal();
  const queryClient = useQueryClient();
  const router = useRouter();
  const isCreateModalOpen = type === "create-note";

  const form = useForm<NoteSchema>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      slug: "",
    },
  });

  const { data: notesResponse } = useQuery<PaginatedNotes>({
    queryKey: [KEYS.NOTES],
    queryFn: () => QUERIES.NOTES.all(),
    enabled: isCreateModalOpen,
  });

  const slug = form.watch("slug");

  const slugExists = useMemo(() => {
    if (!notesResponse?.data || !slug) return false;
    return notesResponse.data.some((note) => note.slug === slug);
  }, [notesResponse, slug]);

  useEffect(() => {
    if (slugExists) {
      form.setError("title", {
        type: "manual",
        message: `A note with slug "${slug}" already exists`,
      });
    } else {
      form.clearErrors("title");
    }
  }, [slugExists, slug, form]);

  const { mutate: createNote, isPending } = useMutation({
    mutationFn: (data: NoteSchema) => QUERIES.NOTES.create(data),
    onSuccess: (data: Notes) => {
      toast.success("Note created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: [KEYS.NOTES] });
      router.push(`/n/${data.slug}`);
      onClose();
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message =
        axiosError.response?.data?.error || "Failed to create note";
      toast.error(message);
    },
  });
  useEffect(() => {
    const title = form.watch("title");

    const newSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    form.setValue("slug", newSlug);
  }, [form.watch("title"), form]);

  const onSubmit = (data: NoteSchema) => {
    createNote(data);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
        </DialogHeader>
        <DialogMiniPadding>
          <DialogContentWrapper>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                onKeyDown={handleKeyDown}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <LoadingButton
                    type="submit"
                    loading={isPending}
                    disabled={
                      isPending || !form.formState.isValid || slugExists
                    }
                  >
                    Create Note
                  </LoadingButton>
                </div>
              </form>
            </Form>
          </DialogContentWrapper>
        </DialogMiniPadding>
      </DialogContent>
    </Dialog>
  );
};
