import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT ?? 4174);
const base = "/dreamcamera/";
const root = "docs";

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".wasm", "application/wasm"],
]);

createServer(async (request, response) => {
  const url = new URL(
    request.url ?? "/",
    `http://${request.headers.host ?? "127.0.0.1"}`,
  );
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/") {
    response.writeHead(302, { Location: base });
    response.end();
    return;
  }

  if (!pathname.startsWith(base)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  pathname = pathname.slice(base.length);
  if (pathname === "" || pathname.endsWith("/")) {
    pathname += "index.html";
  }

  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = join(root, safePath);

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type":
        types.get(extname(filePath)) ?? "application/octet-stream",
      "cache-control": filePath.includes("/assets/")
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    });
    response.end(body);
  } catch {
    const fallback = await readFile(join(root, "404.html"));
    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
    });
    response.end(fallback);
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Dreamcamera Pages preview: http://127.0.0.1:${port}${base}`);
});
