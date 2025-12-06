import {
  AIHighlight,
  CharacterCount,
  CodeBlockLowlight,
  Color,
  CustomKeymap,
  GlobalDragHandle,
  HighlightExtension,
  HorizontalRule,
  MarkdownExtension,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TextStyle,
  TiptapImage,
  TiptapLink,
  TiptapUnderline,
  Twitter,
  UpdatedImage,
  Youtube,
  Mathematics,
} from "novel/extensions";
import { UploadImagesPlugin } from "novel/plugins";

import { cn } from "@/lib/utils";
import { common, createLowlight } from "lowlight";

const aiHighlight = AIHighlight;
const placeholder = Placeholder.configure({
  placeholder: "Write something...",
});
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cn(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer"
    ),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cn("opacity-40 rounded-lg border border-stone-200"),
      }),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cn("rounded-lg border border-muted"),
  },
});

const updatedImage = UpdatedImage.configure({
  HTMLAttributes: {
    class: cn("rounded-lg border border-muted"),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cn("not-prose pl-2 "),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cn("flex gap-2 items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cn("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cn("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cn("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cn("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cn("border-l-4 border-primary"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cn(
        "rounded-md bg-muted text-muted-foreground border p-5 font-mono font-medium"
      ),
    },
  },
  code: {
    HTMLAttributes: {
      class: cn("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

const codeBlockLowlight = CodeBlockLowlight.configure({
  lowlight: createLowlight(common),
});

const youtube = Youtube.configure({
  HTMLAttributes: {
    class: cn("rounded-lg border border-muted"),
  },
  inline: false,
});

const twitter = Twitter.configure({
  HTMLAttributes: {
    class: cn("not-prose"),
  },
  inline: false,
});

const mathematics = Mathematics.configure({
  HTMLAttributes: {
    class: cn("text-foreground rounded p-1 hover:bg-accent cursor-pointer"),
  },
  katexOptions: {
    throwOnError: false,
  },
});

const characterCount = CharacterCount.configure();

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  updatedImage,
  taskList,
  taskItem,
  horizontalRule,
  aiHighlight,
  codeBlockLowlight,
  youtube,
  twitter,
  mathematics,
  characterCount,
  TiptapUnderline,
  MarkdownExtension,
  HighlightExtension,
  TextStyle,
  Color,
  CustomKeymap,
  GlobalDragHandle,
];
