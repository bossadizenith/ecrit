"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogMiniPadding,
  DialogTitle,
  DialogContentWrapper,
} from "@/components/ui/dialog";
import useModal from "@/hooks/use-modal";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, Monitor, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SettingItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  isActive?: boolean;
  variant?: "default" | "destructive";
};

export const Settings = () => {
  const { onClose, type } = useModal();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isSettingsOpen = type === "settings";
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await authClient.signOut();
    onClose();
    router.push("/");
  };

  const items: SettingItem[] = [
    {
      id: "light",
      label: "Light Theme",
      icon: <Sun className="size-4" />,
      action: () => setTheme("light"),
      isActive: theme === "light",
    },
    {
      id: "dark",
      label: "Dark Theme",
      icon: <Moon className="size-4" />,
      action: () => setTheme("dark"),
      isActive: theme === "dark",
    },
    {
      id: "system",
      label: "System Theme",
      icon: <Monitor className="size-4" />,
      action: () => setTheme("system"),
      isActive: theme === "system",
    },
    {
      id: "signout",
      label: "Sign Out",
      icon: <LogOut className="size-4" />,
      action: handleSignOut,
      variant: "destructive",
    },
  ];

  useEffect(() => {
    if (!isSettingsOpen) {
      setSelectedIndex(0);
    }
  }, [isSettingsOpen]);

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        items[selectedIndex]?.action();
        break;
    }
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <DialogMiniPadding>
          <DialogContentWrapper>
            <div className="space-y-4">
              <div className="space-y-1" ref={listRef}>
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm",
                      index === selectedIndex
                        ? item.variant === "destructive"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50",
                      item.variant === "destructive" &&
                        index !== selectedIndex &&
                        "text-destructive/80"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.isActive && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-xs font-medium text-muted-foreground mb-2">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>New Note</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">
                      Ctrl+Alt+N
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Search</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+K</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Settings</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">
                      Ctrl+Shift+P
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Save</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+S</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Voice</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">
                      Esc+Esc
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </DialogContentWrapper>
        </DialogMiniPadding>
      </DialogContent>
    </Dialog>
  );
};
