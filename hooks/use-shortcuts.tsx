"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import useModal from "./use-modal";
import { authClient } from "@/lib/auth-client";
import type { ModalTypes } from "@/lib/types";

type Shortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  modal: ModalTypes;
  requiresAuth: boolean;
};

const SHORTCUTS: Shortcut[] = [
  {
    key: "n",
    ctrl: true,
    alt: true,
    modal: "create-note",
    requiresAuth: true,
  },
  {
    key: "k",
    ctrl: true,
    modal: "search",
    requiresAuth: true,
  },
  {
    key: "p",
    ctrl: true,
    shift: true,
    modal: "settings",
    requiresAuth: true,
  },
];

const matchShortcut = (e: KeyboardEvent, shortcut: Shortcut): boolean => {
  const ctrlMatch = shortcut.ctrl
    ? e.ctrlKey || e.metaKey
    : !e.ctrlKey && !e.metaKey;
  const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
  const altMatch = shortcut.alt ? e.altKey : !e.altKey;
  const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

  return ctrlMatch && shiftMatch && altMatch && keyMatch;
};

export const useShortcuts = () => {
  const onOpen = useModal((state) => state.onOpen);
  const { data: session } = authClient.useSession();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

      if (isTyping && !hasModifier) return;

      for (const shortcut of SHORTCUTS) {
        if (matchShortcut(e, shortcut)) {
          e.preventDefault();
          e.stopPropagation();

          if (shortcut.requiresAuth && !session?.user) {
            toast.error("Please login to perform this action");
            return;
          }

          onOpen(shortcut.modal);
          return;
        }
      }
    },
    [session, onOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [handleKeyDown]);
};
