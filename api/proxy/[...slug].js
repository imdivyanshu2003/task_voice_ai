// Vercel serverless proxy — forwards all /api/proxy/* requests to Railway backend
const RAILWAY_URL = process.env.RAILWAY_URL || "https://taskvoiceai-production.up.railway.app";

export default async function handler(req, res) {
  // Get the path after /api/proxy/
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join("/") : slug || "";
  const targetUrl = `${RAILWAY_URL}/${path}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    // Forward status and content type
    res.status(response.status);
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    res.send(data);
  } catch (err) {
    console.error("[proxy] error:", err.message);
    res.status(502).json({ error: "proxy_failed", detail: err.message, target: targetUrl });
  }
}
