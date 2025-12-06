"use client";

import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";

import useModal from "@/hooks/use-modal";
import useUploader, { type EndPoint } from "@/hooks/use-uploader";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useEditor } from "novel";
import { toast } from "sonner";

interface DropZoneProps {
  noteId: string;
  type: EndPoint;
}

const DropZone = ({ noteId, type }: DropZoneProps) => {
  const { routeConfig, startUpload, isUploading, uploadProgress, url } =
    useUploader(type);

  const { onClose, type: modalType, isOpen } = useModal();

  const { editor } = useEditor();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const promise = startUpload([file], {
          noteId,
        });
        toast.promise(promise, {
          loading: "Uploading image...",
          success: "Image uploaded successfully.",
          error: "Error uploading image.",
        });
      }
    },
    [startUpload, noteId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes
    ),
  });

  useEffect(() => {
    if (editor && url) {
      editor
        ?.chain()
        .focus()
        .setImage({ src: url as string })
        .createParagraphNear()
        .run();

      if (isOpen && modalType === "upload-image") {
        onClose();
      }
    }
  }, [editor, url]);

  return (
    <div
      {...getRootProps()}
      className={cn(
        "transition-all duration-200 border-2 border-dashed border-primary/5 aspect-video rounded-lg p-4 relative overflow-hidden group outline-none!",
        {
          "bg-primary/5 p-2": isDragActive,
        }
      )}
    >
      <input {...getInputProps()} className="outline-none!" />

      <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
        <div className="flex items-center justify-center size-10 bg-primary rounded-md text-primary-foreground">
          <Upload className="size-6" />
        </div>
        <span className="text-sm">
          Drag and drop to replace or copy & paste image
        </span>
      </div>

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 aspect-video bg-sidebar flex-col gap-2 px-4">
          <div className="flex flex-col items-center gap-2 w-full">
            <span>{uploadProgress}%</span>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;
