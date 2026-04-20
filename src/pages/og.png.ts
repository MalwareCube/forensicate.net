import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { site } from '~/site.config';

const loadFont = (rel: string) =>
  readFileSync(fileURLToPath(new URL(`../../node_modules/${rel}`, import.meta.url)));

const sansRegular = loadFont('@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff');
const sansBold = loadFont('@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff');
const serifBold = loadFont('@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-700-normal.woff');

export const GET: APIRoute = async () => {
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
        fontSize: '88px',
        lineHeight: 1.1,
        color: '#1d1d1d',
      },
      children: site.title,
    },
  };

  const descriptionBlock = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        fontSize: '28px',
        lineHeight: 1.4,
        color: '#3a3a3a',
        maxWidth: '1040px',
      },
      children: site.description,
    },
  };

  const middle = {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', gap: '24px' },
      children: [titleBlock, descriptionBlock],
    },
  };

  const footer = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        fontSize: '24px',
        color: '#666666',
      },
      children: site.author,
    },
  };

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
        children: [header, middle, footer],
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
