export interface GitHubRepo {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  pushedAt: Date | null;
  visibility: 'public' | 'private' | 'internal';
}

export async function fetchRepo(slug: string, timeoutMs = 5000): Promise<GitHubRepo | null> {
  const parts = slug.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    console.warn(`[github] invalid repo slug "${slug}", expected "owner/name"`);
    return null;
  }
  const [owner, name] = parts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'forensicate.net-build',
      },
    });
    if (!res.ok) {
      console.warn(`[github] fetch returned ${res.status} for ${slug}`);
      return null;
    }
    const data = await res.json();
    return {
      owner: data.owner?.login ?? owner,
      name: data.name ?? name,
      fullName: data.full_name ?? `${owner}/${name}`,
      url: data.html_url ?? `https://github.com/${owner}/${name}`,
      description: data.description ?? null,
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      language: data.language ?? null,
      pushedAt: data.pushed_at ? new Date(data.pushed_at) : null,
      visibility: (data.visibility as 'public' | 'private' | 'internal') ?? 'public',
    };
  } catch (err) {
    console.warn(`[github] fetch failed for ${slug}:`, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
