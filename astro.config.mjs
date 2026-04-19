import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import rehypeAutolinkIds from './src/lib/rehype-autolink-ids.mjs';
import rehypeWrapTables from './src/lib/rehype-wrap-tables.mjs';
import rehypeExternalLinks from 'rehype-external-links';
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://forensicate.net';

function unlistedPostUrls() {
  const dir = './src/content/posts';
  if (!fs.existsSync(dir)) return new Set();
  const urls = new Set();
  for (const file of fs.readdirSync(dir)) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const fm = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (fm && /^\s*unlisted:\s*true\b/m.test(fm[1])) {
      const slug = file.replace(/\.(md|mdx)$/, '');
      urls.add(`${SITE}/posts/${slug}/`);
    }
  }
  return urls;
}

const unlistedUrls = unlistedPostUrls();

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !unlistedUrls.has(page) }),
    icon(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1 },
          content: { type: 'text', value: ' #' },
        },
      ],
      rehypeAutolinkIds,
      rehypeWrapTables,
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
          protocols: ['http', 'https'],
        },
      ],
    ],
  },
});
