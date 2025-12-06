import { useEffect, useState } from "react";

export function useDesktopOS() {
  const [os, setOS] = useState<"Ctrl" | "Cmd" | "unknown">("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const platform = navigator.userAgent.toLowerCase();

    if (platform.includes("mac")) {
      setOS("Cmd");
    } else if (platform.includes("win")) {
      setOS("Ctrl");
    } else if (platform.includes("linux")) {
      setOS("Ctrl");
    } else {
      setOS("unknown");
    }
  }, []);

  return os;
}
