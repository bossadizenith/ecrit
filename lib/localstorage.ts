import { KEYS } from "@/lib/keys";
import hljs from "highlight.js";

export const highlightCodeblocks = (content: string) => {
  const doc = new DOMParser().parseFromString(content, "text/html");
  doc.querySelectorAll<HTMLElement>("pre code").forEach((el) => {
    hljs.highlightElement(el);
  });
  return new XMLSerializer().serializeToString(doc);
};

export const getLocalStorageKey = (suffix: string, noteId: string) => {
  return `${KEYS.NOTES}${noteId}${suffix}`;
};

export const removeFromStorage = (noteId: string) => {
  window.localStorage.removeItem(getLocalStorageKey("", noteId));
  window.localStorage.removeItem(getLocalStorageKey("-markdown", noteId));
  window.localStorage.removeItem(getLocalStorageKey("-html-content", noteId));
};

export const getStoredContent = (
  suffix: string,
  shouldHighlight = false,
  noteId: string
) => {
  const content =
    localStorage.getItem(getLocalStorageKey(suffix, noteId as string)) ?? "";
  return shouldHighlight ? highlightCodeblocks(content) : content;
};
