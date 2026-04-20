#!/usr/bin/env node
import {
  intro,
  outro,
  text,
  select,
  multiselect,
  confirm,
  isCancel,
  cancel,
  note,
} from '@clack/prompts';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const POSTS_DIR = join(ROOT, 'src', 'content', 'posts');

function abortIf(value) {
  if (isCancel(value)) {
    cancel('Cancelled. Nothing was written.');
    process.exit(0);
  }
  return value;
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function splitList(str) {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function scanExistingFrontmatter() {
  const files = (await readdir(POSTS_DIR)).filter(
    (f) => f.endsWith('.mdx') || f.endsWith('.md'),
  );
  const tags = new Set();
  const categories = new Set();
  const series = new Set();

  for (const file of files) {
    const content = await readFile(join(POSTS_DIR, file), 'utf8');
    const fm = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const body = fm[1];

    const tagsMatch = body.match(/^tags:\s*\[(.*?)\]/m);
    if (tagsMatch) {
      tagsMatch[1]
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
        .forEach((t) => tags.add(t));
    }

    const catsMatch = body.match(/^categories:\s*\[(.*?)\]/m);
    if (catsMatch) {
      catsMatch[1]
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
        .forEach((c) => categories.add(c));
    }

    const seriesMatch = body.match(/^series:\s*["']?(.+?)["']?\s*$/m);
    if (seriesMatch) series.add(seriesMatch[1].trim());
  }

  return {
    tags: [...tags].sort(),
    categories: [...categories].sort(),
    series: [...series].sort(),
  };
}

const ARCHETYPES = {
  'tool-release': {
    label: 'Tool release',
    hint: 'GitHubCard, sections, references',
    categories: ['Tools'],
    components: ['githubCard', 'references'],
  },
  'artifact-deep-dive': {
    label: 'Artifact deep-dive',
    hint: 'Background, parsing, forensic value',
    categories: ['Research'],
    components: ['references'],
  },
  'ir-story': {
    label: 'IR story',
    hint: 'Timeline, findings, lessons',
    categories: ['Incident Response'],
    components: ['timeline', 'references'],
  },
  'malware-analysis': {
    label: 'Malware analysis',
    hint: 'Static, dynamic, indicators',
    categories: ['Malware Analysis'],
    components: ['references'],
  },
  'hunt-query': {
    label: 'Hunt query / detection',
    hint: 'Detection logic, coverage, caveats',
    categories: ['Detection'],
    components: ['references'],
  },
  tradecraft: {
    label: 'Tradecraft / TTP',
    hint: 'Technique, telemetry, detection',
    categories: ['Tradecraft'],
    components: ['references'],
  },
  'research-note': {
    label: 'Research note',
    hint: 'Short observation or finding',
    categories: ['Research'],
    components: [],
  },
  tutorial: {
    label: 'Tutorial',
    hint: 'Step-by-step how-to',
    categories: ['Tutorials'],
    components: ['references'],
  },
  cheatsheet: {
    label: 'Cheatsheet',
    hint: 'Reference-style listing',
    categories: ['Cheatsheets'],
    components: [],
  },
  'link-roundup': {
    label: 'Link roundup',
    hint: 'Curated list of links and notes',
    categories: ['Roundups'],
    components: [],
  },
  opinion: {
    label: 'Opinion / commentary',
    hint: 'Industry take or editorial',
    categories: ['Commentary'],
    components: [],
  },
  blank: {
    label: 'Blank',
    hint: 'Start from scratch',
    categories: [],
    components: [],
  },
};

function componentStub(kind, opts = {}) {
  switch (kind) {
    case 'callout':
      return `<Callout type="${opts.variant || 'note'}">\n  Your callout body here.\n</Callout>\n`;
    case 'figure':
      return `<Figure\n  src="./figures/example.png"\n  alt="Describe the image"\n  caption="Optional caption"\n/>\n`;
    case 'timeline':
      return `<Timeline\n  title="Incident timeline"\n  timezone="UTC"\n  entries={[\n    { time: "2026-01-01 09:14:02", host: "WS-01", event: "Initial access", source: "Security 4624" },\n    { time: "2026-01-01 09:18:47", host: "WS-01", event: "Suspicious process spawned", source: "Sysmon 1" },\n  ]}\n/>\n`;
    case 'llmChat':
      return `<LlmChat model="Assistant">\n  <LlmTurn role="user">\n    Your question here.\n  </LlmTurn>\n  <LlmTurn role="assistant">\n    The assistant's response.\n  </LlmTurn>\n</LlmChat>\n`;
    case 'githubCard':
      return `<GitHubCard repo="${opts.repo || 'owner/name'}" />\n`;
    case 'mermaid':
      return `<Mermaid caption="Optional caption" code={\`flowchart LR\n  A[Start] --> B[Next step]\n  B --> C[End]\n\`} />\n`;
    case 'references':
      return `## References\n\n- \n`;
    case 'footnote':
      return `Here is a line with a footnote[^1].\n\n[^1]: Footnote content.\n`;
    default:
      return '';
  }
}

function buildBody(archetype, { components, calloutVariant, githubRepo }) {
  const has = (c) => components.includes(c);
  const used = new Set();

  const sections = [];

  switch (archetype) {
    case 'tool-release':
      if (has('githubCard')) {
        sections.push(componentStub('githubCard', { repo: githubRepo }));
        used.add('githubCard');
      }
      sections.push(
        'Intro paragraph describing what this tool does and why it exists.',
      );
      sections.push('## Background\n\n...');
      sections.push('## Usage\n\n...');
      sections.push('## Investigative Value\n\n...');
      break;

    case 'artifact-deep-dive':
      sections.push(
        'Intro paragraph framing the artifact and its forensic relevance.',
      );
      sections.push('## Background\n\n...');
      sections.push('## Artifact location\n\n...');
      sections.push('## Parsing\n\n...');
      sections.push('## Forensic value\n\n...');
      break;

    case 'ir-story':
      sections.push(
        'Intro paragraph framing the incident, sanitized as appropriate.',
      );
      sections.push('## The call\n\n...');
      if (has('timeline')) {
        sections.push('## Timeline\n\n' + componentStub('timeline'));
        used.add('timeline');
      } else {
        sections.push('## Timeline\n\n...');
      }
      sections.push('## Findings\n\n...');
      sections.push('## Lessons\n\n...');
      break;

    case 'malware-analysis':
      sections.push(
        'Intro paragraph identifying the sample, how it was acquired, and what is interesting about it.',
      );
      sections.push('## Sample\n\n- SHA-256: \n- First seen: \n- Family: \n');
      sections.push('## Static analysis\n\n...');
      sections.push('## Dynamic analysis\n\n...');
      sections.push('## Indicators\n\n- \n');
      break;

    case 'hunt-query':
      sections.push(
        'Intro paragraph stating the behaviour being hunted and why it matters.',
      );
      sections.push('## Hypothesis\n\n...');
      sections.push('## Query\n\n```\n\n```\n');
      sections.push('## Logic\n\n...');
      sections.push('## Coverage and caveats\n\n...');
      break;

    case 'tradecraft':
      sections.push(
        'Intro paragraph describing the technique and who uses it.',
      );
      sections.push('## Technique\n\n...');
      sections.push('## Telemetry\n\n...');
      sections.push('## Detection opportunities\n\n...');
      break;

    case 'research-note':
      sections.push(
        'Short intro stating the observation and its significance.',
      );
      sections.push('## Observation\n\n...');
      sections.push('## Implications\n\n...');
      break;

    case 'tutorial':
      sections.push(
        'Intro paragraph stating what you will end up with by the end.',
      );
      sections.push('## Prerequisites\n\n- \n');
      sections.push('## Steps\n\n1. \n2. \n3. \n');
      sections.push('## Verification\n\n...');
      break;

    case 'cheatsheet':
      sections.push(
        'Intro paragraph explaining what this cheatsheet covers and its scope.',
      );
      sections.push('## Section one\n\n- \n- \n');
      sections.push('## Section two\n\n- \n- \n');
      break;

    case 'link-roundup':
      sections.push(
        'Intro paragraph framing the period covered and the theme.',
      );
      sections.push('## Reading\n\n- [Title](url) — note\n');
      sections.push('## Tools\n\n- [Name](url) — note\n');
      sections.push('## Research\n\n- [Title](url) — note\n');
      break;

    case 'opinion':
      sections.push('Opening stance in one or two sentences.');
      sections.push('## The argument\n\n...');
      sections.push('## Counterpoints\n\n...');
      sections.push('## Where that leaves us\n\n...');
      break;

    case 'blank':
    default:
      sections.push('Start writing.');
  }

  const extras = components.filter(
    (c) => !used.has(c) && c !== 'references' && c !== 'footnote',
  );
  if (extras.length) {
    const extraBlocks = ['## Scaffolds'];
    for (const c of extras) {
      extraBlocks.push(
        componentStub(c, { variant: calloutVariant, repo: githubRepo }),
      );
    }
    sections.push(extraBlocks.join('\n\n'));
  }

  if (has('references')) {
    sections.push(componentStub('references'));
  }
  if (has('footnote')) {
    sections.push(componentStub('footnote'));
  }

  return '\n' + sections.join('\n\n') + '\n';
}

function buildFrontmatter(fields) {
  const lines = ['---'];
  lines.push(`title: ${JSON.stringify(fields.title)}`);
  if (fields.description) {
    lines.push(`description: ${JSON.stringify(fields.description)}`);
  }
  lines.push(`pubDate: ${fields.pubDate}`);
  if (fields.tags.length) {
    lines.push(`tags: [${fields.tags.map((t) => JSON.stringify(t)).join(', ')}]`);
  }
  if (fields.categories.length) {
    lines.push(
      `categories: [${fields.categories.map((c) => JSON.stringify(c)).join(', ')}]`,
    );
  }
  if (fields.status === 'draft') lines.push('draft: true');
  if (fields.status === 'unlisted') lines.push('unlisted: true');
  if (fields.commentsEnabled === false) lines.push('comments: false');
  if (fields.banner) lines.push(`banner: ${JSON.stringify(fields.banner)}`);
  if (fields.bannerAlt) lines.push(`bannerAlt: ${JSON.stringify(fields.bannerAlt)}`);
  if (fields.bannerCaption) {
    lines.push(`bannerCaption: ${JSON.stringify(fields.bannerCaption)}`);
  }
  if (fields.series) lines.push(`series: ${JSON.stringify(fields.series)}`);
  if (fields.seriesOrder) lines.push(`seriesOrder: ${fields.seriesOrder}`);
  lines.push('---');
  return lines.join('\n');
}

async function pickFromExistingPlusNew(label, existing, { initialValues = [] } = {}) {
  if (existing.length === 0) {
    const raw = abortIf(
      await text({
        message: `${label} (comma-separated, optional)`,
        initialValue: initialValues.join(', '),
      }),
    );
    return splitList(raw);
  }

  const picked = abortIf(
    await multiselect({
      message: `${label} (space to toggle, enter to confirm)`,
      options: [
        ...existing.map((v) => ({ value: v, label: v })),
        { value: '__new__', label: 'Add new...' },
      ],
      initialValues: initialValues.filter((v) => existing.includes(v)),
      required: false,
    }),
  );

  const result = picked.filter((v) => v !== '__new__');
  const missingInitial = initialValues.filter((v) => !existing.includes(v));
  result.push(...missingInitial);

  if (picked.includes('__new__')) {
    const fresh = abortIf(
      await text({
        message: `New ${label.toLowerCase()} (comma-separated)`,
      }),
    );
    result.push(...splitList(fresh));
  }

  return [...new Set(result)];
}

async function main() {
  intro('New forensicate post');

  const existing = await scanExistingFrontmatter();

  const archetype = abortIf(
    await select({
      message: 'What kind of post?',
      options: Object.entries(ARCHETYPES).map(([value, a]) => ({
        value,
        label: a.label,
        hint: a.hint,
      })),
    }),
  );
  const archDefaults = ARCHETYPES[archetype];

  const title = abortIf(
    await text({
      message: 'Title',
      placeholder: 'The Windows 11 Start Menu Subsystem',
      validate: (v) => (!v?.trim() ? 'Title is required.' : undefined),
    }),
  );

  const slug = abortIf(
    await text({
      message: 'Slug (URL path segment)',
      initialValue: slugify(title),
      validate: (v) => {
        if (!/^[a-z0-9-]+$/.test(v)) {
          return 'Lowercase letters, numbers, and hyphens only.';
        }
        if (existsSync(join(POSTS_DIR, `${v}.mdx`))) {
          return `A post with slug "${v}" already exists.`;
        }
        return undefined;
      },
    }),
  );

  const description = abortIf(
    await text({
      message: 'Description (optional, used for SEO and RSS)',
      placeholder: 'Leave blank to skip',
    }),
  );

  const pubDate = abortIf(
    await text({
      message: 'Publication date (YYYY-MM-DD)',
      initialValue: todayISO(),
      validate: (v) =>
        !/^\d{4}-\d{2}-\d{2}$/.test(v) ? 'Use YYYY-MM-DD.' : undefined,
    }),
  );

  const categories = await pickFromExistingPlusNew('Categories', existing.categories, {
    initialValues: archDefaults.categories,
  });

  const tags = await pickFromExistingPlusNew('Tags', existing.tags);

  const seriesOptions = [
    { value: '__none__', label: 'No series' },
    ...existing.series.map((s) => ({ value: s, label: s })),
    { value: '__new__', label: 'Add new series...' },
  ];
  const seriesChoice = abortIf(
    await select({
      message: 'Series?',
      options: seriesOptions,
      initialValue: '__none__',
    }),
  );

  let series = null;
  let seriesOrder = null;
  if (seriesChoice === '__new__') {
    series = abortIf(
      await text({
        message: 'Series name',
        validate: (v) => (!v?.trim() ? 'Required.' : undefined),
      }),
    );
  } else if (seriesChoice !== '__none__') {
    series = seriesChoice;
  }
  if (series) {
    const orderStr = abortIf(
      await text({
        message: 'Series order (positive integer)',
        initialValue: '1',
        validate: (v) =>
          !/^\d+$/.test(v) || parseInt(v, 10) < 1
            ? 'Must be a positive integer.'
            : undefined,
      }),
    );
    seriesOrder = parseInt(orderStr, 10);
  }

  const status = abortIf(
    await select({
      message: 'Status',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft', hint: 'hidden from listings' },
        {
          value: 'unlisted',
          label: 'Unlisted',
          hint: 'accessible by URL only',
        },
      ],
      initialValue: 'published',
    }),
  );

  const commentsEnabled = abortIf(
    await confirm({
      message: 'Enable comments (Giscus) on this post?',
      initialValue: true,
    }),
  );

  const bannerKind = abortIf(
    await select({
      message: 'Banner image?',
      options: [
        { value: 'none', label: 'None' },
        {
          value: 'local',
          label: 'Local file in src/content/posts/banners/',
        },
        { value: 'url', label: 'External URL' },
      ],
      initialValue: 'none',
    }),
  );

  let banner = null;
  let bannerAlt = null;
  let bannerCaption = null;
  if (bannerKind === 'local') {
    const file = abortIf(
      await text({
        message: 'Banner filename (relative to banners/)',
        initialValue: `${slug}.png`,
        validate: (v) => (!v?.trim() ? 'Required.' : undefined),
      }),
    );
    banner = `./banners/${file}`;
  } else if (bannerKind === 'url') {
    banner = abortIf(
      await text({
        message: 'Banner URL',
        validate: (v) => {
          try {
            new URL(v);
            return undefined;
          } catch {
            return 'Must be a valid URL.';
          }
        },
      }),
    );
  }
  if (banner) {
    bannerAlt = abortIf(
      await text({
        message: 'Banner alt text',
        validate: (v) => (!v?.trim() ? 'Alt text improves accessibility.' : undefined),
      }),
    );
    const wantCaption = abortIf(
      await confirm({ message: 'Add banner caption?', initialValue: false }),
    );
    if (wantCaption) {
      bannerCaption = abortIf(await text({ message: 'Banner caption' }));
    }
  }

  const components = abortIf(
    await multiselect({
      message: 'Insert component scaffolds (space to toggle)',
      options: [
        {
          value: 'callout',
          label: 'Callout',
          hint: 'Note, tip, warning, important, or TL;DR box',
        },
        {
          value: 'figure',
          label: 'Figure',
          hint: 'Image with optional caption',
        },
        {
          value: 'timeline',
          label: 'Timeline',
          hint: 'Forensic event table',
        },
        {
          value: 'llmChat',
          label: 'LlmChat + LlmTurn',
          hint: 'Animated chat transcript',
        },
        {
          value: 'githubCard',
          label: 'GitHubCard',
          hint: 'Live repo card',
        },
        {
          value: 'mermaid',
          label: 'Mermaid',
          hint: 'Diagram rendered client-side',
        },
        {
          value: 'references',
          label: 'References section',
          hint: 'H2 + empty list',
        },
        {
          value: 'footnote',
          label: 'Footnote example',
        },
      ],
      initialValues: archDefaults.components,
      required: false,
    }),
  );

  let calloutVariant = null;
  if (components.includes('callout')) {
    calloutVariant = abortIf(
      await select({
        message: 'Callout variant',
        options: [
          { value: 'note', label: 'Note' },
          { value: 'tip', label: 'Tip' },
          { value: 'warning', label: 'Warning' },
          { value: 'important', label: 'Important' },
          { value: 'tldr', label: 'TL;DR' },
        ],
        initialValue: 'note',
      }),
    );
  }

  let githubRepo = null;
  if (components.includes('githubCard')) {
    githubRepo = abortIf(
      await text({
        message: 'GitHub repo (owner/name)',
        placeholder: 'exfiltrace-labs/cbs_parser',
        validate: (v) =>
          !/^[\w.-]+\/[\w.-]+$/.test(v) ? 'Format: owner/name' : undefined,
      }),
    );
  }

  const filePath = join(POSTS_DIR, `${slug}.mdx`);

  const summaryLines = [
    `File:       ${relative(ROOT, filePath)}`,
    `URL:        /posts/${slug}/`,
    `Status:     ${status}`,
    `Comments:   ${commentsEnabled ? 'enabled' : 'disabled'}`,
  ];
  if (categories.length) summaryLines.push(`Categories: ${categories.join(', ')}`);
  if (tags.length) summaryLines.push(`Tags:       ${tags.join(', ')}`);
  if (series) summaryLines.push(`Series:     ${series} (#${seriesOrder})`);
  if (banner) summaryLines.push(`Banner:     ${banner}`);
  if (components.length) summaryLines.push(`Scaffolds:  ${components.join(', ')}`);
  note(summaryLines.join('\n'), 'Summary');

  const go = abortIf(
    await confirm({ message: 'Write file?', initialValue: true }),
  );
  if (!go) {
    cancel('Cancelled. Nothing was written.');
    process.exit(0);
  }

  const frontmatter = buildFrontmatter({
    title,
    description: description?.trim() || null,
    pubDate,
    tags,
    categories,
    status,
    commentsEnabled,
    banner,
    bannerAlt,
    bannerCaption,
    series,
    seriesOrder,
  });

  const body = buildBody(archetype, { components, calloutVariant, githubRepo });
  await writeFile(filePath, frontmatter + '\n' + body, 'utf8');

  const nextSteps = [
    `Created: ${relative(ROOT, filePath)}`,
    `Preview: npm run dev, then open /posts/${slug}/`,
  ];
  if (banner && banner.startsWith('./banners/')) {
    nextSteps.push(
      `Banner:  drop the image at src/content/posts/${banner.slice(2)}`,
    );
  }
  note(nextSteps.join('\n'), 'Next steps');

  outro('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
