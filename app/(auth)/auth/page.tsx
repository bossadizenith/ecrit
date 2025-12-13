"use client";

import { LoadingButton } from "@/components/ui/loading-button";
import { authClient } from "@/lib/auth-client";
import { Icons } from "@/components/ui/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Container from "@/components/container";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: process.env.BETTER_AUTH_CALLBACK_URL || "/n",
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch {
      toast.error("Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/n");
    }
  }, [isPending, router, session]);

  return (
    <Container className="max-w-6xl flex items-center justify-center">
      <LoadingButton
        onClick={handleSignIn}
        loading={isLoading}
        className="px-10"
      >
        <Icons.google />
        Sign in with Google
      </LoadingButton>
    </Container>
  );
}
