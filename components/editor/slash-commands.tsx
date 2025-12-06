import useModal from "@/hooks/use-modal";
import { EditorCommandItem, EditorCommandList } from "novel";
import { suggestionItems } from "./slash-command";

const SlashCommands = () => {
  const { onOpen } = useModal();
  return (
    <>
      <EditorCommandList>
        {suggestionItems.map((item) => (
          <EditorCommandItem
            value={item.title}
            onCommand={(val) => {
              if (item.title === "Image") {
                if (val.editor && val.range) {
                  val.editor.chain().focus().deleteRange(val.range).run();
                }
                onOpen("upload-image");
              } else if (item.title === "YouTube") {
                if (val.editor && val.range) {
                  val.editor.chain().focus().deleteRange(val.range).run();
                }
                onOpen("upload-youtube");
              } else {
                item.command?.(val);
              }
            }}
            className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
            key={item.title}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
              {item.icon}
            </div>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          </EditorCommandItem>
        ))}
      </EditorCommandList>
    </>
  );
};

export default SlashCommands;
