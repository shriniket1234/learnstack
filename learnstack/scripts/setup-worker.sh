#!/bin/bash

# Setup Cloudflare Worker for Learnstack API Gateway

echo "🔧 Setting up Cloudflare Worker API Gateway..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install wrangler --save-dev
fi

# Create KV namespaces
echo "📦 Creating KV namespaces..."

AUTH_CACHE_ID=$(wrangler kv:namespace create AUTH_CACHE --preview false)
echo "AUTH_CACHE ID: $AUTH_CACHE_ID"

RATE_LIMIT_ID=$(wrangler kv:namespace create RATE_LIMIT --preview false)
echo "RATE_LIMIT ID: $RATE_LIMIT_ID"

# Extract IDs from output (wrangler returns "Created namespace with ID: <id>")
AUTH_CACHE_ID=$(echo $AUTH_CACHE_ID | grep -o 'Created namespace with ID: [a-zA-Z0-9_-]*' | cut -d' ' -f5)
RATE_LIMIT_ID=$(echo $RATE_LIMIT_ID | grep -o 'Created namespace with ID: [a-zA-Z0-9_-]*' | cut -d' ' -f5)

echo "✅ KV namespaces created!"
echo "AUTH_CACHE_ID: $AUTH_CACHE_ID"
echo "RATE_LIMIT_ID: $RATE_LIMIT_ID"

# Update wrangler.toml with actual IDs
sed -i.bak "s/your-auth-cache-namespace-id/$AUTH_CACHE_ID/g" wrangler.toml
sed -i.bak "s/your-rate-limit-namespace-id/$RATE_LIMIT_ID/g" wrangler.toml

echo "📝 Updated wrangler.toml with namespace IDs"

# Create preview namespaces for development
echo "🧪 Creating preview namespaces..."
AUTH_CACHE_PREVIEW_ID=$(wrangler kv:namespace create AUTH_CACHE --preview true)
RATE_LIMIT_PREVIEW_ID=$(wrangler kv:namespace create RATE_LIMIT --preview true)

AUTH_CACHE_PREVIEW_ID=$(echo $AUTH_CACHE_PREVIEW_ID | grep -o 'Created namespace with ID: [a-zA-Z0-9_-]*' | cut -d' ' -f5)
RATE_LIMIT_PREVIEW_ID=$(echo $RATE_LIMIT_PREVIEW_ID | grep -o 'Created namespace with ID: [a-zA-Z0-9_-]*' | cut -d' ' -f5)

sed -i.bak "s/your-auth-cache-preview-id/$AUTH_CACHE_PREVIEW_ID/g" wrangler.toml
sed -i.bak "s/your-rate-limit-preview-id/$RATE_LIMIT_PREVIEW_ID/g" wrangler.toml

echo "✅ Preview namespaces created and configured!"

echo ""
echo "🎉 Cloudflare Worker setup complete!"
echo ""
echo "Next steps:"
echo "1. Update wrangler.toml with your actual service URLs"
echo "2. Set your environment variables:"
echo "   export CLOUDFLARE_API_TOKEN=your_token"
echo "   export CLOUDFLARE_ACCOUNT_ID=your_account_id"
echo "3. Deploy with: wrangler deploy"