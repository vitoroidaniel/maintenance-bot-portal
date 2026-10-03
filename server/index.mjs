import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createContactHandler } from "./contact.mjs";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
const contactHandler = createContactHandler();
const server = createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.url?.split("?")[0] === "/api/contact") {
    await contactHandler(request, response);
    return;
  }
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/health") {
      response.writeHead(200, { "Content-Type": "text/plain" }).end(request.method === "HEAD" ? undefined : "ok");
      return;
    }
    const path = resolve(root, pathname === "/" ? "index.html" : `.${pathname}`);
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const content = await readFile(path);
    response.writeHead(200, {
      "Content-Type": types[extname(path)] || "application/octet-stream",
      "Content-Length": content.length,
      "Cache-Control": "no-cache",
    }).end(request.method === "HEAD" ? undefined : content);
  } catch (error) {
    const status = error.code === "ENOENT" || error.code === "EISDIR" ? 404 : error instanceof URIError || error instanceof TypeError ? 400 : 500;
    response.writeHead(status).end();
  }
});
const port = Number(process.env.PORT || 4173);
server.listen(port, "0.0.0.0", () => console.log(`Portfolio: http://localhost:${port}`));
process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());
