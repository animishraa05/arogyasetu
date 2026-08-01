// api/backend.cjs — CommonJS (works regardless of "type":"module" in package.json)
// Vercel routes /api/* here with the path captured as ?__path=
// Runs server-side: Node.js → Oracle VM over HTTP, no mixed-content restriction.

const BACKEND_URL = process.env.BACKEND_URL || "http://92.4.67.143";

module.exports = async function handler(req, res) {
  const proxyPath = req.query.__path || "";

  // Strip our internal __path param, keep any real query params the client sent
  const url = new URL(req.url, "http://localhost");
  url.searchParams.delete("__path");
  const qs = url.searchParams.toString();

  const targetUrl = `${BACKEND_URL}/api/${proxyPath}${qs ? "?" + qs : ""}`;

  const forwardHeaders = { ...req.headers };
  delete forwardHeaders["host"];        // must be backend's host, not Vercel's
  delete forwardHeaders["connection"];  // hop-by-hop, must not be forwarded

  try {
    let body;
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
    console.error("[proxy] fetch error:", err.message);
    res.status(502).json({ error: "Bad Gateway", detail: err.message });
  }
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
