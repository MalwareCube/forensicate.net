import type { APIRoute } from 'astro';
import type { ImageMetadata } from 'astro';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getRoutablePosts, formatDate } from '~/lib/posts';
import { site } from '~/site.config';

const bannerBuffers = import.meta.glob<ArrayBuffer>(
  '/src/content/posts/**/*.{png,jpg,jpeg,webp,gif}',
  { eager: true, query: '?arraybuffer', import: 'default' },
);
const bannerMetas = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/posts/**/*.{png,jpg,jpeg,webp,gif}',
  { eager: true },
);
const processedSrcToBuffer = new Map<string, ArrayBuffer>();
for (const [p, mod] of Object.entries(bannerMetas)) {
  const buf = bannerBuffers[p];
  if (mod?.default?.src && buf) processedSrcToBuffer.set(mod.default.src, buf);
}

const loadFont = (rel: string) =>
  readFileSync(fileURLToPath(new URL(`../../../node_modules/${rel}`, import.meta.url)));

const sansRegular = loadFont('@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff');
const sansBold = loadFont('@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff');
const serifBold = loadFont('@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-700-normal.woff');

function mimeFromFormat(format: string): string {
  const f = format.toLowerCase();
  if (f === 'jpg' || f === 'jpeg') return 'image/jpeg';
  if (f === 'webp') return 'image/webp';
  if (f === 'gif') return 'image/gif';
  if (f === 'svg') return 'image/svg+xml';
  return 'image/png';
}

async function loadBannerDataUrl(banner: ImageMetadata | string): Promise<string | null> {
  try {
    if (typeof banner === 'string') {
      if (!/^https?:\/\//i.test(banner)) return null;
      const res = await fetch(banner);
      if (!res.ok) return null;
      const ct = res.headers.get('content-type');
      const mime = ct ? ct.split(';')[0].trim() : 'image/png';
      const buf = Buffer.from(await res.arrayBuffer());
      return `data:${mime};base64,${buf.toString('base64')}`;
    }
    const raw = processedSrcToBuffer.get(banner.src);
    if (!raw) return null;
    const buf = Buffer.from(raw);
    return `data:${mimeFromFormat(banner.format)};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function getStaticPaths() {
  const posts = await getRoutablePosts();
  return posts.map((p) => ({
    params: { slug: p.id.replace(/\.(md|mdx)$/, '') },
    props: { post: p },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Awaited<ReturnType<typeof getRoutablePosts>>[number] };
  const title = post.data.title;
  const date = formatDate(post.data.pubDate);
  const tags = post.data.tags.slice(0, 4);
  const bannerData = post.data.banner ? await loadBannerDataUrl(post.data.banner) : null;

  const header = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '28px',
        color: '#666666',
        textTransform: 'lowercase',
        letterSpacing: '0.02em',
      },
      children: [
        { type: 'div', props: { style: { fontWeight: 700, color: '#1d1d1d' }, children: site.title } },
        { type: 'div', props: { children: site.tagline } },
      ],
    },
  };

  const titleBlock = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        fontFamily: 'IBM Plex Serif',
        fontWeight: 700,
        fontSize: bannerData ? '54px' : '68px',
        lineHeight: 1.15,
        color: '#1d1d1d',
      },
      children: title,
    },
  };

  const footer = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '24px',
        color: '#666666',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: '16px' },
            children: [
              { type: 'div', props: { children: site.author } },
              { type: 'div', props: { children: '·' } },
              { type: 'div', props: { children: date } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: '10px' },
            children: tags.map((t) => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  padding: '4px 12px',
                  border: '1px solid #c8c8c8',
                  background: '#ffffff',
                  fontSize: '20px',
                  color: '#1d1d1d',
                },
                children: t,
              },
            })),
          },
        },
      ],
    },
  };

  const bannerStrip = bannerData
    ? {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            width: '1200px',
            height: '220px',
            marginLeft: '-80px',
            marginRight: '-80px',
            marginTop: '-70px',
            marginBottom: '30px',
            borderBottom: '1px solid #c8c8c8',
            overflow: 'hidden',
          },
          children: [
            {
              type: 'img',
              props: {
                src: bannerData,
                style: { width: '1200px', height: '220px', objectFit: 'cover' },
              },
            },
          ],
        },
      }
    : null;

  const children = bannerStrip
    ? [bannerStrip, header, titleBlock, footer]
    : [header, titleBlock, footer];

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '70px 80px',
          background: '#f3f3f3',
          border: '1px solid #c8c8c8',
          fontFamily: 'IBM Plex Sans',
          color: '#1d1d1d',
        },
        children,
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'IBM Plex Sans', data: sansRegular, weight: 400, style: 'normal' },
        { name: 'IBM Plex Sans', data: sansBold, weight: 700, style: 'normal' },
        { name: 'IBM Plex Serif', data: serifBold, weight: 700, style: 'normal' },
      ],
    },
  );

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
