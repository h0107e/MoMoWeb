import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/client/assets", { recursive: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await Promise.all([
  cp("index.html", "dist/client/index.html"),
  cp("styles.css", "dist/client/styles.css"),
  cp("script.js", "dist/client/script.js"),
  cp("gesture.js", "dist/client/gesture.js"),
  cp("assets", "dist/client/assets", { recursive: true }),
  cp("map", "dist/client/map", { recursive: true }),
  cp(".openai/hosting.json", "dist/.openai/hosting.json")
]);

const indexHtml = await readFile("dist/client/index.html", "utf8");
const worker = `
const INDEX_HTML = ${JSON.stringify(indexHtml)};

export default {
  async fetch(request, env = {}) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(INDEX_HTML, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=0, must-revalidate"
        }
      });
    }

    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  }
};
`;

await writeFile("dist/server/index.js", worker);
console.log("Sites build prepared in dist/client and dist/server");
