const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8003;

// Middleware
app.use(cors());
app.use(express.json());

// OpenRouter API endpoint
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model mapping to OpenRouter models
const modelMapping = {
  'gpt-4': 'openai/gpt-4',
  'claude-3': 'anthropic/claude-3-haiku',
  'grok': 'x-ai/grok-2-1212',
  't3-chat': 'anthropic/claude-3-haiku', // placeholder
  'gemini': 'google/gemini-pro',
  'llama': 'meta-llama/llama-3.1-8b-instruct'
};

app.post('/api/v1/chat', async (req, res) => {
  try {
    const { model, prompt, max_tokens = 1000 } = req.body;

    if (!model || !prompt) {
      return res.status(400).json({ error: 'Model and prompt are required' });
    }

    const openRouterModel = modelMapping[model];
    if (!openRouterModel) {
      return res.status(400).json({ error: 'Unsupported model' });
    }

    const response = await axios.post(OPENROUTER_URL, {
      model: openRouterModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: max_tokens
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Learnstack AI'
      }
    });

    const aiResponse = response.data.choices[0].message.content;

    res.json({
      response: aiResponse,
      model: model
    });

  } catch (error) {
    console.error('Error calling OpenRouter:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get AI response',
      details: error.response?.data?.error || error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'AI Service is running with OpenRouter' });
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});