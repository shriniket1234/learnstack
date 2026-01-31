import { ArrowUp, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { useEffect, useRef } from "react";

interface Props {
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  model: string;
  setModel: (v: string) => void;
  onSend: () => void;
}

export function ChatInput({
  input,
  setInput,
  loading,
  model,
  setModel,
  onSend,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
  }, [input]);

  return (
    <div className="relative rounded-lg border border-border bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-primary/40">
      <Textarea
        ref={ref}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Send a message…"
        rows={1}
        disabled={loading}
        className="resize-none border-0 bg-transparent px-4 pt-4 pb-14 text-sm focus-visible:ring-0"
      />

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4 opacity-50" />
          </Button>

          <ModelSelector value={model} onChange={setModel} />
        </div>

        <Button
          size="icon"
          disabled={!input.trim() || loading}
          onClick={onSend}
          className="rounded-full"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
