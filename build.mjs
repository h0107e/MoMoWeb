import { cp, mkdir, rm, writeFile } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/assets", { recursive: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await Promise.all([
  cp("index.html", "dist/index.html"),
  cp("styles.css", "dist/styles.css"),
  cp("script.js", "dist/script.js"),
  cp("gesture.js", "dist/gesture.js"),
  cp("assets", "dist/assets", { recursive: true }),
  cp(".openai/hosting.json", "dist/.openai/hosting.json"),
  writeFile(
    "dist/server/index.js",
    "export default { async fetch(request, env) { return env.ASSETS.fetch(request); } };"
  )
]);
console.log("Static site prepared in dist/");
