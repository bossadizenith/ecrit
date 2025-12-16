"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useSession } from "@/contex/session";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  displayNameSchema,
  DisplayNameSchema,
  url,
  UsernameUrl,
  visible,
  Visible,
} from "@/lib/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { LoadingButton } from "./ui/loading-button";
import { UserProfile } from "./ui/user-profile";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export const SettingsClient = () => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <AvatarSettings />
        <DisplayName />
        <Url />
        <Visibility />
      </div>
      <div className="bg-border h-px" />
      <AutoSave />
    </>
  );
};

const AvatarSettings = () => {
  const { user } = useSession();
  return (
    <div className="border ">
      <div className="flex flex-col gap-4 p-4 relative">
        <SettingsHeader title="Avatar" />
        <p className="flex flex-col gap-1 text-sm ">
          <span>This is your avatar.</span>
          <span>
            Click on the avatar to upload a custom one from your files.
          </span>
        </p>
        <div className="absolute size-fit my-auto top-0 bottom-0 right-4">
          <UserProfile url={user.image} name={user.name} size="xl" />
        </div>
      </div>
      <div className="p-4 border-t bg-muted/50 text-sm">
        <p className="text-muted-foreground">
          An avatar is optional but strongly recommended if your profile is
          public.
        </p>
      </div>
    </div>
  );
};

const DisplayName = () => {
  const { user } = useSession();
  const form = useForm<DisplayNameSchema>({
    resolver: zodResolver(displayNameSchema),
    defaultValues: {
      displayName: user.name,
    },
  });

  const onSubmit = (data: DisplayNameSchema) => {
    console.log(data);
  };

  return (
    <div className="border ">
      <div className="flex flex-col gap-4 p-4 relative">
        <SettingsHeader title="Display Name" />
        <div className="flex flex-col gap-3 text-sm">
          <span>This is your visible name within {siteConfig.name}</span>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="displayname-form"
            >
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormControl>
                      <Input placeholder="Display Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
      <div className="p-4 border-t bg-muted/50 text-sm flex items-center justify-between">
        <p className="text-muted-foreground">
          Please use 32 characters at maximum.
        </p>
        <LoadingButton
          disabled={!form.formState.isDirty}
          form="displayname-form"
          type="submit"
        >
          Save
        </LoadingButton>
      </div>
    </div>
  );
};

const Url = () => {
  const { user } = useSession();
  const form = useForm<UsernameUrl>({
    resolver: zodResolver(url),
    defaultValues: {
      url: user.name.split(" ").join(""),
    },
  });

  const onSubmit = (data: UsernameUrl) => {
    console.log(data);
  };

  const siteUrl = siteConfig.url.split("//")[1];

  return (
    <div className="border ">
      <div className="flex flex-col gap-4 p-4 relative">
        <SettingsHeader title="Url" />
        <div className="flex flex-col gap-3 text-sm">
          <span>This is your visible name within {siteConfig.name}</span>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="url-form"
            >
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <div className="max-w-sm flex items-center h-fit gap-0">
                      <div className="h-9 border flex items-center justify-center px-2 border-r-0 opacity-50 select-none">
                        {siteUrl}
                      </div>
                      <FormControl>
                        <Input placeholder="Url" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
      <div className="p-4 border-t bg-muted/50 text-sm flex items-center justify-between">
        <p className="text-muted-foreground">
          Please use 32 characters at maximum.
        </p>
        <LoadingButton
          disabled={!form.formState.isDirty}
          form="url-form"
          type="submit"
        >
          Save
        </LoadingButton>
      </div>
    </div>
  );
};

const Visibility = () => {
  const form = useForm<Visible>({
    resolver: zodResolver(visible),
    defaultValues: {
      visible: false,
    },
  });

  const onSubmit = (data: Visible) => {
    console.log(data);
  };

  return (
    <div className="border ">
      <div className="flex flex-col gap-4 p-4 relative">
        <SettingsHeader title="Visibility" />
        <div className="flex items-center gap-3 text-sm justify-between">
          <Label htmlFor="visibility" className="flex-1 font-normal">
            Enable if other user get to view your profile on {siteConfig.name}
          </Label>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="url-form"
            >
              <FormField
                control={form.control}
                name="visible"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="visibility"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
      <div className="p-4 border-t bg-muted/50 text-sm flex items-center justify-between">
        <p className="text-muted-foreground">
          by default your profile is not public.
        </p>
        <LoadingButton
          disabled={!form.formState.isDirty}
          form="url-form"
          type="submit"
        >
          Save
        </LoadingButton>
      </div>
    </div>
  );
};

const AutoSave = () => {
  // const { user } = useSession();
  const form = useForm<Visible>({
    resolver: zodResolver(visible),
    defaultValues: {
      visible: false,
    },
  });

  const onSubmit = (data: Visible) => {
    console.log(data);
  };

  return (
    <div className="border ">
      <div className="flex flex-col gap-4 p-4 relative">
        <SettingsHeader title="Auto save notes" />
        <div className="flex items-center gap-3 text-sm justify-between">
          <Label htmlFor="visibility" className="flex-1 font-normal">
            Enabled your notes to be auto saved by {siteConfig.name}
          </Label>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              id="url-form"
            >
              <FormField
                control={form.control}
                name="visible"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="visibility"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
      <div className="p-4 border-t bg-muted/50 text-sm flex items-center justify-between">
        <p className="text-muted-foreground">
          If not enabled, you'll have to manually save your notes
        </p>
        <LoadingButton
          disabled={!form.formState.isDirty}
          form="url-form"
          type="submit"
        >
          Save
        </LoadingButton>
      </div>
    </div>
  );
};

const SettingsHeader = ({
  className,
  title,
}: {
  className?: string;
  title: string;
}) => {
  return (
    <h1 className={cn("font-mono font-semibold text-xl", className)}>
      {title}
    </h1>
  );
};
