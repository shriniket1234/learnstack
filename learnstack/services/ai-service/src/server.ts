import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Middleware
app.use(express.json());
app.use(cors());

// Types
interface ChatRequest {
  prompt: string;
  model: string;
  max_tokens?: number;
}

interface ChatResponse {
  response: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

const AVAILABLE_MODELS = [
  {
    value: "lfm-thinking",
    label: "LFM Thinking 1.2B",
    provider: "Liquid",
    free: true,
  },
  {
    value: "lfm-instruct",
    label: "LFM Instruct 1.2B",
    provider: "Liquid",
    free: true,
  },
  { value: "molmo", label: "Molmo 8B", provider: "AllenAI", free: true },
  { value: "mimo-flash", label: "Mimo Flash", provider: "Xiaomi", free: true },
  {
    value: "nemotron-nano",
    label: "Nemotron Nano 30B",
    provider: "NVIDIA",
    free: true,
  },
  {
    value: "devstral",
    label: "Devstral 2512",
    provider: "Mistral",
    free: true,
  },
  {
    value: "nemotron-vl",
    label: "Nemotron Nano 12B VL",
    provider: "NVIDIA",
    free: true,
  },
  {
    value: "qwen-next-instruct",
    label: "Qwen Next 80B",
    provider: "Alibaba",
    free: true,
  },
  {
    value: "deepseek-chimera",
    label: "DeepSeek R1T Chimera",
    provider: "DeepSeek",
    free: true,
  },
  { value: "gemma-3n", label: "Gemma 3 Nano", provider: "Google", free: true },
  {
    value: "llama-3.1-405b",
    label: "Llama 3.1 405B",
    provider: "Meta",
    free: true,
  },
  {
    value: "mistral-small",
    label: "Mistral Small 24B",
    provider: "Mistral",
    free: true,
  },
  { value: "gemma-3-4b", label: "Gemma 3 4B", provider: "Google", free: true },
  {
    value: "gemma-3-12b",
    label: "Gemma 3 12B",
    provider: "Google",
    free: true,
  },
  {
    value: "gemma-3-27b",
    label: "Gemma 3 27B",
    provider: "Google",
    free: true,
  },
  {
    value: "gpt-oss-120b",
    label: "GPT OSS 120B",
    provider: "OpenAI",
    free: true,
  },
  {
    value: "gpt-oss-20b",
    label: "GPT OSS 20B",
    provider: "OpenAI",
    free: true,
  },
  { value: "glm-air", label: "GLM 4.5 Air", provider: "Zhipu", free: true },
  { value: "kimi-k2", label: "Kimi K2", provider: "Moonshot", free: true },
  {
    value: "hermes-405b",
    label: "Hermes 3 405B",
    provider: "NousResearch",
    free: true,
  },
  {
    value: "llama-3.3-70b",
    label: "Llama 3.3 70B",
    provider: "Meta",
    free: true,
  },
];

// Auth middleware
async function verifyFirebaseJWT(token: string): Promise<any> {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );

    // Basic validation
    if (!decoded.iss?.includes("securetoken.google.com"))
      throw new Error("Invalid issuer");
    if (!decoded.aud?.includes(process.env.FIREBASE_PROJECT_ID || "learnstack"))
      throw new Error("Invalid audience");
    if (decoded.exp * 1000 < Date.now()) throw new Error("Token expired");

    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    throw error;
  }
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No cookie auth credentials found" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyFirebaseJWT(token);

    // Add user info to request
    (req as any).user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Health check
app.get("/health", authMiddleware, (req: Request, res: Response) => {
  res.json({ status: "ok", service: "ai-service" });
});

// Get available models
app.get("/api/v1/models", (req: Request, res: Response) => {
  res.json({
    models: AVAILABLE_MODELS,
    total: AVAILABLE_MODELS.length,
  });
});

// Test endpoint (no auth - for testing)
app.post("/test", async (req: Request, res: Response) => {
  try {
    const { prompt, model, max_tokens = 100 }: ChatRequest = req.body;

    if (!prompt || !model) {
      res.status(400).json({ error: "prompt and model required" });
      return;
    }

    console.log("🧪 Test endpoint called:", { prompt, model });

    const modelMap: Record<string, string> = {
      "gpt-4": "openai/gpt-4",
      "gpt-3.5": "openai/gpt-3.5-turbo",
      "claude-3": "anthropic/claude-3-sonnet",
    };

    const openrouterModel = modelMap[model] || "openai/gpt-3.5-turbo";

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: openrouterModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: max_tokens,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3001",
          "X-Title": "Learnstack",
        },
      },
    );

    res.json({
      response: response.data.choices[0].message.content,
      model: model,
    });
  } catch (error) {
    console.error(
      "Test error:",
      error instanceof Error ? error.message : error,
    );
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error?.message || error.message,
      });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// Chat endpoint
app.post(
  "/api/v1/chat",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { prompt, model, max_tokens = 1000 }: ChatRequest = req.body;

      if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
      }

      if (!model) {
        res.status(400).json({ error: "Model is required" });
        return;
      }

      // Map model names to OpenRouter model IDs
      const modelMap: Record<string, string> = {
        "gpt-4": "openai/gpt-4",
        "gpt-3.5": "openai/gpt-3.5-turbo",
        "claude-3": "anthropic/claude-3-sonnet",
        grok: "x-ai/grok-beta",
        gemini: "google/gemini-pro",
        llama: "meta-llama/llama-2-70b-chat",
        "t3-chat": "openai/gpt-3.5-turbo",
        // Free models
        "lfm-thinking": "liquid/lfm-2.5-1.2b-thinking:free",
        "lfm-instruct": "liquid/lfm-2.5-1.2b-instruct:free",
        molmo: "allenai/molmo-2-8b:free",
        "mimo-flash": "xiaomi/mimo-v2-flash:free",
        "nemotron-nano": "nvidia/nemotron-nano-30b-a3b:free",
        devstral: "mistralai/devstral-2512:free",
        "nemotron-vl": "nvidia/nemotron-nano-12b-v2-vl:free",
        "qwen-next-instruct": "qwen/qwen3-next-80b-a3b-instruct:free",
        "deepseek-chimera": "tngtech/deepseek-r1t-chimera:free",
        "gemma-3n": "google/gemma-3n-e2b-it:free",
        "llama-3.1-405b": "meta-llama/llama-3.1-405b-instruct:free",
        "mistral-small": "mistralai/mistral-small-3.1-24b-instruct:free",
        "gemma-3-4b": "google/gemma-3-4b-it:free",
        "gemma-3-12b": "google/gemma-3-12b-it:free",
        "gemma-3-27b": "google/gemma-3-27b-it:free",
        "gpt-oss-120b": "openai/gpt-oss-120b:free",
        "gpt-oss-20b": "openai/gpt-oss-20b:free",
        "glm-air": "z-ai/glm-4.5-air:free",
        "kimi-k2": "moonshotai/kimi-k2:free",
        "hermes-405b": "nousresearch/hermes-3-llama-3.1-405b:free",
        "llama-3.3-70b": "meta-llama/llama-3.3-70b-instruct:free",
      };

      const openrouterModel = modelMap[model] || modelMap["gpt-3.5"];

      console.log(
        `Processing request: prompt=${prompt.slice(0, 50)}..., model=${model}`,
      );

      // Call OpenRouter API
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: openrouterModel,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: max_tokens,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Learnstack AI",
          },
        },
      );

      const aiResponse: ChatResponse = {
        response: response.data.choices[0].message.content,
        model: model,
        usage: response.data.usage,
      };

      res.json(aiResponse);
    } catch (error) {
      console.error("Error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const errorMessage =
          error.response?.data?.error?.message || error.message;
        res.status(status).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
);

app.post(
  "/api/v1/chat/stream",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { prompt, model, max_tokens = 1000 }: ChatRequest = req.body;

      if (!prompt || !model) {
        res.status(400).json({ error: "prompt and model required" });
        return;
      }

      const modelMap: Record<string, string> = {
        "lfm-thinking": "liquid/lfm-2.5-1.2b-thinking:free",
        "lfm-instruct": "liquid/lfm-2.5-1.2b-instruct:free",
        molmo: "allenai/molmo-2-8b:free",
        "mimo-flash": "xiaomi/mimo-v2-flash:free",
        "nemotron-nano": "nvidia/nemotron-nano-30b-a3b:free",
        devstral: "mistralai/devstral-2512:free",
        "nemotron-vl": "nvidia/nemotron-nano-12b-v2-vl:free",
        "qwen-next-instruct": "qwen/qwen3-next-80b-a3b-instruct:free",
        "deepseek-chimera": "tngtech/deepseek-r1t-chimera:free",
        "gemma-3n": "google/gemma-3n-e2b-it:free",
        "llama-3.1-405b": "meta-llama/llama-3.1-405b-instruct:free",
        "mistral-small": "mistralai/mistral-small-3.1-24b-instruct:free",
        "gemma-3-4b": "google/gemma-3-4b-it:free",
        "gemma-3-12b": "google/gemma-3-12b-it:free",
        "gemma-3-27b": "google/gemma-3-27b-it:free",
        "gpt-oss-120b": "openai/gpt-oss-120b:free",
        "gpt-oss-20b": "openai/gpt-oss-20b:free",
        "glm-air": "z-ai/glm-4.5-air:free",
        "kimi-k2": "moonshotai/kimi-k2:free",
        "hermes-405b": "nousresearch/hermes-3-llama-3.1-405b:free",
        "llama-3.3-70b": "meta-llama/llama-3.3-70b-instruct:free",
      };

      const openrouterModel = modelMap[model];
      if (!openrouterModel) {
        res.status(400).json({ error: "Unsupported model" });
        return;
      }

      /* ---------------- SSE headers ---------------- */
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      /* ---------------- OpenRouter stream ---------------- */
      const openrouter = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: openrouterModel,
          messages: [{ role: "user", content: prompt }],
          max_tokens,
          stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Learnstack AI",
          },
          responseType: "stream",
        },
      );

      openrouter.data.on("data", (chunk: Buffer) => {
        const lines = chunk
          .toString()
          .split("\n")
          .filter((line) => line.startsWith("data:"));

        for (const line of lines) {
          if (line.includes("[DONE]")) {
            res.write("event: done\ndata: done\n\n");
            res.end();
            return;
          }

          try {
            const json = JSON.parse(line.replace("data: ", ""));
            const token = json.choices?.[0]?.delta?.content;
            if (token) {
              res.write(`data: ${token}\n\n`);
            }
          } catch {
            // ignore malformed chunks
          }
        }
      });

      openrouter.data.on("end", () => {
        res.end();
      });

      openrouter.data.on("error", (err: any) => {
        console.error("Stream error:", err);
        res.end();
      });
    } catch (error) {
      console.error("Streaming error:", error);
      res.end();
    }
  },
);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Service running on port ${PORT}`);
  console.log(
    `📚 Models available: gpt-4, gpt-3.5, claude-3, grok, gemini, llama, t3-chat, lfm-thinking, lfm-instruct, molmo, mimo-flash, nemotron-nano, devstral, nemotron-vl, qwen-next-instruct, deepseek-chimera, gemma-3n, llama-3.1-405b, mistral-small, gemma-3-4b, gemma-3-12b, gemma-3-27b, gpt-oss-120b, gpt-oss-20b, glm-air, kimi-k2, hermes-405b, llama-3.3-70b`,
  );
});
