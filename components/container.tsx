import { cn } from "@/lib/utils";
import React from "react";

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 font-sans">
      <main
        className={cn(
          "flex min-h-screen w-full max-w-3xl flex-col justify-between p-16 bg-background border-x gap-8",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default Container;
