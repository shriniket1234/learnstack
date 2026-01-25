import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/components/ui/message";
import { useState, useEffect, useRef } from "react";
import { ArrowUp, Paperclip, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface AIMessage {
  id: number;
  prompt: string;
  response: string;
  timestamp: Date;
  model: string;
}

interface Model {
  value: string;
  label: string;
  provider: string;
}

const SUGGESTION_PROMPTS = [
  { icon: "📝", text: "Summary" },
  { icon: "💻", text: "Code" },
  { icon: "🎨", text: "Design" },
  { icon: "📚", text: "Research" },
  { icon: "✨", text: "Get Inspired" },
];

const THINKING_MODES = [
  { icon: "🧠", text: "Think Deeply" },
  { icon: "💡", text: "Learn Gently" },
];

export function AIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [loadingModels, setLoadingModels] = useState(true);
  const { getToken } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/models`);
        if (!response.ok) throw new Error("Failed to fetch models");
        const data = await response.json();
        setModels(data.models);
      } catch (error) {
        console.error("Error fetching models:", error);
        setModels([
          { value: "gpt-4", label: "GPT-4.1 Nano", provider: "OpenAI" },
          { value: "gpt-3.5", label: "GPT-3.5 Turbo", provider: "OpenAI" },
          {
            value: "claude-3",
            label: "Claude 3 Sonnet",
            provider: "Anthropic",
          },
          { value: "grok", label: "Grok", provider: "xAI" },
          { value: "gemini", label: "Gemini Pro", provider: "Google" },
          { value: "llama", label: "Llama 2 70B", provider: "Meta" },
        ]);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const sendPrompt = async (customPrompt?: string) => {
    const messageToSend = customPrompt || input.trim();
    if (messageToSend && !loading) {
      setInput("");
      setLoading(true);

      try {
        const token = await getToken();
        const response = await fetch(`${API_BASE}/api/v1/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: messageToSend,
            max_tokens: 1000,
          }),
        });
        if (!response.ok) throw new Error("Failed to get AI response");

        const data = await response.json();

        setMessages([
          ...messages,
          {
            id: Date.now(),
            prompt: messageToSend,
            response: data.response,
            timestamp: new Date(),
            model: selectedModel,
          },
        ]);
      } catch (error) {
        console.error("Error:", error);
        setMessages([
          ...messages,
          {
            id: Date.now(),
            prompt: messageToSend,
            response: "Sorry, there was an error processing your request.",
            timestamp: new Date(),
            model: selectedModel,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  return (
    <div className="flex flex-col bg-background">
      {messages.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-3xl space-y-8">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-semibold text-center mb-12">
              What's on your mind?
            </h1>

            {/* Input Container */}
            <div className="space-y-6">
              {/* Main Input Bar */}
              <div className="relative border rounded-2xl bg-background shadow-sm overflow-hidden">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${selectedModel || "AI"}...`}
                  disabled={loading}
                  className="w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[120px] max-h-[200px] bg-transparent px-5 pt-5 pb-16 text-base placeholder:text-muted-foreground/50"
                  rows={1}
                />

                {/* Bottom Bar */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-3 border-t bg-background">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>

                    <Select
                      value={selectedModel}
                      onValueChange={setSelectedModel}
                    >
                      <SelectTrigger className="w-auto h-8 border-0 bg-transparent hover:bg-muted/50 focus:ring-0 text-sm gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="start">
                        {!loadingModels &&
                          models.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => sendPrompt()}
                    disabled={loading || !input.trim()}
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {SUGGESTION_PROMPTS.map((prompt, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => sendPrompt(prompt.text)}
                    className="rounded-full h-9 px-4 text-sm font-normal"
                  >
                    <span className="mr-2">{prompt.icon}</span>
                    {prompt.text}
                  </Button>
                ))}
              </div>

              {/* Thinking Mode Chips */}
              <div className="flex items-center justify-center gap-2">
                {THINKING_MODES.map((mode, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => sendPrompt(mode.text)}
                    className="rounded-full h-9 px-4 text-sm font-normal"
                  >
                    <span className="mr-2">{mode.icon}</span>
                    {mode.text}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Chat State */
        <>
          <ScrollArea ref={scrollAreaRef} className="flex-1">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-8">
                  <Message content={msg.prompt} isUser={true} />
                  <Message
                    content={msg.response}
                    isUser={false}
                    timestamp={msg.timestamp}
                    model={
                      models.find((m) => m.value === msg.model)?.label ||
                      msg.model
                    }
                  />
                </div>
              ))}
              {loading && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {models.find((m) => m.value === selectedModel)?.label}
                  </div>
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Sticky Input */}
          <div className="border-t bg-background px-4 py-4 shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="relative border rounded-2xl bg-background shadow-sm overflow-hidden">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Zola"
                  disabled={loading}
                  className="w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[80px] max-h-[200px] bg-transparent px-5 pt-4 pb-14 text-base placeholder:text-muted-foreground/50"
                  rows={1}
                />

                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-3 border-t bg-background">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>

                    <Select
                      value={selectedModel}
                      onValueChange={setSelectedModel}
                    >
                      <SelectTrigger className="w-auto h-8 border-0 bg-transparent hover:bg-muted/50 focus:ring-0 text-sm gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="start">
                        {!loadingModels &&
                          models.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => sendPrompt()}
                    disabled={loading || !input.trim()}
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
