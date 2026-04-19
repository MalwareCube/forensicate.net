import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public');
const tmpDir = resolve(__dirname, '..', '.favicon-tmp');
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const BG = '#d95a1e';
const FG = '#f3f3f3';

const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <rect width="64" height="64" rx="10" ry="10" fill="${BG}"/>
  <g fill="none" stroke="${FG}" stroke-width="5" stroke-linecap="round">
    <circle cx="27" cy="27" r="13"/>
    <line x1="37" y1="37" x2="50" y2="50"/>
  </g>
</svg>`;

const svgFlat = svg(64).replace(/rx="10" ry="10"/, 'rx="0" ry="0"');

const pngSizes = [16, 32, 48, 180, 192, 512];
const outputs = [];

for (const size of pngSizes) {
  const buf = await sharp(Buffer.from(svg(size))).resize(size, size).png().toBuffer();
  outputs.push({ size, buf });
}

writeFileSync(resolve(outDir, 'favicon.svg'), svg(64));

const apple = outputs.find((o) => o.size === 180).buf;
writeFileSync(resolve(outDir, 'apple-touch-icon.png'), apple);

writeFileSync(resolve(outDir, 'icon-192.png'), outputs.find((o) => o.size === 192).buf);
writeFileSync(resolve(outDir, 'icon-512.png'), outputs.find((o) => o.size === 512).buf);
writeFileSync(resolve(outDir, 'favicon-32.png'), outputs.find((o) => o.size === 32).buf);
writeFileSync(resolve(outDir, 'favicon-16.png'), outputs.find((o) => o.size === 16).buf);

const icoInputs = [16, 32, 48].map((s) => outputs.find((o) => o.size === s).buf);
const ico = await pngToIco(icoInputs);
writeFileSync(resolve(outDir, 'favicon.ico'), ico);

const manifest = {
  name: 'forensicate',
  short_name: 'forensicate',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  theme_color: BG,
  background_color: BG,
  display: 'minimal-ui',
};
writeFileSync(resolve(outDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));

console.log('favicon assets written to', outDir);
