import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, Sparkles, Loader2 } from "lucide-react";

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

const API_BASE = "https://ai-service-fawn.vercel.app";

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
  return (
    <span className="inline-block ml-0.5 w-2 h-5 bg-foreground animate-pulse align-middle">
      ▍
    </span>
  );
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
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  return (
    <div className="relative rounded-3xl border-2 border-border bg-background shadow-lg transition-all focus-within:border-primary/50 focus-within:shadow-xl">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          adjustHeight();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder={`Message ${modelLabelMap[selectedModel]}...`}
        disabled={loading}
        rows={1}
        className="w-full resize-none border-0 bg-transparent px-6 pt-5 pb-16 text-[15px] leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
        style={{ minHeight: "60px", maxHeight: "200px" }}
      />

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/30 rounded-b-3xl">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted"
            disabled={loading}
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </Button>

          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="h-8 px-3 text-xs border-0 bg-muted hover:bg-muted/80 rounded-full transition-colors">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span className="font-medium">
                {modelLabelMap[selectedModel]}
              </span>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {MODELS.map((model) => (
                <SelectItem
                  key={model.value}
                  value={model.value}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{model.label}</span>
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
          className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
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

    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const sendPrompt = async () => {
    if (!input.trim() || loading) return;

    const content = input;
    setInput("");
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

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

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: content, model: selectedModel }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

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
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                response: "Sorry, there was an error processing your request.",
                streaming: false,
              }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Chat messages */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
        <div className="mx-auto max-w-3xl px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                How can I help you today?
              </h2>
              <p className="text-muted-foreground">
                Ask me anything or choose a model to get started
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <div key={m.id}>
                  <Message isUser content={m.prompt} />
                  <Message
                    content={m.response || (m.streaming ? "" : "Thinking...")}
                    model={modelLabelMap[m.model]}
                    timestamp={m.timestamp}
                  />
                  {m.streaming && m.response && <Cursor />}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Sticky input */}
      <div className="sticky bottom-0 border-t border-border/50 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl p-4 pb-6">
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
