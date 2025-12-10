"use client";

import Container from "@/components/container";
import { Footer } from "@/components/footer";
import { Notes } from "@/components/notes";
import { Icons } from "@/components/ui/icons";
import { UserButton } from "@/components/user-button";
import useModal from "@/hooks/use-modal";
import { useDesktopOS } from "@/hooks/use-os";
import { ModalTypes } from "@/lib/types";
import { Cog, Search } from "lucide-react";

const Items = [
  {
    title: "Notes",
    icon: Icons.file,
    cmd: "Alt + N",
    type: "create-note",
  },
  {
    title: "Search",
    icon: Search,
    cmd: "K",
    type: "search",
  },
  {
    title: "Settings",
    icon: Cog,
    cmd: "Shift + P",
    type: "settings",
  },
];

const page = () => {
  const os = useDesktopOS();
  const { onOpen } = useModal();
  return (
    <Container className="gap-20">
      <div className="flex items-center justify-between w-full sticky top-0 bg-background p-2">
        <h1 className="text-2xl font-bold font-mono">ecrit.</h1>
        <UserButton />
      </div>
      <div className="flex items-center flex-col w-full gap-6 flex-1">
        <div className="grid md:grid-cols-3 grid-cols-1 md:gap-6 gap-2 w-full">
          {Items.map((item) => (
            <button
              className="flex flex-col border p-4 gap-2 bg-muted/50 active:scale-98 transition-all"
              key={item.title}
              onClick={() => onOpen(item.type as ModalTypes)}
            >
              <div className="flex items-center justify-between">
                <item.icon className="size-4 " />
                <span className="text-xs text-muted-foreground">
                  {os} + {item.cmd}
                </span>
              </div>
              <p className="text-sm w-fit font-mono">{item.title}</p>
            </button>
          ))}
        </div>
        <Notes />
      </div>
      <Footer />
    </Container>
  );
};

export default page;
