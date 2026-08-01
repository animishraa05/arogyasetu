// .mjs = explicitly ESM — unambiguous regardless of package.json "type":"module"
// Vercel docs pattern: /api/backend is called with ?path= from vercel.json rewrite capture

const BACKEND_URL = process.env.BACKEND_URL || "http://92.4.67.143";

export default async function handler(req, res) {
  // path is the captured wildcard from vercel.json: /api/:path* -> ?path=:path*
  const rawPath = req.query.path;
  const path = Array.isArray(rawPath) ? rawPath.join("/") : rawPath || "";

  // Preserve any other query params the client sent (minus our internal 'path')
  const url = new URL(req.url, "http://localhost");
  url.searchParams.delete("path");
  const qs = url.searchParams.toString();

  const targetUrl = `${BACKEND_URL}/api/${path}${qs ? "?" + qs : ""}`;

  const headers = Object.fromEntries(
    Object.entries(req.headers).filter(([k]) => k !== "host" && k !== "connection")
  );

  try {
    let body;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
      });
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    res.status(upstream.status);
    upstream.headers.forEach((v, k) => {
      if (!["transfer-encoding", "connection", "keep-alive"].includes(k)) {
        res.setHeader(k, v);
      }
    });
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    console.error("[proxy]", err.message);
    res.status(502).json({ error: "Bad Gateway", detail: err.message });
  }
}
