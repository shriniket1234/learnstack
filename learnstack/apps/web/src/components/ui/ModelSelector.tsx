import { Check, ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MODELS, type Model } from "@/utils/models";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function ModelSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const selected = MODELS.find((m) => m.value === value);

  const grouped = useMemo(() => {
    return MODELS.reduce<Record<string, Model[]>>((acc, model) => {
      acc[model.provider] ??= [];
      acc[model.provider].push(model);
      return acc;
    }, {});
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-7 px-2 text-xs bg-transparent hover:bg-muted"
        >
          ✦ {selected?.label}
          <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 max-w-md">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 opacity-50" />
            <CommandInput placeholder="Search models..." />
          </div>

          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>

            <ScrollArea className="max-h-[320px]">
              {Object.entries(grouped).map(([provider, models]) => (
                <CommandGroup key={provider} heading={provider}>
                  {models.map((model) => (
                    <CommandItem
                      key={model.value}
                      onSelect={() => {
                        onChange(model.value);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <span>{model.label}</span>
                      {model.value === value && <Check className="h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </ScrollArea>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
