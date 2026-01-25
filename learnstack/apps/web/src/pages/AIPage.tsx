import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/components/ui/message";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/* ---------------- Models ---------------- */

interface Model {
  value: string;
  label: string;
  provider: string;
}

interface Model {
  value: string;
  label: string;
  provider: string;
}

const MODELS: Model[] = [
  // ───────── Free models ─────────
  { value: "lfm-thinking", label: "lfm-thinking", provider: "Liquid" },
  { value: "lfm-instruct", label: "lfm-instruct", provider: "Liquid" },
  { value: "molmo", label: "molmo", provider: "AllenAI" },
  { value: "mimo-flash", label: "mimo-flash", provider: "Xiaomi" },
  { value: "nemotron-nano", label: "nemotron-nano", provider: "NVIDIA" },
  { value: "devstral", label: "devstral", provider: "Mistral" },
  { value: "nemotron-vl", label: "nemotron-vl", provider: "NVIDIA" },
  {
    value: "qwen-next-instruct",
    label: "qwen-next-instruct",
    provider: "Qwen",
  },
  {
    value: "deepseek-chimera",
    label: "deepseek-chimera",
    provider: "DeepSeek",
  },
  { value: "gemma-3n", label: "gemma-3n", provider: "Google" },
  { value: "llama-3.1-405b", label: "llama-3.1-405b", provider: "Meta" },
  { value: "mistral-small", label: "mistral-small", provider: "Mistral" },
  { value: "gemma-3-4b", label: "gemma-3-4b", provider: "Google" },
  { value: "gemma-3-12b", label: "gemma-3-12b", provider: "Google" },
  { value: "gemma-3-27b", label: "gemma-3-27b", provider: "Google" },
  { value: "gpt-oss-120b", label: "gpt-oss-120b", provider: "OpenAI" },
  { value: "gpt-oss-20b", label: "gpt-oss-20b", provider: "OpenAI" },
  { value: "glm-air", label: "glm-air", provider: "Z-AI" },
  { value: "kimi-k2", label: "kimi-k2", provider: "Moonshot" },
  { value: "hermes-405b", label: "hermes-405b", provider: "Nous" },
  { value: "llama-3.3-70b", label: "llama-3.3-70b", provider: "Meta" },
];

const modelLabelMap = Object.fromEntries(MODELS.map((m) => [m.value, m.label]));

/* ---------------- Types ---------------- */

interface AIMessage {
  id: number;
  prompt: string;
  response: string;
  timestamp: Date;
  model: string;
}

/* ========================================================= */
/* Chat Input (MOVED OUT — FIXES FOCUS LOSS)                  */
/* ========================================================= */

interface ChatInputProps {
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  selectedModel: string;
  setSelectedModel: (v: string) => void;
  onSend: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

function ChatInput({
  input,
  setInput,
  loading,
  selectedModel,
  setSelectedModel,
  onSend,
  textareaRef,
}: ChatInputProps) {
  return (
    <div className="relative rounded-2xl border bg-background shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder={`Ask ${modelLabelMap[selectedModel]}…`}
        disabled={loading}
        rows={1}
        className="
          w-full
          resize-none
          border-0
          bg-transparent
          px-5
          pt-4
          pb-14
          text-base
          leading-relaxed
          focus-visible:ring-0
          focus-visible:ring-offset-0
          placeholder:text-muted-foreground/60
        "
      />

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 border-t bg-background/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
            <Paperclip className="h-4 w-4" />
          </Button>

          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger
              className="
                h-7
                px-2.5
                rounded-md
                text-xs
                font-medium
                border
                border-muted
                bg-muted/40
                hover:bg-muted
                focus:ring-0
                focus:ring-offset-0
                flex
                items-center
                gap-1
              "
            >
              <Sparkles className="h-3 w-3 opacity-70" />
              <span>{modelLabelMap[selectedModel]}</span>
            </SelectTrigger>

            <SelectContent align="start" className="max-h-64 overflow-y-auto">
              {MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex flex-col">
                    <span className="text-sm">{model.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.provider}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          size="icon"
          disabled={loading || !input.trim()}
          onClick={onSend}
          className="
            h-8
            w-8
            rounded-md
            bg-foreground
            text-background
            hover:bg-foreground/90
            disabled:opacity-30
          "
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ========================================================= */
/* Main Page                                                  */
/* ========================================================= */

export function AIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);

  const { getToken } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto scroll */
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;

    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages, loading]);

  /* Auto-grow textarea */
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 200) + "px";
  }, [input]);

  const sendPrompt = async () => {
    const content = input.trim();
    if (!content || loading) return;

    setInput("");
    setLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: content,
          max_tokens: 1000,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          prompt: content,
          response: data.response,
          timestamp: new Date(),
          model: selectedModel,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-background">
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-3xl space-y-8">
            <h1 className="text-center text-4xl font-semibold">
              What’s on your mind?
            </h1>

            <ChatInput
              input={input}
              setInput={setInput}
              loading={loading}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              onSend={sendPrompt}
              textareaRef={textareaRef}
            />
          </div>
        </div>
      ) : (
        <>
          <ScrollArea ref={scrollAreaRef} className="flex-1">
            <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
              {messages.map((m) => (
                <div key={m.id} className="space-y-8">
                  <Message isUser content={m.prompt} />
                  <Message
                    content={m.response}
                    model={modelLabelMap[m.model]}
                    timestamp={m.timestamp}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="shrink-0 border-t px-4 py-4">
            <div className="mx-auto max-w-3xl">
              <ChatInput
                input={input}
                setInput={setInput}
                loading={loading}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                onSend={sendPrompt}
                textareaRef={textareaRef}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
