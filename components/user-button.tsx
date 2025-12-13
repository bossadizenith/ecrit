"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/contex/session";
import { authClient } from "@/lib/auth-client";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { UserProfile } from "./ui/user-profile";
import Link from "next/link";

export const UserButton = () => {
  const { user } = useSession();
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/auth";
          window.location.reload();
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-transparent rounded-full"
          size="icon"
        >
          <UserProfile url={user.image} name={user.name} size="lg" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="center">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="flex flex-col gap-1">
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="bg-red-100 text-red-500 hover:bg-red-200! hover:text-red-600! transition-all cursor-pointer"
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
