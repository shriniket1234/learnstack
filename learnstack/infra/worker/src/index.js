export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);

    // -------- ROUTING --------
    const routes = {
      "/api/todos": env.TODO_SERVICE_URL || "http://localhost:8080",
      "/api/notes": env.NOTES_SERVICE_URL || "http://localhost:8001",
      "/api/chat": env.CHAT_SERVICE_URL || "http://localhost:8002",
      "/api/ai": env.AI_SERVICE_URL || "http://localhost:8003",
    };

    const prefix = Object.keys(routes).find(p => url.pathname.startsWith(p));
    if (!prefix) return new Response("Not Found", { status: 404 });

    // -------- CORS --------
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // -------- AUTH --------
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Cache JWT payload in KV
    let payload = await env.AUTH_CACHE.get(token, { type: "json" });

    if (!payload) {
      payload = await verifyFirebaseJWT(token, env);
      if (!payload) return new Response("Invalid Token", { status: 401 });

      // Cache for 5 minutes
      await env.AUTH_CACHE.put(token, JSON.stringify(payload), {
        expirationTtl: 300,
      });
    }

    // -------- RATE LIMIT --------
    const userId = payload.sub;
    const rateKey = `rl:${userId}:${Math.floor(Date.now() / 60000)}`;

    const count = (await env.RATE_LIMIT.get(rateKey)) || 0;
    if (count >= 100) {
      return new Response("Too Many Requests", { status: 429 });
    }
    await env.RATE_LIMIT.put(rateKey, String(Number(count) + 1), {
      expirationTtl: 60,
    });

    // -------- PROXY --------
    const headers = new Headers(req.headers);
    headers.set("x-user-id", payload.sub);
    headers.set("x-user-email", payload.email || "");

    // Remove hop-by-hop headers
    headers.delete('connection');
    headers.delete('keep-alive');
    headers.delete('proxy-authenticate');
    headers.delete('proxy-authorization');
    headers.delete('te');
    headers.delete('trailers');
    headers.delete('transfer-encoding');
    headers.delete('upgrade');

    const targetUrl = routes[prefix] + url.pathname.replace(prefix, "") + url.search;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });

    // Add CORS headers to response
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

    return newResponse;
  },
};

async function verifyFirebaseJWT(token, env) {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

    // Basic validation
    if (!decoded.iss?.includes("securetoken.google.com")) return null;
    if (!decoded.aud?.includes(env.FIREBASE_PROJECT_ID || "learnstack")) return null;
    if (decoded.exp * 1000 < Date.now()) return null;

    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}