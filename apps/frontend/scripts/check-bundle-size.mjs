import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const MAX_INITIAL_GZIP_BYTES = 120 * 1024;
const html = readFileSync(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
const entryMatch = html.match(
  /<script[^>]+type="module"[^>]+src="([^"]+\.js)"/,
);

if (!entryMatch?.[1]) {
  throw new Error(
    "No se encontró el entrypoint JavaScript en dist/index.html.",
  );
}

const preloadUrls = [
  ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+\.js)"/g),
].flatMap((match) => (match[1] ? [match[1]] : []));
const initialJavaScriptUrls = new Set([entryMatch[1], ...preloadUrls]);
const gzipBytes = [...initialJavaScriptUrls].reduce((total, assetPath) => {
  const assetUrl = new URL(`../dist${assetPath}`, import.meta.url);
  return total + gzipSync(readFileSync(assetUrl)).byteLength;
}, 0);
const gzipKiB = (gzipBytes / 1024).toFixed(1);

if (gzipBytes > MAX_INITIAL_GZIP_BYTES) {
  throw new Error(
    `La carga inicial pesa ${gzipKiB} KiB gzip y supera el límite de ${
      MAX_INITIAL_GZIP_BYTES / 1024
    } KiB.`,
  );
}

if (html.includes("appointment-form") || html.includes("get-api-error")) {
  throw new Error(
    "El formulario de reservas volvió a entrar en la carga inicial.",
  );
}

console.log(`Bundle inicial: ${gzipKiB} KiB gzip (límite: 120 KiB).`);
