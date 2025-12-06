"use client";

import useUploader from "@/hooks/use-uploader";
import { createImageUpload } from "novel/plugins";
import { toast } from "sonner";
import { useNote } from "@/contex/note";

export const useUploadFn = () => {
  const { data } = useNote();
  const { startUpload } = useUploader("mediaUploader");

  const onUpload = (file: File) => {
    const promise = startUpload([file], {
      noteId: data?.id as string,
    });

    return new Promise((resolve, reject) => {
      toast.promise(
        promise.then(async (data) => {
          if (data && data.length > 0) {
            const res = data[0]?.ufsUrl;
            const image = new Image();
            image.src = res as string;
            image.onload = () => {
              resolve(res);
            };
          }
        }),
        {
          loading: "Uploading image...",
          success: "Image uploaded successfully.",
          error: (e) => {
            reject(e);
            return e.message;
          },
        }
      );
    });
  };

  return createImageUpload({
    onUpload,
    validateFn: (file) => {
      if (!file.type.includes("image/")) {
        toast.error("File type not supported.");
        return false;
      }
      if (file.size / 1024 / 1024 > 4) {
        toast.error("File size too big (max 4MB).");
        return false;
      }
      return true;
    },
  });
};
