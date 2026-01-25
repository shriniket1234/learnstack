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

const API_BASE = "http://localhost:3001";

/* ---------------- Models ---------------- */

interface Model {
  value: string;
  label: string;
  provider: string;
}

const MODELS: Model[] = [
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
  streaming: boolean;
}

/* ---------------- Cursor ---------------- */

function Cursor() {
  return <span className="ml-1 animate-pulse text-muted-foreground">▍</span>;
}

/* ---------------- Chat Input ---------------- */

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
    <div className="relative rounded-2xl border bg-background shadow-sm">
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
        className="w-full resize-none border-0 bg-transparent px-5 pt-4 pb-14 focus-visible:ring-0"
      />

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 border-t bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>

          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="h-7 px-2 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              {modelLabelMap[selectedModel]}
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex flex-col">
                    <span>{model.label}</span>
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
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Main Page ---------------- */

export function AIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);

  const { getToken } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;

    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const sendPrompt = async () => {
    if (!input.trim() || loading) return;

    const content = input;
    setInput("");
    setLoading(true);

    const id = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id,
        prompt: content,
        response: "",
        model: selectedModel,
        timestamp: new Date(),
        streaming: true,
      },
    ]);

    const token = await getToken();
    const res = await fetch(`${API_BASE}/api/v1/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt: content, model: selectedModel }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const token = line.replace("data: ", "");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id ? { ...m, response: m.response + token } : m,
            ),
          );
        }
      }
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, streaming: false } : m)),
    );
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
          {messages.map((m) => (
            <div key={m.id} className="space-y-4">
              <Message isUser content={m.prompt} />
              <div className="relative">
                <Message
                  content={m.response || (m.streaming ? "Thinking…" : "")}
                  model={modelLabelMap[m.model]}
                  timestamp={m.timestamp}
                />
                {m.streaming && <Cursor />}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
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
    </div>
  );
}
