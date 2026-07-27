import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/assets", { recursive: true });
await Promise.all([
  cp("index.html", "dist/index.html"),
  cp("styles.css", "dist/styles.css"),
  cp("script.js", "dist/script.js"),
  cp("assets", "dist/assets", { recursive: true })
]);
console.log("Static site prepared in dist/");
