export interface YtVideo {
  id: string;
  title: string;
  url: string;
  published: Date;
  description: string;
}

function parseFeed(xml: string, limit: number): YtVideo[] {
  const entries = xml.split(/<entry>/).slice(1);
  const out: YtVideo[] = [];
  for (const e of entries) {
    const idMatch = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = e.match(/<title>([^<]+)<\/title>/);
    const pubMatch = e.match(/<published>([^<]+)<\/published>/);
    const descMatch = e.match(/<media:description>([\s\S]*?)<\/media:description>/);
    if (!idMatch || !titleMatch || !pubMatch) continue;
    out.push({
      id: idMatch[1],
      title: titleMatch[1],
      url: `https://www.youtube.com/watch?v=${idMatch[1]}`,
      published: new Date(pubMatch[1]),
      description: (descMatch ? descMatch[1] : '').trim(),
    });
    if (out.length >= limit) break;
  }
  return out;
}

export async function fetchPlaylistVideos(playlistId: string, limit = 6, timeoutMs = 5000): Promise<YtVideo[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[youtube] feed fetch returned ${res.status} for playlist ${playlistId}`);
      return [];
    }
    const xml = await res.text();
    return parseFeed(xml, limit);
  } catch (err) {
    console.warn(`[youtube] feed fetch failed for playlist ${playlistId}:`, err);
    return [];
  } finally {
    clearTimeout(timer);
  }
}
