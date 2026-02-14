const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

function getBackendBaseUrl() {
  const raw = (process.env.BACKEND_BASE_URL ?? "").trim();
  if (!raw) return "";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withProtocol);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function copyHeaders(source) {
  const headers = {};
  Object.entries(source ?? {}).forEach(([key, value]) => {
    if (!key || value == null) return;
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
    headers[key] = Array.isArray(value) ? value.join(", ") : String(value);
  });
  return headers;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body != null) {
      if (Buffer.isBuffer(req.body) || typeof req.body === "string") {
        resolve(req.body);
        return;
      }
      resolve(Buffer.from(JSON.stringify(req.body)));
      return;
    }

    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(chunks.length ? Buffer.concat(chunks) : null));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  const backendBaseUrl = getBackendBaseUrl();

  if (!backendBaseUrl) {
    res.status(500).json({
      message: "Invalid BACKEND_BASE_URL env var in frontend deployment.",
    });
    return;
  }

  const method = req.method ?? "GET";
  const incomingUrl = new URL(req.url ?? "/", "http://localhost");
  const targetPath = incomingUrl.pathname;
  const targetUrl = `${backendBaseUrl}${targetPath}${incomingUrl.search}`;
  const headers = copyHeaders(req.headers);

  try {
    const body = method === "GET" || method === "HEAD" ? null : await readRequestBody(req);
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const responseBody = Buffer.from(await upstream.arrayBuffer());
    const responseHeaders = copyHeaders(Object.fromEntries(upstream.headers.entries()));
    Object.entries(responseHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(upstream.status).send(responseBody);
  } catch (error) {
    res.status(502).json({
      message: "Backend proxy request failed.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
