"use client";

import { useState } from "react";

import type { TextareaAutosizeProps } from "react-textarea-autosize";
import ReactTextareaAutosize from "react-textarea-autosize";

import { useLayout } from "@/hooks/use-layout";

export function TextareaAutosize({ ...props }: TextareaAutosizeProps) {
  const [isRerendered, setIsRerendered] = useState(false);

  useLayout(() => setIsRerendered(true), []);

  return isRerendered ? <ReactTextareaAutosize {...props} /> : null;
}

TextareaAutosize.displayName = "TextareaAutosize";
