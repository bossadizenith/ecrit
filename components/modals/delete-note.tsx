"use client";

import {
  Dialog,
  DialogContent,
  DialogContentWrapper,
  DialogHeader,
  DialogMiniPadding,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import useModal from "@/hooks/use-modal";
import { KEYS } from "@/lib/keys";
import { QUERIES } from "@/lib/query";
import { Notes, PaginatedNotes } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export const DeleteNote = () => {
  const { onClose, type, data } = useModal();
  const queryClient = useQueryClient();
  const router = useRouter();
  const isDeleteModalOpen = type === "delete-note";
  const note = data as Notes | undefined;

  const { mutate: deleteNote, isPending } = useMutation({
    mutationFn: (id: string) => QUERIES.NOTES.delete(id),
    onSuccess: () => {
      toast.success("Note deleted successfully");
      queryClient.setQueryData(
        [KEYS.NOTES],
        (old: PaginatedNotes | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((n) => n.id !== note?.id),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
            },
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: [KEYS.NOTES] });
      router.push("/n");
      onClose();
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message =
        axiosError.response?.data?.error || "Failed to delete note";
      toast.error(message);
    },
  });

  const handleDelete = () => {
    if (note?.id) {
      deleteNote(note.id);
    }
  };

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Note
          </DialogTitle>
        </DialogHeader>
        <DialogMiniPadding>
          <DialogContentWrapper>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  &quot;{note?.title}&quot;
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <LoadingButton
                  variant="destructive"
                  onClick={handleDelete}
                  loading={isPending}
                  disabled={isPending}
                >
                  Delete
                </LoadingButton>
              </div>
            </div>
          </DialogContentWrapper>
        </DialogMiniPadding>
      </DialogContent>
    </Dialog>
  );
};
