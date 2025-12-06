"use client";

import { useArticleContext, useOrganizationContext } from "@/contexts";
import useUploader from "@/hooks/use-uploader";
import { updateCoverImageSchema } from "@/lib/schemas";
import type { UpdateCoverImageSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
  FormItem,
} from "@notpadd/ui/components/form";
import { Input } from "@notpadd/ui/components/input";
import { LoadingButton } from "@notpadd/ui/components/loading-button";
import { Progress } from "@notpadd/ui/components/progress";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@notpadd/ui/components/tabs";
import { cn } from "@notpadd/ui/lib/utils";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";
import { AUTHORS_QUERIES } from "@/lib/queries";
import { useMutation } from "@tanstack/react-query";

export const CoverImage = () => {
  const { routeConfig, startUpload, isUploading, uploadProgress } =
    useUploader("coverImageUploader");
  const router = useRouter();
  const { setArticle, articleId, article } = useArticleContext();
  const { activeOrganization } = useOrganizationContext();

  const form = useForm<UpdateCoverImageSchema>({
    resolver: zodResolver(updateCoverImageSchema) as any,
    defaultValues: {
      url: "",
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const promise = startUpload([file], {
          organizationId: activeOrganization?.id as string,
          articleId: articleId as string,
        });
        toast.promise(promise, {
          loading: "Uploading image...",
          success: "Image uploaded successfully.",
          error: "Error uploading image.",
        });
        promise
          .then((res) => {
            const first = res?.[0];
            const uploadedUrl = first?.ufsUrl as string | undefined;
            const uploadedBlurhash = first?.serverData?.imageBlurhash as
              | string
              | undefined;
            if (article && uploadedUrl && uploadedBlurhash) {
              setArticle({
                ...article,
                image: uploadedUrl,
                imageBlurhash: uploadedBlurhash,
              });
              router.refresh();
            }
          })
          .catch(() => {});
      }
    },
    [startUpload, article, articleId, activeOrganization?.id]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes
    ),
  });

  const { mutate: updateCoverImage, isPending } = useMutation({
    mutationFn: (data: { url: string }) =>
      AUTHORS_QUERIES.updateCoverImage(articleId as string, data),
    onSuccess: (data: any) => {
      if (article) {
        setArticle({
          ...article,
          image: data.image,
          imageBlurhash: data.imageBlurhash,
        });
      }
      toast.success("Article cover image updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: UpdateCoverImageSchema) => {
    console.log(data);
    updateCoverImage(data);
  };

  return (
    <Tabs defaultValue="upload">
      <TabsList
        activeClassName="bg-muted/50"
        className="grid w-full grid-cols-2 p-0 border-b bg-transparent"
      >
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="url">Url</TabsTrigger>
      </TabsList>
      <TabsContents className=" h-full bg-muted/50 border border-dashed p-1">
        <TabsContent value="upload" className="relative">
          <div
            {...getRootProps()}
            className={cn("outline-none text-center p-4", {
              "bg-primary/5": isDragActive,
            })}
          >
            <input {...getInputProps()} disabled={isUploading} />
            <div className="flex items-center justify-center h-40 w-full">
              {isDragActive ? (
                <p>Drop the image here...</p>
              ) : (
                <p>Drag and drop an image here or click to upload</p>
              )}
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted p-4">
              {uploadProgress && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <span>{uploadProgress}%</span>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent
          value="url"
          className="space-y-6 h-full flex items-center justify-center w-full p-4"
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-center gap-2 w-full"
            >
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        placeholder="Enter image URL"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton
                type="submit"
                loading={isPending}
                disabled={isPending || !form.formState.isValid}
                className="size-9"
              >
                <Check />
              </LoadingButton>
            </form>
          </Form>
        </TabsContent>
      </TabsContents>
    </Tabs>
  );
};
