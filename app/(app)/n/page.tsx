"use client";

import Container from "@/components/container";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Notes } from "@/components/notes";
import { Icons } from "@/components/ui/icons";
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
    <Container className="max-w-6xl">
      <div className="max-w-3xl flex-1 w-full gap-20 flex flex-col mx-auto">
        <Header />
        <div className="flex items-center flex-col w-full gap-6 flex-1">
          <div className="grid md:grid-cols-3 grid-cols-1 md:gap-6 gap-2 w-full">
            {Items.map((item) => (
              <button
                className="flex flex-col border p-4 gap-2 bg-muted/50 cursor-pointer active:scale-98 transition-all duration-150"
                key={item.title}
                data-shortcut={item.type}
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
      </div>
    </Container>
  );
};

export default page;
