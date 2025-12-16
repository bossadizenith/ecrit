import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";

const iconvVariants = cva("border flex items-center justify-center", {
  variants: {
    size: {
      default: "size-10 min-w-10",
      sm: "size-8 min-w-8",
      lg: "size-12 min-w-12",
      xs: "size-6 min-w-6",
      xl: "size-20 min-w-20",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface ProfileProps extends VariantProps<typeof iconvVariants> {
  className?: string;
  url?: string | null;
  name?: string | null;
  fallbackClassName?: string;
}

const UserProfile = ({
  className,
  url,
  name = "User",
  size,
  fallbackClassName,
}: ProfileProps) => {
  const twoLettersName = name
    ? name
        .split(/[-\s]/)
        .filter(Boolean)
        .map((l) => l[0])
        .join("")
        .slice(0, 2)
    : "U";

  return (
    <Avatar className={cn(iconvVariants({ size, className }))}>
      <AvatarImage src={url as string} />
      <AvatarFallback
        className={cn("text-sm font-semibold uppercase", fallbackClassName)}
      >
        {twoLettersName}
      </AvatarFallback>
    </Avatar>
  );
};

export { UserProfile, iconvVariants };
