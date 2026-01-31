export interface Model {
  value: string;
  label: string;
  provider: string;
}

export const MODELS: Model[] = [
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
