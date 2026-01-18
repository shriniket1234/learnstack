# Learnstack AI Service

A multi-model AI chat API built with Express.js and OpenRouter, supporting various AI models like GPT, Claude, Grok, Gemini, etc.

## Setup

1. Sign up for [OpenRouter](https://openrouter.ai/) and get your API key.

2. Create `.env` file:

   ```
   OPENROUTER_API_KEY=your_openrouter_key
   PORT=8003
   APP_URL=http://localhost:3000
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the service:

   ```bash
   npm start
   ```

   Or for development:

   ```bash
   npm run dev
   ```

## API Endpoints

### POST /api/v1/chat

Send a chat request to an AI model via OpenRouter.

**Request Body:**

```json
{
  "model": "gpt-4",
  "prompt": "Hello, how are you?",
  "max_tokens": 1000
}
```

**Response:**

```json
{
  "response": "I'm doing well, thank you!",
  "model": "gpt-4"
}
```

**Supported Models:**

- `gpt-4` → OpenAI GPT-4
- `claude-3` → Anthropic Claude 3 Haiku
- `grok` → xAI Grok
- `gemini` → Google Gemini Pro
- `llama` → Meta Llama 3.1
- `t3-chat` → Anthropic Claude 3 Haiku (placeholder)

## Docker

Build and run with Docker:

```bash
docker build -t ai-service .
docker run -p 8003:8003 --env-file .env ai-service
```
