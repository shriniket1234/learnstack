import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

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

// 🔐 Auth helpers
async function verifyFirebaseJWT(token: string) {
  const [, payload] = token.split(".");

  const decoded = JSON.parse(
    Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf-8"),
  );

  if (!decoded.iss?.includes("securetoken.google.com"))
    throw new Error("Invalid issuer");
  if (!decoded.aud?.includes(process.env.FIREBASE_PROJECT_ID || "learnstack"))
    throw new Error("Invalid audience");
  if (decoded.exp * 1000 < Date.now()) throw new Error("Token expired");

  return decoded;
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No auth token" });
    }

    const token = authHeader.split(" ")[1];
    (req as any).user = await verifyFirebaseJWT(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Routes
app.get("/health", authMiddleware, (_, res) => {
  res.json({ status: "ok", service: "ai-service" });
});

app.get("/api/v1/models", (_, res) => {
  res.json({ models: AVAILABLE_MODELS, total: AVAILABLE_MODELS.length });
});

app.post("/api/v1/chat", authMiddleware, async (req, res) => {
  try {
    const { prompt, model, max_tokens = 1000 }: ChatRequest = req.body;
    if (!prompt || !model)
      return res.status(400).json({ error: "prompt & model required" });

    const modelMap: Record<string, string> = {
      "lfm-thinking": "liquid/lfm-2.5-1.2b-thinking:free",
      "lfm-instruct": "liquid/lfm-2.5-1.2b-instruct:free",
      molmo: "allenai/molmo-2-8b:free",
      "mimo-flash": "xiaomi/mimo-v2-flash:free",
      "nemotron-nano": "nvidia/nemotron-nano-30b-a3b:free",
      devstral: "mistralai/devstral-2512:free",
      "llama-3.3-70b": "meta-llama/llama-3.3-70b-instruct:free",
    };

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: modelMap[model],
        messages: [{ role: "user", content: prompt }],
        max_tokens,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "X-Title": "Learnstack AI",
        },
      },
    );

    const aiResponse: ChatResponse = {
      response: response.data.choices[0].message.content,
      model,
      usage: response.data.usage,
    };

    res.json(aiResponse);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "AI error" });
  }
});

// ❌ NO app.listen()
// ✅ EXPORT FOR VERCEL
export default app;
