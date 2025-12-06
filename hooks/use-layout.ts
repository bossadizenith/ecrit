import { useEffect, useLayoutEffect } from "react";

export const useLayout =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
