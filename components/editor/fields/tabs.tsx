"use client";

import { Badge } from "@notpadd/ui/components/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@notpadd/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notpadd/ui/components/popover";
import { cn } from "@notpadd/ui/lib/utils";

import { useOrganizationContext } from "@/contexts";
import useModal from "@/hooks/use-modal";
import { QUERY_KEYS } from "@/lib/constants";
import { TAGS_QUERIES } from "@/lib/queries";
import type { UpdateArticleSchema } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useController, useFormContext, type Control } from "react-hook-form";

type TagSelectorProps = {
  control: Control<UpdateArticleSchema>;
  defaultTags?: string[];
};

export const TagSelector = ({
  control,
  defaultTags = [],
}: TagSelectorProps) => {
  const { onOpen } = useModal();
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name: "tags",
    control,
    defaultValue: defaultTags,
  });

  const { activeOrganization } = useOrganizationContext();
  const { setValue } = useFormContext<UpdateArticleSchema>();

  const { data: tags } = useQuery({
    queryKey: [QUERY_KEYS.TAGS, activeOrganization?.id],
    queryFn: () =>
      TAGS_QUERIES.getTags(activeOrganization?.id || "", {
        page: 1,
        limit: 10,
        search: "",
      }),
    enabled: !!activeOrganization?.id,
  });

  const addTag = (tagId: string) => {
    if (value?.includes(tagId)) {
      return;
    }
    const newValue = [...(value || []), tagId];
    onChange(newValue);
  };

  const handleRemoveTag = (tagId: string) => {
    const newValue = (value || []).filter((t: string) => t !== tagId);
    onChange(newValue);
  };

  useEffect(() => {
    if (!tags || !Array.isArray(value) || value.length === 0) return;

    const mapped = value.map((v: string) => {
      const byId = tags.data.find((t) => t.id === v);
      if (byId) return v;
      const byName = tags.data.find((t) => t.name === v);
      if (byName) return byName.id;
      return v;
    });

    const cleaned = mapped.filter(
      (m): m is string => typeof m === "string" && m.trim() !== ""
    );

    const changed =
      cleaned.length !== value.length || cleaned.some((m, i) => m !== value[i]);
    if (!changed) return;

    setValue("tags", cleaned, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [tags, value, setValue]);

  const selected = useMemo(() => {
    if (tags && tags.data.length > 0 && value && value?.length > 0) {
      return tags.data.filter((opt) => value.includes(opt.id));
    }
    return [];
  }, [tags, value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative h-auto min-h-9 w-full cursor-pointer rounded-md border bg-muted/50 p-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <ul className="flex flex-wrap gap-1">
              {selected.length === 0 && (
                <li className="text-muted-foreground">Select some tags</li>
              )}
              {selected.map((item) => (
                <li key={item.id}>
                  <Badge
                    className="font-normal bg-background"
                    variant="outline"
                  >
                    {item.name}
                    <button
                      className="ml-1 h-auto p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(item.id);
                      }}
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      title={`Remove ${item.name}`}
                    >
                      <X className="size-2.5 p-0" />
                    </button>
                  </Badge>
                </li>
              ))}
            </ul>
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="min-w-[350.67px] p-0">
        <Command className="w-full">
          <CommandInput placeholder="Search tags..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <div className="flex items-center justify-between gap-1 bg-background px-2 pt-2 pb-1 font-normal text-xs">
              <span className="text-muted-foreground text-xs">Tags</span>
              <button
                className="flex items-center gap-1 p-1 hover:bg-accent"
                type="button"
                onClick={() => {
                  onOpen("create-tag");
                }}
              >
                <Plus className="size-4 text-muted-foreground" />
                <span className="sr-only">Add a new tag</span>
              </button>
            </div>
            {tags && tags.data.length > 0 && (
              <CommandGroup>
                {tags.data.map((option) => (
                  <CommandItem
                    key={option.id}
                    onSelect={() => addTag(option.id)}
                    className="cursor-pointer hover:bg-sidebar!"
                  >
                    {option.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selected.some((item) => item.id === option.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {tags && tags.data.length > 0 && <CommandSeparator />}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
