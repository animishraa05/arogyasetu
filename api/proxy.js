// Vercel serverless function: /api/[...path]
// Runs server-side on Vercel's Node.js edge — no browser mixed-content restrictions.
// All frontend requests to /api/* are forwarded here, then proxied to the Oracle VM over HTTP.

const BACKEND_URL = process.env.BACKEND_URL || "http://92.4.67.143";

export default async function handler(req, res) {
  // Reconstruct the target URL: strip the leading /api from the path
  // Vercel gives us req.url like /api/users/login/
  const targetPath = req.url; // keeps /api/users/login/ as-is
  const targetUrl = `${BACKEND_URL}${targetPath}`;

  // Forward all headers except host (which must be the target's host)
  const forwardHeaders = { ...req.headers };
  delete forwardHeaders["host"];
  delete forwardHeaders["connection"];

  try {
    const body =
      req.method !== "GET" && req.method !== "HEAD"
        ? await readBody(req)
        : undefined;

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      // Don't follow redirects blindly — let the client handle them
      redirect: "manual",
    });

    // Pass through status and headers from backend
    res.status(backendRes.status);
    backendRes.headers.forEach((value, key) => {
      // Skip headers that cause issues when forwarded
      if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const responseBody = await backendRes.arrayBuffer();
    res.send(Buffer.from(responseBody));
  } catch (err) {
    console.error("[proxy] Error forwarding request:", err);
    res.status(502).json({ error: "Bad Gateway", detail: err.message });
  }
}

// Helper to read request body as a Buffer
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
