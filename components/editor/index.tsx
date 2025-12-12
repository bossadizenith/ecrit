"use client";

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

import { AnimatePresence, motion } from "motion/react";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorContent,
  EditorInstance,
  EditorRoot,
  type JSONContent,
} from "novel";
import { handleCommandNavigation, ImageResizer } from "novel/extensions";
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
import { getLocalStorageKey } from "@/lib/localstorage";
import { QUERIES } from "@/lib/query";
import { noteContentSchema, NoteContentSchema } from "@/lib/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SoundWave from "./sound-wave";
import { KEYS } from "@/lib/keys";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const extensions = [...defaultExtensions, slashCommand];

const defaultValue: JSONContent = {
  type: "doc",
  content: [],
};

const textToEditorContent = (text: string): JSONContent => {
  if (!text) return defaultValue;

  const paragraphs = text.split("\n").filter((p) => p.trim() !== "");

  return {
    type: "doc",
    content: paragraphs.map((paragraph) => ({
      type: "paragraph",
      content: [{ type: "text", text: paragraph }],
    })),
  };
};

export const parseContent = (content: string): JSONContent => {
  if (!content) return defaultValue;

  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "doc") {
      return parsed;
    }
    return textToEditorContent(content);
  } catch {
    return textToEditorContent(content);
  }
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
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const lastEscPressRef = useRef<number>(0);
  const singleEscTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const uploadFn = useUploadFn();
  const queryClient = useQueryClient();
  const [wordCount, setWordCount] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const pendingExitRef = useRef(false);
  const router = useRouter();

  const form = useForm<NoteContentSchema>({
    resolver: zodResolver(noteContentSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
    },
  });

  const {
    register,
    formState: { isDirty },
  } = form;

  useEffect(() => {
    if (data) {
      form.reset({
        title: data.title,
        slug: data.slug,
        content: data.content,
      });
    }
  }, [data, form]);

  const { mutate: saveNote, isPending: isSaving } = useMutation({
    mutationFn: (formData: NoteContentSchema) =>
      QUERIES.NOTES.update(data?.id as string, formData),
    onSuccess: async () => {
      toast.success("Note saved successfully");
      form.reset(form.getValues());
      await queryClient.refetchQueries({ queryKey: [KEYS.NOTES], type: "all" });
      if (pendingExitRef.current) {
        pendingExitRef.current = false;
        setShowExitWarning(false);
        router.push("/n");
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message = axiosError.response?.data?.error || "Failed to save note";
      toast.error(message);
      pendingExitRef.current = false;
    },
  });

  const handleSave = useCallback(() => {
    if (!isDirty) return;
    if (!data?.id || isSaving) return;

    const formData = form.getValues();
    if (!formData.title || !formData.slug) {
      toast.error("Title is required");
      return;
    }

    if (editorRef.current) {
      const json = editorRef.current.getJSON();
      formData.content = JSON.stringify(json);
    }

    saveNote(formData);
  }, [data?.id, form, isSaving, saveNote, isDirty]);

  const handleSaveAndExit = useCallback(() => {
    pendingExitRef.current = true;
    handleSave();
  }, [handleSave]);

  const handleDiscardAndExit = useCallback(() => {
    setShowExitWarning(false);
    router.push("/n");
  }, [router]);

  const startVoiceRecording = useCallback(async () => {
    console.log("Starting voice recording...");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Your browser doesn't support microphone access");
      setIsRecording(false);
      return;
    }

    try {
      console.log("Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      toast.error(`Microphone error: ${(error as Error).message}`);
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser");
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(interimTranscript || finalTranscript);

      if (finalTranscript && editorRef.current) {
        editorRef.current.commands.insertContent(finalTranscript + " ");
        setTranscript("");
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        toast.error(
          "Microphone access denied. Please allow microphone access in your browser settings."
        );
        setIsRecording(false);
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        toast.error(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Recognition restart failed silently
        }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      toast.success("Voice recording started. Press Esc to stop.");
    } catch {
      toast.error("Failed to start voice recognition");
      setIsRecording(false);
    }
  }, []);

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setTranscript("");
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      if (e.key === "Escape") {
        const now = Date.now();
        const isDoubleEsc = now - lastEscPressRef.current < 300;
        lastEscPressRef.current = now;

        if (singleEscTimeoutRef.current) {
          clearTimeout(singleEscTimeoutRef.current);
          singleEscTimeoutRef.current = null;
        }

        if (showExitWarning) {
          setShowExitWarning(false);
          return;
        }

        if (isRecording) {
          stopVoiceRecording();
          setIsRecording(false);
          toast.info("Voice recording stopped.");
          return;
        }

        if (isDoubleEsc) {
          setIsRecording(true);
          await startVoiceRecording();
        } else {
          singleEscTimeoutRef.current = setTimeout(() => {
            if (isDirty) {
              setShowExitWarning(true);
            } else {
              router.push("/n");
            }
          }, 300);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleSave,
    isRecording,
    startVoiceRecording,
    stopVoiceRecording,
    isDirty,
    showExitWarning,
    router,
  ]);

  const updateFormFromEditor = (editor: EditorInstance) => {
    const markdown = editor.storage.markdown.getMarkdown();
    form.setValue("content", markdown, { shouldDirty: true });
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
      const characterCount = editor.storage.characterCount.words();
      setWordCount(characterCount);
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

    if (data?.content) {
      setInitialContent(parseContent(data.content));
      return;
    }

    setInitialContent(defaultValue);
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

  const status = isSaving ? "Saving..." : isDirty ? "Not saved" : "Saved";

  if (!initialContent) return null;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col bg-muted/50">
      <div
        className="relative w-full max-w-6xl mx-auto  min-h-screen md:p-10 p-4 flex gap-4 flex-col border bg-background"
        ref={editorContainerRef}
      >
        <EditorRoot>
          <TextareaAutosize
            id="title"
            autoFocus
            placeholder="Note Title"
            {...register("title")}
            className="scrollbar-hide mb-2 w-full resize-none bg-transparent font-semibold prose-headings:font-semibold text-4xl outline-none"
            onKeyDown={handleKeyDown}
          />

          <div
            className="flex-1 flex flex-col relative"
            onClick={() => editorRef.current?.commands.focus()}
          >
            <EditorContent
              key={data?.id}
              immediatelyRender={false}
              initialContent={initialContent ?? undefined}
              extensions={extensions}
              className="rounded-xl cursor-text! size-full flex-1"
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
                setWordCount(editor.storage.characterCount.words());
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
            <AnimatePresence initial={false}>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 border bg-background px-4 py-3 shadow-lg rounded-2xl flex flex-col items-center gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      Recording... Press Esc to stop
                    </span>
                  </div>
                  <SoundWave
                    bars={20}
                    height={30}
                    width={150}
                    color="var(--primary)"
                  />
                  {transcript && (
                    <p className="text-sm text-muted-foreground italic max-w-xs truncate">
                      {transcript}
                    </p>
                  )}
                </motion.div>
              )}
              {showExitWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed bottom-0 inset-x-0 z-50 bg-background border-t shadow-lg"
                >
                  <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Unsaved changes</span>
                      <span className="text-sm text-muted-foreground">
                        Save your note before leaving
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDiscardAndExit}
                      >
                        Discard
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveAndExit}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save & Exit"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div
              className={cn(
                "fixed bottom-0 inset-x-0 max-w-6xl mx-auto h-5 border-t flex items-center justify-between text-sm text-muted-foreground px-4 bg-background border-x"
              )}
            >
              <span>{wordCount} words</span>
              <div className="flex items-center gap-2">
                {isRecording && <span>Recording...</span>}
                <span
                  className={cn(
                    "transition-colors duration-150",
                    isDirty && "text-yellow-500"
                  )}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>
        </EditorRoot>
        <div
          className="transition-all duration-300 ease-in-out flex flex-col justify-end"
          ref={bottomPaddingRef}
        />
      </div>
    </div>
  );
}
