// Vercel catch-all serverless proxy: api/[...path].js
// Vercel automatically routes ALL /api/* requests here via filesystem routing.
// req.url = "/api/users/login/" — the full original path, preserved by Vercel.
// This runs server-side (Node.js), so HTTP → Oracle VM has no mixed-content issue.

const BACKEND_URL = process.env.BACKEND_URL || "http://92.4.67.143";

export default async function handler(req, res) {
  // req.url is the original request path, e.g. /api/users/login/
  const targetUrl = `${BACKEND_URL}${req.url}`;

  const forwardHeaders = { ...req.headers };
  delete forwardHeaders["host"];        // must be the backend's host
  delete forwardHeaders["connection"];  // hop-by-hop header

  try {
    let body = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await readBody(req);
    }

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: "manual",
    });

    res.status(backendRes.status);

    backendRes.headers.forEach((value, key) => {
      const skip = ["transfer-encoding", "connection", "keep-alive"];
      if (!skip.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const buf = await backendRes.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error("[proxy] Error:", err.message);
    res.status(502).json({ error: "Bad Gateway", detail: err.message });
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
