import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/components/ui/message";
import { useAuth } from "@/hooks/useAuth";
import { ChatInput } from "@/components/ui/ChatInput";
import { MODELS } from "@/utils/models";

const API_BASE = "https://ai-service-fawn.vercel.app";

/* ---------------- Models ---------------- */

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
    <span className="ml-1 inline-block h-4 w-[2px] bg-foreground/70 animate-pulse" />
  );
}

/* ---------------- Page ---------------- */

export function AIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);

  const { getToken } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="mx-auto max-w-2xl px-4 py-10 space-y-10">
          {messages.length === 0 ? (
            <div className="py-24 text-center">
              <h2 className="text-xl font-semibold">How can I help?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ask anything or pick a model to start
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="space-y-4">
                <Message isUser content={m.prompt} />
                <Message
                  content={m.response}
                  timestamp={m.timestamp}
                  model={modelLabelMap[m.model]}
                />
                {m.streaming && m.response && <Cursor />}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="sticky bottom-0  backdrop-blur">
        <div className="mx-auto max-w-2xl p-4 pb-6">
          <ChatInput
            input={input}
            setInput={setInput}
            loading={loading}
            model={selectedModel}
            setModel={setSelectedModel}
            onSend={sendPrompt}
          />
        </div>
      </div>
    </div>
  );
}
