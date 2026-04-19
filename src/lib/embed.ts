export interface Embed { kind: 'youtube' | 'vimeo'; id: string; src: string; }

export function parseEmbed(url: string): Embed | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/);
  if (yt) {
    const id = yt[1];
    return { kind: 'youtube', id, src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) {
    const id = vm[1];
    return { kind: 'vimeo', id, src: `https://player.vimeo.com/video/${id}` };
  }
  return null;
}
