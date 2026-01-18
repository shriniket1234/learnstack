#!/bin/bash

# Deploy Cloudflare Worker

echo "🚀 Deploying Learnstack API Gateway..."

# Check if authenticated
if ! wrangler auth login --status >/dev/null 2>&1; then
    echo "❌ Not authenticated with Cloudflare. Run: wrangler auth login"
    exit 1
fi

# Deploy the worker
wrangler deploy

echo "✅ Worker deployed successfully!"

# Get the worker URL
WORKER_URL=$(wrangler tail --format=json | jq -r '.url' 2>/dev/null || echo "Check wrangler dashboard for URL")

if [ -n "$WORKER_URL" ]; then
    echo "🌐 Worker URL: $WORKER_URL"
fi

echo ""
echo "📋 Update your frontend .env file:"
echo "REACT_APP_API_URL=$WORKER_URL"