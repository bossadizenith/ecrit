import { siteConfig } from "@/lib/site";
import { UserButton } from "./user-button";

export const Header = () => {
  return (
    <div className="flex items-center justify-between w-full sticky top-0 bg-background p-2 z-10">
      <h1 className="text-2xl font-bold font-mono">{siteConfig.name}</h1>
      <UserButton />
    </div>
  );
};
