import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthName(m: number): string {
  return MONTHS[m - 1] ?? '';
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export function postPath(post: Post): string {
  return `/posts/${post.id.replace(/\.(md|mdx)$/, '')}/`;
}

export function tagPath(tag: string): string {
  return `/tags/${encodeURIComponent(tag.toLowerCase())}/`;
}

export function monthPath(year: number, month: number): string {
  return `/archive/${year}/${pad2(month)}/`;
}

export async function getAllPosts(): Promise<Post[]> {
  const showDrafts = import.meta.env.DEV;
  const posts = await getCollection(
    'posts',
    ({ data }) => (showDrafts || !data.draft) && !data.unlisted,
  );
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getRoutablePosts(): Promise<Post[]> {
  const showDrafts = import.meta.env.DEV;
  const posts = await getCollection('posts', ({ data }) => showDrafts || !data.draft);
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function postsByTag(posts: Post[]): Map<string, Post[]> {
  const map = new Map<string, Post[]>();
  for (const p of posts) {
    for (const tag of p.data.tags) {
      const key = tag.toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
  }
  return map;
}

export interface ArchiveMonth {
  year: number;
  month: number;
  count: number;
  posts: Post[];
}

export interface ArchiveYear {
  year: number;
  months: ArchiveMonth[];
  count: number;
}

export function archiveTree(posts: Post[]): ArchiveYear[] {
  const byYM = new Map<string, ArchiveMonth>();
  for (const p of posts) {
    const d = p.data.pubDate;
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const key = `${y}-${m}`;
    const existing = byYM.get(key);
    if (existing) { existing.count++; existing.posts.push(p); }
    else byYM.set(key, { year: y, month: m, count: 1, posts: [p] });
  }
  const years = new Map<number, ArchiveYear>();
  for (const am of byYM.values()) {
    if (!years.has(am.year)) years.set(am.year, { year: am.year, months: [], count: 0 });
    const y = years.get(am.year)!;
    y.months.push(am);
    y.count += am.count;
  }
  const result = Array.from(years.values()).sort((a, b) => b.year - a.year);
  for (const y of result) {
    y.months.sort((a, b) => b.month - a.month);
    for (const m of y.months) {
      m.posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
    }
  }
  return result;
}

export interface TagCount {
  tag: string;
  count: number;
}

export function tagCounts(posts: Post[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const tag of p.data.tags) {
      const key = tag.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function adjacent(posts: Post[], current: Post): { prev?: Post; next?: Post } {
  const i = posts.findIndex((p) => p.id === current.id);
  if (i === -1) return {};
  // posts are sorted newest-first; "prev" = older, "next" = newer
  return {
    prev: posts[i + 1],
    next: posts[i - 1],
  };
}

const WORDS_PER_MINUTE = 220;
export function readingTimeMinutes(post: { body?: string }): number {
  const body = (post.body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>`~|]/g, ' ');
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function relatedPosts(current: Post, all: Post[], count = 3): Post[] {
  const currentTags = new Set(current.data.tags.map((t) => t.toLowerCase()));
  if (currentTags.size === 0) return [];
  const scored: { post: Post; score: number }[] = [];
  for (const p of all) {
    if (p.id === current.id) continue;
    let score = 0;
    for (const t of p.data.tags) if (currentTags.has(t.toLowerCase())) score++;
    if (score > 0) scored.push({ post: p, score });
  }
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf();
  });
  return scored.slice(0, count).map((s) => s.post);
}

export function slugifyCategory(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, '-');
}

export function categoryPath(slugs: string[]): string {
  return `/categories/${slugs.map(encodeURIComponent).join('/')}/`;
}

export function parseCategory(raw: string): string[] {
  return raw.split('/').map((s) => s.trim()).filter(Boolean);
}

export interface CategoryNode {
  name: string;
  slug: string;
  path: string[];
  directPosts: Post[];
  children: Map<string, CategoryNode>;
}

export function categoryTree(posts: Post[]): CategoryNode {
  const root: CategoryNode = { name: '', slug: '', path: [], directPosts: [], children: new Map() };
  for (const p of posts) {
    for (const raw of p.data.categories) {
      const parts = parseCategory(raw);
      if (parts.length === 0) continue;
      let node = root;
      for (let i = 0; i < parts.length; i++) {
        const slug = slugifyCategory(parts[i]);
        let child = node.children.get(slug);
        if (!child) {
          child = {
            name: parts[i],
            slug,
            path: [...node.path, slug],
            directPosts: [],
            children: new Map(),
          };
          node.children.set(slug, child);
        }
        node = child;
      }
      node.directPosts.push(p);
    }
  }
  return root;
}

export function categoryDescendantPosts(node: CategoryNode): Post[] {
  const seen = new Map<string, Post>();
  const visit = (n: CategoryNode) => {
    for (const p of n.directPosts) seen.set(p.id, p);
    for (const c of n.children.values()) visit(c);
  };
  visit(node);
  return Array.from(seen.values()).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function findCategoryNode(root: CategoryNode, path: string[]): CategoryNode | undefined {
  let node = root;
  for (const seg of path) {
    const next = node.children.get(slugifyCategory(seg));
    if (!next) return undefined;
    node = next;
  }
  return node;
}

export function sortedChildren(node: CategoryNode): CategoryNode[] {
  return Array.from(node.children.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function seriesPosts(seriesName: string, all: Post[]): Post[] {
  return all
    .filter((p) => p.data.series === seriesName)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
}

export function excerpt(post: Post, max = 240): string {
  if (post.data.description) return post.data.description;
  const body = (post.body ?? '').replace(/^---[\s\S]*?---/, '');
  const stripped = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > max ? stripped.slice(0, max).trimEnd() + '…' : stripped;
}
