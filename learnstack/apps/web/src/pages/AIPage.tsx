import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Bot, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

export function AIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [loadingModels, setLoadingModels] = useState(true);
  const { getToken } = useAuth();

  // Fetch available models on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/v1/models");
        if (!response.ok) throw new Error("Failed to fetch models");
        const data = await response.json();
        setModels(data.models);
      } catch (error) {
        console.error("Error fetching models:", error);
        // Fallback to default models if fetch fails
        setModels([
          { value: "gpt-4", label: "ChatGPT (GPT-4)", provider: "OpenAI" },
          {
            value: "gpt-3.5",
            label: "ChatGPT (GPT-3.5 Turbo)",
            provider: "OpenAI",
          },
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

  const sendPrompt = async () => {
    if (input.trim()) {
      setLoading(true);
      try {
        const token = await getToken();
        const response = await fetch("/api/v1/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: input,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }

        const data = await response.json();

        setMessages([
          ...messages,
          {
            id: Date.now(),
            prompt: input,
            response: data.response,
            timestamp: new Date(),
            model: selectedModel,
          },
        ]);
        setInput("");
      } catch (error) {
        console.error("Error:", error);
        setMessages([
          ...messages,
          {
            id: Date.now(),
            prompt: input,
            response: "Sorry, there was an error processing your request.",
            timestamp: new Date(),
            model: selectedModel,
          },
        ]);
        setInput("");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="h-[700px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Chat
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with your AI assistant</p>
                  <p className="text-sm">Select a model and ask anything!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="text-sm font-medium">You</span>
                          </div>
                          <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
                            {msg.prompt}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* AI Message */}
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {models.find((m) => m.value === msg.model)?.label ||
                              msg.model}
                          </span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="bg-muted rounded-lg px-4 py-2">
                            {msg.response}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI..."
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
              className="flex-1"
            />
            <Button onClick={sendPrompt} disabled={loading}>
              {loading ? "Thinking..." : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
