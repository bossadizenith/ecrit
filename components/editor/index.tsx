"use client";

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorContent,
  EditorInstance,
  EditorRoot,
  type JSONContent,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { handleImageDrop, handleImagePaste } from "novel/plugins";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { defaultExtensions } from "@/components/editor/extensions";
import { useUploadFn } from "@/components/editor/image-upload";
import { ColorSelector } from "@/components/editor/selector/color";
import { LinkSelector } from "@/components/editor/selector/link";
import { NodeSelector } from "@/components/editor/selector/node";
import { TextButtons } from "@/components/editor/selector/text-button";
import { slashCommand } from "@/components/editor/slash-command";

import UploadImage from "@/components/modals/upload-image";
import { TextareaAutosize } from "@/components/resizable-text-area";
import { Separator } from "@/components/ui/separator";

import EditorMenu from "./menu";
import SlashCommands from "./slash-commands";

import { useNote } from "@/contex/note";
import { getLocalStorageKey, highlightCodeblocks } from "@/lib/localstorage";
import { noteContentSchema, NoteContentSchema } from "@/lib/zod-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const extensions = [...defaultExtensions, slashCommand];

const defaultValue = {
  type: "doc",
};

export default function Editor() {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(
    null
  );
  const { data, isLoading } = useNote();
  const editorRef = useRef<EditorInstance | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomPaddingRef = useRef<HTMLDivElement | null>(null);
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const uploadFn = useUploadFn();

  const form = useForm<NoteContentSchema>({
    resolver: zodResolver(noteContentSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        title: data.title,
        slug: data.slug,
        content: data.content,
      });
    }
  }, [data, form]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const updateFormFromEditor = (editor: EditorInstance) => {
    const markdown = editor.storage.markdown.getMarkdown();
    form.setValue("content", markdown);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editorRef.current?.commands.focus();
    }
  };

  const handleAutoScroll = (editor: EditorInstance) => {
    if (!editorContainerRef.current) return;
    if (!editor.view.hasFocus()) return;
    if (!bottomPaddingRef.current) return;

    const {
      state: {
        selection: {
          $anchor: { pos },
        },
      },
    } = editor.view;
    try {
      const coords = editor.view.coordsAtPos(pos);
      if (!coords) return;

      const viewportHeight = window.innerHeight;
      const cursorBottom = coords.bottom;

      const distanceFromBottom = viewportHeight - cursorBottom;
      const threshold = 300;

      if (distanceFromBottom < threshold) {
        const scrollAmount = threshold - distanceFromBottom + 50;
        bottomPaddingRef.current.style.height = `${scrollAmount}px`;

        requestAnimationFrame(() => {
          bottomPaddingRef.current?.scrollIntoView({ behavior: "smooth" });
        });
      }
    } catch (error) {
      console.debug("Auto-scroll calculation failed:", error);
    }
  };

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const markdown = editor.storage.markdown.getMarkdown();
      window.localStorage.setItem(
        getLocalStorageKey("-markdown", data?.id as string),
        markdown
      );

      updateFormFromEditor(editor);
    },
    500
  );

  useEffect(() => {
    if (isLoading) return;

    if (data?.content && data.content) {
      setInitialContent(JSON.parse(data.content));
      return;
    }

    setInitialContent(defaultValue);
  }, [isLoading, data?.content]);

  useEffect(() => {
    if (isLoading) return;
    if (JSON.stringify(data?.content) === JSON.stringify(data?.content)) {
      return;
    }
  }, [isLoading, data?.content]);

  useEffect(() => {
    const title = form.watch("title");
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");
    form.setValue("slug", slug);
  }, [form.watch("title")]);

  if (!initialContent) return null;

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div
        className="relative w-full max-w-6xl mx-auto min-h-screen py-10 flex flex-col"
        ref={editorContainerRef}
      >
        <EditorRoot>
          <TextareaAutosize
            id="title"
            autoFocus
            placeholder="Note Title"
            {...register("title")}
            className="scrollbar-hide mb-2 w-full resize-none bg-transparent font-semibold prose-headings:font-semibold text-4xl focus:outline-hidden focus:ring-0 sm:px-4"
            onKeyDown={handleKeyDown}
          />
          <div
            className="flex-1 flex flex-col"
            onClick={() => editorRef.current?.commands.focus()}
          >
            <EditorContent
              immediatelyRender={false}
              initialContent={initialContent ?? undefined}
              extensions={extensions}
              className="rounded-xl cursor-text! p-4 size-full flex-1"
              editorProps={{
                handleDOMEvents: {
                  keydown: (_view, event) => handleCommandNavigation(event),
                },
                handlePaste: (view, event) =>
                  handleImagePaste(view, event, uploadFn),
                handleDrop: (view, event, _slice, moved) =>
                  handleImageDrop(view, event, moved, uploadFn),
                attributes: {
                  class:
                    "prose dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
                },
              }}
              onCreate={({ editor }) => {
                editorRef.current = editor;
              }}
              onUpdate={({ editor }) => {
                editorRef.current = editor;
                debouncedUpdates(editor);
                handleAutoScroll(editor);
              }}
              slotAfter={<ImageResizer />}
            >
              <EditorCommand className="z-50 h-full max-h-[330px] overflow-y-auto no-scrollbar rounded-md border border-muted bg-background px-1 py-2 shadow transition-all">
                <EditorCommandEmpty className="px-2 text-muted-foreground">
                  No results
                </EditorCommandEmpty>
                <SlashCommands />
              </EditorCommand>

              <UploadImage noteId={data?.id as string} />

              <EditorMenu open={openAI} onOpenChange={setOpenAI}>
                <Separator orientation="vertical" />
                <NodeSelector open={openNode} onOpenChange={setOpenNode} />

                <Separator orientation="vertical" />
                <LinkSelector open={openLink} onOpenChange={setOpenLink} />

                <Separator orientation="vertical" />

                <Separator orientation="vertical" />
                <TextButtons />

                <Separator orientation="vertical" />
                <ColorSelector open={openColor} onOpenChange={setOpenColor} />
              </EditorMenu>
            </EditorContent>
          </div>
        </EditorRoot>
        <div
          className="transition-all duration-300 ease-in-out flex flex-col justify-end"
          ref={bottomPaddingRef}
        />
      </div>
    </>
  );
}
