# Deployment Instructions

## Deploy to Cloudflare Pages

Run from `apps/web` directory:

```bash
npm run build
npx wrangler pages deploy dist
```

### One-command deployment:

```bash
npm run build && npx wrangler pages deploy dist
```

### Automated Deployment

For automatic deployments on every push, connect your GitHub repository to Cloudflare Pages dashboard:

1. Go to https://dash.cloudflare.com/
2. Pages → Create project → Connect to Git
3. Build command: `npm run build`
4. Build output: `dist`
