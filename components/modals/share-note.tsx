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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import useModal from "@/hooks/use-modal";
import { KEYS } from "@/lib/keys";
import { QUERIES } from "@/lib/query";
import { Notes } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Copy, Link, Lock, Globe, Eye, EyeOff } from "lucide-react";

export const ShareNote = () => {
  const { onClose, type, data } = useModal();
  const queryClient = useQueryClient();
  const isShareModalOpen = type === "share-note";
  const note = data as Notes | undefined;

  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (note) {
      setIsPublic(note.public || false);
      setPassword("");
      if (note.public) {
        setShareUrl(`${window.location.origin}/shared/${note.slug}`);
      } else {
        setShareUrl("");
      }
    }
  }, [note]);

  const { mutate: updateSharing, isPending } = useMutation({
    mutationFn: (data: { public: boolean; password?: string }) =>
      QUERIES.NOTES.share(note!.id, data),
    onSuccess: (response) => {
      toast.success(
        isPublic ? "Note is now shared" : "Note sharing disabled"
      );
      queryClient.invalidateQueries({ queryKey: [KEYS.NOTES] });
      queryClient.invalidateQueries({ queryKey: [KEYS.NOTES, note?.slug] });
      if (response.shareUrl) {
        setShareUrl(response.shareUrl);
      } else {
        setShareUrl("");
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message =
        axiosError.response?.data?.error || "Failed to update sharing settings";
      toast.error(message);
    },
  });

  const handleSave = () => {
    updateSharing({
      public: isPublic,
      password: password || undefined,
    });
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <Dialog open={isShareModalOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Share Note
          </DialogTitle>
        </DialogHeader>
        <DialogMiniPadding>
          <DialogContentWrapper>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="h-5 w-5 text-green-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      {isPublic ? "Public" : "Private"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isPublic
                        ? "Anyone with the link can view"
                        : "Only you can access this note"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isPublic ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPublic(!isPublic)}
                >
                  {isPublic ? "Disable" : "Enable"}
                </Button>
              </div>

              {isPublic && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password Protection (Optional)
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password to protect note"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave empty for no password protection
                    </p>
                  </div>

                  {shareUrl && (
                    <div className="space-y-2">
                      <Label>Share Link</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={shareUrl}
                          className="text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyToClipboard}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <LoadingButton
                  onClick={handleSave}
                  loading={isPending}
                  disabled={isPending}
                >
                  Save Changes
                </LoadingButton>
              </div>
            </div>
          </DialogContentWrapper>
        </DialogMiniPadding>
      </DialogContent>
    </Dialog>
  );
};
