"use client";

import Container from "@/components/container";
import { Footer } from "@/components/footer";
import { UserButton } from "@/components/user-button";
import { Notes } from "@/components/notes";
import { Icons } from "@/components/ui/icons";
import { Cog, Search } from "lucide-react";
import { useDesktopOS } from "@/hooks/use-os";

const Items = [
  {
    title: "Notes",
    icon: Icons.file,
    cmd: "Alt + N",
  },
  {
    title: "Search",
    icon: Search,
    cmd: "P",
  },
  {
    title: "Settings",
    icon: Cog,
    cmd: "Shift + P",
  },
];

const page = () => {
  const os = useDesktopOS();
  return (
    <Container>
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold font-mono">ecrit.</h1>
        <UserButton />
      </div>
      <div className="flex items-center flex-col justify-between w-full gap-6">
        <div className="grid grid-cols-3 gap-6 w-full">
          {Items.map((item) => (
            <div
              className="flex flex-col border p-4 gap-2 bg-muted/50"
              key={item.title}
            >
              <div className="flex items-center justify-between">
                <item.icon className="size-4 " />
                <span className="text-xs text-muted-foreground">
                  {os} + {item.cmd}
                </span>
              </div>
              <p className="text-sm font-mono">{item.title}</p>
            </div>
          ))}
        </div>
        <Notes />
      </div>
      <Footer />
    </Container>
  );
};

export default page;
